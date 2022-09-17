use wasm_bindgen::prelude::*;

// #[wasm_bindgen]
// extern {
//     pub fn alert(s: &str);
// }

use instrument::oscillator::*;
use instrument::*;
use note::*;
use rsound_output::{audio::PcmRenderer, Buffer};

#[wasm_bindgen]
pub fn play() -> Vec<f32> {
    let sound = chain(note![A: C3, 1 / 4]);
    graph(&sound);
    sound.iter().map(|&x| x as f32).collect()
}

#[wasm_bindgen]
pub fn draw() -> String {
    let sound = chain(note![A: C3, 1 / 4]);
    graph(&sound)
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
