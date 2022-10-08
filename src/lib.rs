use wasm_bindgen::prelude::*;

mod syntherpreter;
pub use syntherpreter::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn console_log(s: &str);
}

use instrument::generator::Signal;
use instrument::oscillator::*;
use instrument::*;
use note::*;
use rsound_output::Buffer; // TODO: refactor PcmRenderer into f32 buffer getter for web audio and
                           // add it here

#[wasm_bindgen]
pub fn play(
    tone: JsValue,
    instrument: JsValue,
    params: Vec<JsValue>,
    mods: Vec<JsValue>,
) -> Vec<f32> {
    let tone: ToneData = serde_wasm_bindgen::from_value(tone).unwrap();
    let data: InstrumentRawData = serde_wasm_bindgen::from_value(instrument).unwrap();
    let mut terp = Syntherpreter::new(data);

    for param in params {
        let p: SynthParam = serde_wasm_bindgen::from_value(param.clone()).unwrap();
        terp.synth_params.push(p);
    }
    for modulator in mods {
        let m: ModulatorRawData = serde_wasm_bindgen::from_value(modulator).unwrap();
        terp.modulators.push(m);
    }

    let synth = terp.get_synth();

    let n = Note::Tone(tone.pitch.into(), tone.octave.into(), val![1 / 4]);
    let sound = synth.play(90.0, n, 1.0);
    sound.iter().map(|&x| x as f32).collect()
}

#[wasm_bindgen]
pub fn draw(
    tone: JsValue,
    instrument: JsValue,
    params: Vec<JsValue>,
    mods: Vec<JsValue>,
) -> Vec<u8> {
    let tone: ToneData = serde_wasm_bindgen::from_value(tone).unwrap();
    let data: InstrumentRawData = serde_wasm_bindgen::from_value(instrument).unwrap();
    let mut terp = Syntherpreter::new(data);

    for param in params {
        let p: SynthParam = serde_wasm_bindgen::from_value(param.clone()).unwrap();
        terp.synth_params.push(p);
    }
    for modulator in mods {
        let m: ModulatorRawData = serde_wasm_bindgen::from_value(modulator).unwrap();
        terp.modulators.push(m);
    }

    let synth = terp.get_synth();

    let n = Note::Tone(tone.pitch.into(), tone.octave.into(), val![1 / 4]);
    let sound = synth.play(90.0, n, 1.0);
    graph(&sound)
}

#[wasm_bindgen]
pub fn draw_lfo(raw: JsValue) -> Vec<u8> {
    let modulator: ModulatorRawData = serde_wasm_bindgen::from_value(raw).unwrap();
    let cycle: Samples = Hz(20.0).as_samples();
    let cap_size = *cycle * 5.0;

    let freq = modulator.freq as f64;
    let sample_len = {
        let duration = if let Some(env) = modulator.env {
            let envelope: Box<dyn envelope::Envelope> = env.into();
            // Two ELFO envelope repeat cycles
            let cycle: Samples = Secs(envelope.min()).as_samples();
            *cycle * 2.0
        } else {
            cap_size
        };
        duration
    } as usize;
    let osc: Box<dyn Signal> = modulator.into();
    let mut data = vec![0.0; sample_len];
    for i in 0..sample_len {
        let t: Secs = Samples(i as f64).into();
        data[i] = osc.value_at(*t, freq);
    }

    graph(&data)
}

#[wasm_bindgen]
pub fn draw_env(raw: JsValue) -> Vec<u8> {
    let data: EnvelopeRawData = serde_wasm_bindgen::from_value(raw).unwrap();
    let env: Box<dyn envelope::Envelope> = data.into();
    let sample_len = *Secs(env.min()).as_samples() as usize;
    // TODO: handle zero-length sample_len (E.g. for fixed)
    let mut result = vec![0.0; sample_len];
    for i in 0..sample_len {
        let t: Secs = Samples(i as f64).into();
        result[i] = env.value_at(*t, 1.0);
    }
    graph(&result)
}

pub fn get_synth_sound(tone: i32, base: i32, mods: Vec<JsValue>) -> Vec<f64> {
    let pc = match tone {
        0 => PitchClass::C,
        1 => PitchClass::Cis,
        2 => PitchClass::D,
        3 => PitchClass::Dis,
        4 => PitchClass::E,
        5 => PitchClass::F,
        6 => PitchClass::Fis,
        7 => PitchClass::G,
        8 => PitchClass::Gis,
        9 => PitchClass::A,
        10 => PitchClass::B,
        11 => PitchClass::H,
        _ => todo!(),
    };
    let n = Note::Tone(pc, Octave::C3, val![1 / 4]);

    let envelope = envelope::ASR::new(0.015, 0.7, 0.2);
    let mut chain = match base {
        1 => generator::chain::Chain::new(Oscillator::Square),
        _ => generator::chain::Chain::new(Oscillator::Sine),
    };
    for res in mods {
        let modulator: ModulatorRawData = serde_wasm_bindgen::from_value(res).unwrap();
        match modulator.op.into() {
            ModulatorOp::Add => chain.add_box(modulator.into()),
            ModulatorOp::Sub => chain.sub_box(modulator.into()),
        };
    }

    let synth = Instrument::new(chain, envelope);
    synth.play(90.0, n, 1.0)
}

use graph::svg::Renderer;
use graph::{Block, Graph, Line};
use rsound_output::OutputRenderer;

fn graph(sound: &[f64]) -> Vec<u8> {
    let minimum = sound
        .iter()
        .filter_map(|&x| Some(x))
        .reduce(f64::min)
        .expect("there has to be minimum");
    let values: Vec<Block> = sound
        .iter()
        .step_by(10)
        .map(|y| Block::new(1.0, y + minimum.abs()))
        .collect();

    let graph = Line::new(&values);
    let mut renderer = Renderer::new(graph.size());
    graph.draw(&mut renderer);

    let mut out = Vec::new();
    if let Some(mut header) = renderer.get_header() {
        out.append(&mut header);
    }
    out.append(&mut renderer.get_buffer().to_vec());
    if let Some(mut footer) = renderer.get_footer() {
        out.append(&mut footer);
    }

    out
}
