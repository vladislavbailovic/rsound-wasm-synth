use super::EnvelopeRawData;
use instrument::{envelope, oscillator::Oscillator};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
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

    #[wasm_bindgen(setter)]
    pub fn set_env(&mut self, env: EnvelopeRawData) {
        self.env = Some(env);
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
