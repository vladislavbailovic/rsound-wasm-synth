use crate::SAMPLE_RATE;
use std::ops::Deref;

#[derive(PartialEq, Debug, Clone)]
pub struct Hz(pub f64);

impl Deref for Hz {
    type Target = f64;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<Hz> for i32 {
    fn from(x: Hz) -> i32 {
        *x as i32
    }
}

impl Hz {
    pub fn as_secs(&self) -> Secs {
        self.clone().into()
    }
    pub fn as_samples(&self) -> Samples {
        self.as_secs().into()
    }
}

#[derive(PartialEq, Debug, Clone)]
pub struct Secs(pub f64);

impl Deref for Secs {
    type Target = f64;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<Secs> for i32 {
    fn from(x: Secs) -> i32 {
        *x as i32
    }
}

impl From<Hz> for Secs {
    fn from(x: Hz) -> Self {
        Self(1.0 / *x)
    }
}

impl Secs {
    pub fn as_samples(&self) -> Samples {
        self.clone().into()
    }
}

#[derive(PartialEq, Debug)]
pub struct Samples(pub f64);

impl Deref for Samples {
    type Target = f64;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<Samples> for i32 {
    fn from(x: Samples) -> i32 {
        *x as i32
    }
}

impl From<Secs> for Samples {
    fn from(x: Secs) -> Self {
        Self(*x * SAMPLE_RATE as f64)
    }
}

impl From<Samples> for Secs {
    fn from(x: Samples) -> Self {
        Self(*x / SAMPLE_RATE as f64)
    }
}

#[cfg(test)]
mod hz {
    use super::*;

    #[test]
    fn hz_deref() {
        let rate = Hz(SAMPLE_RATE as f64);
        assert_eq!(*rate, SAMPLE_RATE as f64);
    }

    #[test]
    fn hz_into_i32() {
        let rate = Hz(SAMPLE_RATE as f64);
        let conv: i32 = rate.into();
        assert_eq!(conv, SAMPLE_RATE);
    }

    #[test]
    fn hz_to_secs() {
        let hz = Hz(2.0);
        let secs: Secs = hz.into();
        assert_eq!(secs, Secs(0.5));
        assert_eq!(secs, hz.secs());

        let hz = Hz(4.0);
        let secs: Secs = hz.into();
        assert_eq!(secs, Secs(0.25));

        let hz = Hz(5.0);
        let secs: Secs = hz.into();
        assert_eq!(secs, Secs(0.2));

        let hz = Hz(10.0);
        let secs: Secs = hz.into();
        assert_eq!(secs, Secs(0.1));
    }
}

#[cfg(test)]
mod samples {
    use super::*;

    #[test]
    fn secs_to_samples() {
        let secs = Secs(0.5);
        let samples: Samples = secs.into();
        assert_eq!(Samples(SAMPLE_RATE as f64 / 2.0), samples);
    }

    #[test]
    fn samples_into_secs() {
        let samples = Samples(SAMPLE_RATE as f64);
        let secs: Secs = samples.into();
        assert_eq!(secs, Secs(1.0));
    }
}
