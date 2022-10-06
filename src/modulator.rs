use instrument::{envelope, oscillator::Oscillator};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ModulatorRawData {
    #[wasm_bindgen(readonly)]
    pub op: i32,
    #[wasm_bindgen(readonly)]
    pub kind: i32,
    #[wasm_bindgen(readonly)]
    pub shape: i32,
    #[wasm_bindgen(readonly)]
    pub freq: i32,
    #[wasm_bindgen(readonly)]
    pub env: Option<EnvelopeRawData>,
}

#[wasm_bindgen]
impl ModulatorRawData {
    #[wasm_bindgen(constructor)]
    pub fn new(
        op: Option<ModulatorOp>,
        kind: Option<ModulatorKind>,
        shape: Option<Oscillator>,
        freq: Option<i32>,
        envelope: Option<EnvelopeRawData>,
    ) -> Self {
        let env = if let Some(ModulatorKind::ELFO) = kind {
            if envelope.is_none() {
                Some(EnvelopeRawData::default())
            } else {
                envelope
            }
        } else {
            None
        };
        ModulatorRawData {
            op: (op.unwrap_or(ModulatorOp::Add)) as i32,
            kind: (kind.unwrap_or(ModulatorKind::LFO)) as i32,
            shape: (shape.unwrap_or(Oscillator::Sine)) as i32,
            freq: (freq.unwrap_or(0)),
            env,
        }
    }

    #[wasm_bindgen(setter)]
    pub fn set_freq(&mut self, freq: i32) {
        self.freq = freq;
    }

    #[wasm_bindgen(setter)]
    pub fn set_shape(&mut self, shape: Oscillator) {
        self.shape = shape as i32;
    }

    fn to_lfo(&self) -> instrument::lfo::LFO {
        match self.shape.into() {
            Oscillator::Sine => instrument::lfo::LFO::sine(self.freq as f64),
            Oscillator::Square => instrument::lfo::LFO::square(self.freq as f64),
            Oscillator::Triangle => instrument::lfo::LFO::triangle(self.freq as f64),
            Oscillator::Saw => instrument::lfo::LFO::saw(self.freq as f64),
        }
    }

    fn to_elfo(&self) -> instrument::lfo::ELFO {
        let modulator = match self.shape.into() {
            Oscillator::Sine => instrument::lfo::ELFO::sine(self.freq as f64),
            Oscillator::Square => instrument::lfo::ELFO::square(self.freq as f64),
            Oscillator::Triangle => instrument::lfo::ELFO::triangle(self.freq as f64),
            Oscillator::Saw => instrument::lfo::ELFO::saw(self.freq as f64),
        };
        if let Some(e) = self.env {
            let env: Box<dyn envelope::Envelope> = e.into();
            return modulator.with_env_box(env);
        }
        modulator.with_envelope(envelope::ASR::new(0.3, 0.15, 0.2))
    }
}

impl From<ModulatorRawData> for Box<dyn instrument::generator::Signal> {
    fn from(x: ModulatorRawData) -> Box<dyn instrument::generator::Signal> {
        match x.kind.into() {
            ModulatorKind::LFO => Box::new(x.to_lfo()),
            ModulatorKind::ELFO => Box::new(x.to_elfo()),
        }
    }
}

// TODO: make ModulatorRawData => (E)LFO conversion safe through typesystem

#[derive(Serialize, Deserialize, Debug, Copy, Clone)]
#[wasm_bindgen]
pub struct EnvelopeRawData {
    #[wasm_bindgen(readonly)]
    pub kind: i32,
    #[wasm_bindgen(readonly)]
    pub delay: Option<i32>,
    #[wasm_bindgen(readonly)]
    pub attack: Option<i32>,
    #[wasm_bindgen(readonly)]
    pub sustain: Option<i32>,
    #[wasm_bindgen(readonly)]
    pub release: Option<i32>,
}

impl Default for EnvelopeRawData {
    fn default() -> Self {
        Self {
            kind: EnvelopeKind::Fixed as i32,
            delay: None,
            attack: None,
            sustain: None,
            release: None,
        }
    }
}

#[wasm_bindgen]
pub enum EnvelopeKind {
    Fixed,
    RAR,
    DRAR,
    ASR,
    DASR,
}

impl From<i32> for EnvelopeKind {
    fn from(x: i32) -> EnvelopeKind {
        match x {
            1 => EnvelopeKind::RAR,
            2 => EnvelopeKind::DRAR,
            3 => EnvelopeKind::ASR,
            4 => EnvelopeKind::DASR,
            _ => EnvelopeKind::Fixed,
        }
    }
}

#[wasm_bindgen]
pub struct EnvelopeFactory;

#[wasm_bindgen]
impl EnvelopeFactory {
    #[wasm_bindgen(js_name = Fixed)]
    pub fn fixed() -> EnvelopeRawData {
        EnvelopeRawData {
            kind: EnvelopeKind::Fixed as i32,
            ..EnvelopeRawData::default()
        }
    }
    #[wasm_bindgen(js_name = RAR)]
    pub fn rar(a: i32, r: i32) -> EnvelopeRawData {
        EnvelopeRawData {
            kind: EnvelopeKind::RAR as i32,
            attack: Some(a),
            release: Some(r),
            ..EnvelopeRawData::default()
        }
    }
    #[wasm_bindgen(js_name = DRAR)]
    pub fn drar(d: i32, a: i32, r: i32) -> EnvelopeRawData {
        EnvelopeRawData {
            kind: EnvelopeKind::DRAR as i32,
            delay: Some(d),
            attack: Some(a),
            release: Some(r),
            ..EnvelopeRawData::default()
        }
    }
    #[wasm_bindgen(js_name = ASR)]
    pub fn asr(a: i32, s: i32, r: i32) -> EnvelopeRawData {
        EnvelopeRawData {
            kind: EnvelopeKind::ASR as i32,
            attack: Some(a),
            sustain: Some(s),
            release: Some(r),
            ..EnvelopeRawData::default()
        }
    }
    #[wasm_bindgen(js_name = DASR)]
    pub fn dasr(d: i32, a: i32, s: i32, r: i32) -> EnvelopeRawData {
        EnvelopeRawData {
            kind: EnvelopeKind::DASR as i32,
            delay: Some(d),
            attack: Some(a),
            sustain: Some(s),
            release: Some(r),
        }
    }
}

impl From<EnvelopeRawData> for Box<dyn envelope::Envelope> {
    fn from(x: EnvelopeRawData) -> Box<dyn envelope::Envelope> {
        match x.kind.into() {
            EnvelopeKind::RAR => Box::new(envelope::RAR::new(
                x.attack.unwrap() as f64 / 1000.0,
                x.release.unwrap() as f64 / 1000.0,
            )),
            EnvelopeKind::DRAR => Box::new(envelope::DRAR::new(
                x.delay.unwrap() as f64 / 1000.0,
                x.sustain.unwrap() as f64 / 1000.0,
                x.release.unwrap() as f64 / 1000.0,
            )),
            EnvelopeKind::ASR => Box::new(envelope::ASR::new(
                x.attack.unwrap() as f64 / 1000.0,
                x.sustain.unwrap() as f64 / 1000.0,
                x.release.unwrap() as f64 / 1000.0,
            )),
            EnvelopeKind::DASR => Box::new(envelope::DASR::new(
                x.delay.unwrap() as f64 / 1000.0,
                x.attack.unwrap() as f64 / 1000.0,
                x.sustain.unwrap() as f64 / 1000.0,
                x.release.unwrap() as f64 / 1000.0,
            )),
            _ => Box::new(envelope::Fixed {}),
        }
    }
}

#[wasm_bindgen]
pub enum ModulatorOp {
    Add,
    Sub,
}

impl From<i32> for ModulatorOp {
    fn from(x: i32) -> Self {
        match x {
            1 => Self::Sub,
            _ => Self::Add,
        }
    }
}

#[wasm_bindgen]
pub enum ModulatorKind {
    LFO,
    ELFO,
}

impl From<i32> for ModulatorKind {
    fn from(x: i32) -> Self {
        match x {
            1 => Self::ELFO,
            _ => Self::LFO,
        }
    }
}

#[cfg(test)]
mod test_modulator_op {
    use super::*;

    #[test]
    fn raw_data_op_into_modulator_op_add() {
        let x = ModulatorRawData {
            op: 0,
            kind: 0,
            shape: 0,
            freq: 0,
            env: None,
        };
        match x.op.into() {
            ModulatorOp::Add => assert!(true),
            ModulatorOp::Sub => assert!(false, "should have been Add"),
        };
    }

    #[test]
    fn raw_data_op_into_modulator_op_sub() {
        let x = ModulatorRawData {
            op: 1,
            kind: 0,
            shape: 0,
            freq: 0,
            env: None,
        };
        match x.op.into() {
            ModulatorOp::Add => assert!(false, "should have been Sub"),
            ModulatorOp::Sub => assert!(true),
        };
    }

    #[test]
    fn raw_data_op_into_modulator_op_defaults_to_add() {
        let x = ModulatorRawData {
            op: 1312,
            kind: 0,
            shape: 0,
            freq: 0,
            env: None,
        };
        match x.op.into() {
            ModulatorOp::Add => assert!(true),
            ModulatorOp::Sub => assert!(false, "should have been Add"),
        };
    }
}

#[cfg(test)]
mod test_modulator_kind {
    use super::*;

    #[test]
    fn raw_data_kind_into_modulator_kind_lfo() {
        let x = ModulatorRawData {
            op: 0,
            kind: 0,
            shape: 0,
            freq: 0,
            env: None,
        };
        match x.kind.into() {
            ModulatorKind::LFO => assert!(true),
            ModulatorKind::ELFO => assert!(false, "should have been LFO"),
        };
    }

    #[test]
    fn raw_data_kind_into_modulator_kind_elfo() {
        let x = ModulatorRawData {
            op: 0,
            kind: 1,
            shape: 0,
            freq: 0,
            env: None,
        };
        match x.kind.into() {
            ModulatorKind::LFO => assert!(false, "should have been ELFO"),
            ModulatorKind::ELFO => assert!(true),
        };
    }

    #[test]
    fn raw_data_kind_into_modulator_kind_defaults_to_lfo() {
        let x = ModulatorRawData {
            op: 0,
            kind: 1312,
            shape: 0,
            freq: 0,
            env: None,
        };
        match x.kind.into() {
            ModulatorKind::LFO => assert!(true),
            ModulatorKind::ELFO => assert!(false, "should have been LFO"),
        };
    }
}

#[cfg(test)]
mod test_oscillator_shape {
    use super::*;
    use instrument::oscillator::*;

    #[test]
    fn raw_data_shape_into_oscillator_shape_sine() {
        let x = ModulatorRawData {
            op: 0,
            kind: 0,
            shape: 0,
            freq: 0,
            env: None,
        };
        match x.shape.into() {
            Oscillator::Sine => assert!(true),
            Oscillator::Square => assert!(false, "Should have been Sine"),
            Oscillator::Triangle => assert!(false, "Should have been Sine"),
            Oscillator::Saw => assert!(false, "Should have been Sine"),
        };
    }

    #[test]
    fn raw_data_shape_into_oscillator_shape_square() {
        let x = ModulatorRawData {
            op: 0,
            kind: 0,
            shape: 1,
            freq: 0,
            env: None,
        };
        match x.shape.into() {
            Oscillator::Sine => assert!(false, "Should have been Square"),
            Oscillator::Square => assert!(true),
            Oscillator::Triangle => assert!(false, "Should have been Square"),
            Oscillator::Saw => assert!(false, "Should have been Square"),
        };
    }

    #[test]
    fn raw_data_shape_into_oscillator_shape_triangle() {
        let x = ModulatorRawData {
            op: 0,
            kind: 0,
            shape: 2,
            freq: 0,
            env: None,
        };
        match x.shape.into() {
            Oscillator::Sine => assert!(false, "Should have been Triangle"),
            Oscillator::Square => assert!(false, "Should have been Triangle"),
            Oscillator::Triangle => assert!(true),
            Oscillator::Saw => assert!(false, "Should have been Triangle"),
        };
    }

    #[test]
    fn raw_data_shape_into_oscillator_shape_saw() {
        let x = ModulatorRawData {
            op: 0,
            kind: 0,
            shape: 3,
            freq: 0,
            env: None,
        };
        match x.shape.into() {
            Oscillator::Sine => assert!(false, "Should have been Saw"),
            Oscillator::Square => assert!(false, "Should have been Saw"),
            Oscillator::Triangle => assert!(false, "Should have been Saw"),
            Oscillator::Saw => assert!(true),
        };
    }

    #[test]
    fn raw_data_shape_into_oscillator_shape_defaults_to_sine() {
        let x = ModulatorRawData {
            op: 0,
            kind: 0,
            shape: 1312,
            freq: 0,
            env: None,
        };
        match x.shape.into() {
            Oscillator::Sine => assert!(true),
            Oscillator::Square => assert!(false, "Should have been Sine"),
            Oscillator::Triangle => assert!(false, "Should have been Sine"),
            Oscillator::Saw => assert!(false, "Should have been Sine"),
        };
    }
}
