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
