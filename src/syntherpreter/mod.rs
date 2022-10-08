mod units;
pub use units::*;
mod modulator;
pub use modulator::*;
mod envelope;
pub use envelope::*;
mod synth;
pub use synth::*;

use instrument::{self, generator};

pub struct Syntherpreter {
    instrument: InstrumentRawData,
    pub(crate) synth_params: Vec<SynthParam>,
    pub(crate) modulators: Vec<ModulatorRawData>,
}
impl Default for Syntherpreter {
    fn default() -> Self {
        Self {
            instrument: InstrumentRawData::default(),
            synth_params: Vec::new(),
            modulators: Vec::new(),
        }
    }
}

impl Syntherpreter {
    pub fn new(data: InstrumentRawData) -> Self {
        Self {
            instrument: data,
            ..Default::default()
        }
    }

    pub fn get_synth(&self) -> instrument::Instrument {
        let envelope: Box<dyn instrument::envelope::Envelope> = self.instrument.envelope.into();
        let generator_type: GeneratorType = self.instrument.generator.into();
        let generator: Box<dyn generator::Generator> = match generator_type {
            GeneratorType::Detuned => {
                let osc = self.oscillator();
                let synth: Box<dyn generator::Generator> =
                    if let Some(semis) = self.value(SynthParamType::DetuneSemitones) {
                        Box::new(generator::detuned::Semitones::new(osc, semis))
                    } else {
                        let freq = if let Some(hz) = self.value(SynthParamType::DetuneHz) {
                            hz
                        } else {
                            20
                        };
                        Box::new(generator::detuned::Freq::new(osc, freq as f64))
                    };
                synth
            }
            GeneratorType::Chain => {
                let osc = self.oscillator();
                let mut synth = generator::chain::Chain::new(osc);
                for modulator in self.modulators.clone() {
                    match modulator.op.into() {
                        ModulatorOp::Add => synth.add_box(modulator.into()),
                        ModulatorOp::Sub => synth.sub_box(modulator.into()),
                    };
                }
                Box::new(synth)
            }
            _ => {
                let osc = self.oscillator();
                Box::new(generator::simple::Simple::new(osc))
            }
        };
        instrument::Instrument::new_boxed(generator, envelope)
    }

    pub fn value(&self, kind: SynthParamType) -> Option<i32> {
        self.synth_params
            .iter()
            .filter_map(|x| {
                let xkind: SynthParamType = x.kind.into();
                if xkind == kind {
                    Some(x.value)
                } else {
                    None
                }
            })
            .next()
            .unwrap_or(None)
    }

    pub fn oscillator(&self) -> instrument::oscillator::Oscillator {
        self.value(SynthParamType::Oscillator)
            .unwrap_or(instrument::oscillator::Oscillator::Sine as i32)
            .into()
    }
}
