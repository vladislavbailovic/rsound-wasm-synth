use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct ModulatorRawData {
    pub op: i32,
    pub kind: i32,
    pub shape: i32,
    pub freq: i32,
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
        };
        match x.shape.into() {
            Oscillator::Sine => assert!(true),
            Oscillator::Square => assert!(false, "Should have been Sine"),
            Oscillator::Triangle => assert!(false, "Should have been Sine"),
            Oscillator::Saw => assert!(false, "Should have been Sine"),
        };
    }
}
