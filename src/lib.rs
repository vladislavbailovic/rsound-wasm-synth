use wasm_bindgen::prelude::*;

// #[wasm_bindgen]
// extern {
//     pub fn alert(s: &str);
// }

use instrument::oscillator::*;
use instrument::generator::Signal;
use instrument::*;
use note::*;
use rsound_output::{audio::PcmRenderer, Buffer};

use serde::{Serialize, Deserialize};
#[derive(Serialize, Deserialize)]
pub struct Modulator {
    pub kind: i32,
    pub shape: i32,
    pub freq: i32,
}

#[wasm_bindgen]
pub fn play(tone: i32, base: i32, mods: Vec<JsValue>) -> Vec<f32> {
    // let sound = rack(note![A: C3, 1 / 4]);
    let sound = get_synth_sound(tone, base, mods);
    graph(&sound);
    sound.iter().map(|&x| x as f32).collect()
}

#[wasm_bindgen]
pub fn draw(tone: i32, base: i32, mods: Vec<JsValue>) -> String {
    // let sound = rack(note![A: C3, 1 / 4]);
    let sound = get_synth_sound(tone, base, mods);
    graph(&sound)
}

#[wasm_bindgen]
pub fn draw_oscillator() -> String {
    let sample_len = 1000;
    let osc = oscillator::Oscillator::Sine;
    let mut result = vec![0.0; sample_len];
    for i in 0..sample_len {
        let t = i as f64 / SAMPLE_RATE as f64;
        result[i] = osc.get(440.0).at(t);
    }
    graph(&result)
}

#[wasm_bindgen]
pub fn draw_lfo(shape: i32, freq: i32) -> String {
    let sample_len = 1000;
    let osc = match shape {
        1 => lfo::LFO::square(freq as f64),
        2 => lfo::LFO::triangle(freq as f64),
        3 => lfo::LFO::saw(freq as f64),
        _ => lfo::LFO::sine(freq as f64),
    };
    let mut result = vec![0.0; sample_len];
    for i in 0..sample_len {
        let t = i as f64 / SAMPLE_RATE as f64;
        result[i] = osc.value_at(t, 0.0);
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

    let envelope = envelope::ASR::new(0.015, 0.07);
    let mut chain = match base {
        1 => generator::chain::Chain::new(Oscillator::Square),
        _ => generator::chain::Chain::new(Oscillator::Sine)
    };
    for res in mods {
        let modulator: Modulator = serde_wasm_bindgen::from_value(res).unwrap();
        let m = match modulator.shape {
            1 => lfo::LFO::square(modulator.freq as f64),
            2 => lfo::LFO::triangle(modulator.freq as f64),
            3 => lfo::LFO::saw(modulator.freq as f64),
            _ => lfo::LFO::sine(modulator.freq as f64),
        };
        match modulator.kind {
            1 => chain.add(m),
            _ => chain.sub(m),
        };
    }

    let synth = Instrument::new(chain, envelope);
    synth.play(90.0, n, 1.0)
}

fn sine(note: Note) -> Vec<f64> {
    let envelope = envelope::ASR::new(0.015, 0.07);
    let synth = Instrument::new(generator::simple::Simple::default(), envelope);
    synth.play(90.0, note, 1.0)
}

fn chain(note: Note) -> Vec<f64> {
    let envelope = envelope::ASR::new(0.015, 0.07);
    let mut chain = generator::chain::Chain::new(Oscillator::Square);
    let elfo = lfo::ELFO::triangle(31.0).with_envelope(envelope::ASR::new(0.0, 0.15));
    chain.add(lfo::LFO::sine(12.0));
    chain.sub(lfo::LFO::triangle(131.0));
    chain.sub(elfo);
    let synth = Instrument::new(chain, envelope);
    synth.play(90.0, note, 1.0)
}

fn detuned(note: Note) -> Vec<f64> {
    let e1 = envelope::ASR::new(0.05, 0.05);

    let mut rack = Rack::default();
    let s1 = Instrument::new(generator::simple::Simple::default(), e1);
    rack.add(s1);
    let s2 = Instrument::new(generator::detuned::Semitones::square(3), envelope::Fixed {});
    rack.add(s2);

    let s3 = Instrument::new(generator::detuned::Freq::square(13.0), envelope::Fixed {});
    rack.add_with_volume(s3, 0.5);
    let s4 = Instrument::new(generator::detuned::Freq::square(-12.0), envelope::Fixed {});
    rack.add_with_volume(s4, 0.5);

    rack.play(90.0, note, 1.0)
}

fn rack(note: Note) -> Vec<f64> {
    let e1 = envelope::ASR::new(0.0, 0.1);
    let e2 = envelope::ASR::new(0.1, 0.0);

    let mut rack = Rack::default();
    let s1 = Instrument::new(generator::simple::Simple::default(), e1);
    rack.add(s1);
    let s2 = Instrument::new(generator::simple::Simple::square(), e2);
    rack.add(s2);
    rack.play(90.0, note, 1.0)
}

use graph::svg::Renderer;
use graph::{Block, Graph, Line};
use rsound_output::OutputRenderer;

fn graph(sound: &[f64]) -> String {
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

    let header = if let Some(header) = renderer.get_header() {
        if let Ok(buffer) = String::from_utf8(header) {
            buffer
        } else {
            String::new()
        }
    } else {
        String::new()
    };
    let footer = if let Some(footer) = renderer.get_footer() {
        if let Ok(buffer) = String::from_utf8(footer) {
            buffer
        } else {
            String::new()
        }
    } else {
        String::new()
    };
    let buffer = if let Ok(buffer) = String::from_utf8(renderer.get_buffer().to_vec()) {
        buffer
    } else {
        String::new()
    };
    format!("{}{}{}", header, buffer, footer)
}
