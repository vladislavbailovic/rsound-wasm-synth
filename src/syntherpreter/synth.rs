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
