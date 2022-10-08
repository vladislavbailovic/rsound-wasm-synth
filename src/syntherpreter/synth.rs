use super::EnvelopeRawData;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[wasm_bindgen(getter_with_clone)]
pub struct InstrumentRawData {
    #[wasm_bindgen(readonly)]
    pub envelope: EnvelopeRawData,
    #[wasm_bindgen(readonly)]
    pub generator: i32,
}

impl Default for InstrumentRawData {
    fn default() -> Self {
        Self {
            generator: GeneratorType::Simple as i32,
            envelope: EnvelopeRawData::default(),
        }
    }
}

#[wasm_bindgen]
impl InstrumentRawData {
    #[wasm_bindgen(constructor)]
    pub fn new(generator: GeneratorType, envelope: EnvelopeRawData) -> Self {
        Self {
            generator: generator as i32,
            envelope,
        }
    }

    #[wasm_bindgen(setter)]
    pub fn set_generator(&mut self, g: GeneratorType) {
        self.generator = g as i32;
    }

    #[wasm_bindgen]
    pub fn simple() -> Self {
        InstrumentRawData::default()
    }
}

#[wasm_bindgen]
#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
pub enum GeneratorType {
    Simple,
    Detuned,
    Chain,
    Rack,
}

impl From<i32> for GeneratorType {
    fn from(x: i32) -> Self {
        match x {
            1 => Self::Detuned,
            2 => Self::Chain,
            3 => Self::Rack,
            _ => Self::Simple,
        }
    }
}

#[wasm_bindgen]
#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
pub struct SynthParam {
    pub kind: i32,
    pub value: Option<i32>,
}

#[wasm_bindgen]
impl SynthParam {
    #[wasm_bindgen(constructor)]
    pub fn new(kind: SynthParamType, value: Option<i32>) -> Self {
        Self {
            kind: kind as i32,
            value,
        }
    }
}

#[wasm_bindgen]
#[derive(PartialEq)]
pub enum SynthParamType {
    Oscillator,
    DetuneHz,
    DetuneSemitones,
}

impl From<i32> for SynthParamType {
    fn from(x: i32) -> Self {
        match x {
            1 => Self::DetuneHz,
            2 => Self::DetuneSemitones,
            _ => Self::Oscillator,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[wasm_bindgen]
pub struct ToneData {
    #[wasm_bindgen(readonly)]
    pub pitch: i32,
    #[wasm_bindgen(readonly)]
    pub octave: i32,
}

#[wasm_bindgen]
impl ToneData {
    #[wasm_bindgen(constructor)]
    pub fn new(pitch: note::PitchClass, octave: note::Octave) -> Self {
        Self {
            pitch: pitch as i32,
            octave: octave as i32,
        }
    }

    #[wasm_bindgen(setter)]
    pub fn set_pitch(&mut self, pitch: note::PitchClass) {
        self.pitch = pitch as i32;
    }

    #[wasm_bindgen(setter)]
    pub fn set_octave(&mut self, octave: note::Octave) {
        self.octave = octave as i32;
    }
}
