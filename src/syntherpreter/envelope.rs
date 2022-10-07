use instrument::envelope;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Debug, Copy, Clone, PartialEq)]
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

#[wasm_bindgen]
impl EnvelopeRawData {
    #[wasm_bindgen(setter)]
    pub fn set_delay(&mut self, ms: i32) {
        if ms > 0 {
            self.delay = Some(ms);
            self.kind = EnvelopeKind::from(self.kind).delayed() as i32;
        } else {
            self.delay = None;
            self.kind = EnvelopeKind::from(self.kind).non_delayed() as i32;
        }
    }
    #[wasm_bindgen(setter)]
    pub fn set_attack(&mut self, ms: i32) {
        self.attack = Some(ms);
    }
    #[wasm_bindgen(setter)]
    pub fn set_sustain(&mut self, ms: i32) {
        self.sustain = Some(ms);
    }
    #[wasm_bindgen(setter)]
    pub fn set_release(&mut self, ms: i32) {
        self.release = Some(ms);
    }
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
#[derive(Copy, Clone, PartialEq, Debug)]
pub enum EnvelopeKind {
    Fixed,
    RAR,
    DRAR,
    ASR,
    DASR,
}

impl From<i32> for EnvelopeKind {
    fn from(x: i32) -> Self {
        match x {
            1 => EnvelopeKind::RAR,
            2 => EnvelopeKind::DRAR,
            3 => EnvelopeKind::ASR,
            4 => EnvelopeKind::DASR,
            _ => EnvelopeKind::Fixed,
        }
    }
}

impl EnvelopeKind {
    fn delayed(&self) -> Self {
        match self {
            EnvelopeKind::RAR => EnvelopeKind::DRAR,
            EnvelopeKind::ASR => EnvelopeKind::DASR,
            _ => *self,
        }
    }

    fn non_delayed(&self) -> Self {
        match self {
            EnvelopeKind::DRAR => EnvelopeKind::RAR,
            EnvelopeKind::DASR => EnvelopeKind::ASR,
            _ => *self,
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

#[cfg(test)]
mod test_envelope_factory {
    use super::*;

    #[test]
    fn raw_data_kind_into_envelope_kind_fixed() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::Fixed as i32,
            ..EnvelopeRawData::default()
        };
        assert_eq!(data, EnvelopeFactory::fixed());
    }

    #[test]
    fn raw_data_kind_into_envelope_kind_rar() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::RAR as i32,
            attack: Some(13),
            release: Some(12),
            ..EnvelopeRawData::default()
        };
        assert_eq!(data, EnvelopeFactory::rar(13, 12));
    }

    #[test]
    fn raw_data_kind_into_envelope_kind_drar() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::DRAR as i32,
            delay: Some(161),
            attack: Some(13),
            release: Some(12),
            ..EnvelopeRawData::default()
        };
        assert_eq!(data, EnvelopeFactory::drar(161, 13, 12));
    }

    #[test]
    fn raw_data_kind_into_envelope_kind_asr() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::ASR as i32,
            attack: Some(13),
            sustain: Some(161),
            release: Some(12),
            ..EnvelopeRawData::default()
        };
        assert_eq!(data, EnvelopeFactory::asr(13, 161, 12));
    }

    #[test]
    fn raw_data_kind_into_envelope_kind_dasr() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::DASR as i32,
            delay: Some(1),
            attack: Some(13),
            sustain: Some(161),
            release: Some(12),
            ..EnvelopeRawData::default()
        };
        assert_eq!(data, EnvelopeFactory::dasr(1, 13, 161, 12));
    }
}

#[cfg(test)]
mod test_envelope_kind {
    use super::*;

    #[test]
    fn raw_data_kind_into_envelope_kind_fixed() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::Fixed as i32,
            ..EnvelopeRawData::default()
        };
        match data.kind.into() {
            EnvelopeKind::Fixed => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn raw_data_kind_into_envelope_kind_rar() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::RAR as i32,
            attack: Some(13),
            release: Some(12),
            ..EnvelopeRawData::default()
        };
        match data.kind.into() {
            EnvelopeKind::RAR => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn raw_data_kind_into_envelope_kind_drar() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::DRAR as i32,
            delay: Some(161),
            attack: Some(13),
            release: Some(12),
            ..EnvelopeRawData::default()
        };
        match data.kind.into() {
            EnvelopeKind::DRAR => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn raw_data_kind_into_envelope_kind_asr() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::ASR as i32,
            attack: Some(13),
            sustain: Some(161),
            release: Some(12),
            ..EnvelopeRawData::default()
        };
        match data.kind.into() {
            EnvelopeKind::ASR => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn raw_data_kind_into_envelope_kind_dasr() {
        let data = EnvelopeRawData {
            kind: EnvelopeKind::DASR as i32,
            delay: Some(1),
            attack: Some(13),
            sustain: Some(161),
            release: Some(12),
            ..EnvelopeRawData::default()
        };
        match data.kind.into() {
            EnvelopeKind::DASR => assert!(true),
            _ => assert!(false),
        }
    }
}

#[cfg(test)]
mod test_envelope_kind_delay_conversion {
    use super::*;

    #[test]
    fn fixed_should_stay_fixed() {
        let kind = EnvelopeKind::Fixed;
        assert_eq!(kind.delayed(), kind);
        assert_eq!(kind.non_delayed(), kind);
    }

    #[test]
    fn rar_to_drar() {
        let kind = EnvelopeKind::RAR;
        assert_eq!(kind.delayed(), EnvelopeKind::DRAR);
        assert_eq!(kind.non_delayed(), kind);
    }

    #[test]
    fn drar_to_rar() {
        let kind = EnvelopeKind::DRAR;
        assert_eq!(kind.non_delayed(), EnvelopeKind::RAR);
        assert_eq!(kind.delayed(), kind);
    }

    #[test]
    fn asr_to_dasr() {
        let kind = EnvelopeKind::ASR;
        assert_eq!(kind.delayed(), EnvelopeKind::DASR);
        assert_eq!(kind.non_delayed(), kind);
    }

    #[test]
    fn dasr_to_asr() {
        let kind = EnvelopeKind::DASR;
        assert_eq!(kind.non_delayed(), EnvelopeKind::ASR);
        assert_eq!(kind.delayed(), kind);
    }
}
