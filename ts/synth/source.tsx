import React, { useContext } from 'react';
import { Display } from '../display';
import { SynthDataContext } from '../data';
import { Modulators, Next } from './modulator';
import { Envelope } from './envelope';
import {
  draw,
  GeneratorType,
  InstrumentRawData,
  ModulatorRawData,
  Oscillator,
  SynthParam,
  SynthParamType
} from '../../pkg/rsound_wasm_synth';
import './source.css';

export const Synth = (): JSX.Element => {
  const synthCtx = useContext(SynthDataContext);

  const graph = draw(
    synthCtx.data.tone,
    synthCtx.data.instrument,
    synthCtx.data.params,
    synthCtx.data.modulators
  );
  const blob = new Blob([graph], { type: 'image/svg+xml' });
  const tempUrl = window.URL.createObjectURL(blob);
  return (
    <>
      <Display id="graph" src={tempUrl} />
      <SynthSource />
      <Modulators modulators={synthCtx.data.modulators} />
    </>
  );
};

const SourceEnvelope = (): JSX.Element | null => {
  const synthCtx = useContext(SynthDataContext);
  const instrument = synthCtx.data.instrument;
  if (instrument == null) {
    return null;
  }

  const envelope = instrument.envelope;
  const changeDelay = (ms: number): void => {
    envelope.delay = ms;
    synthCtx.setData({
      ...synthCtx.data,
      instrument: new InstrumentRawData(instrument.generator, envelope)
    });
  };
  const changeAttack = (ms: number): void => {
    envelope.attack = ms;
    synthCtx.setData({
      ...synthCtx.data,
      instrument: new InstrumentRawData(instrument.generator, envelope)
    });
  };
  const changeSustain = (ms: number): void => {
    envelope.sustain = ms;
    synthCtx.setData({
      ...synthCtx.data,
      instrument: new InstrumentRawData(instrument.generator, envelope)
    });
  };
  const changeRelease = (ms: number): void => {
    envelope.release = ms;
    synthCtx.setData({
      ...synthCtx.data,
      instrument: new InstrumentRawData(instrument.generator, envelope)
    });
  };

  return (
    <Envelope
      envelope={envelope}
      changeDelay={changeDelay}
      changeAttack={changeAttack}
      changeSustain={changeSustain}
      changeRelease={changeRelease}
    />
  );
};

const SynthSource = (): JSX.Element | null => {
  const synthCtx = useContext(SynthDataContext);
  const instrument = synthCtx.data.instrument;
  if (instrument == null) {
    return null;
  }
  let shape = Oscillator.Sine;
  synthCtx.data.params.forEach((x) => {
    shape =
      x.kind === SynthParamType.Oscillator && x.value !== undefined
        ? x.value
        : shape;
  });

  let next = null;
  if (instrument.generator === GeneratorType.Chain) {
    next = <Next />;
  }

  let synthParams = null;
  if (instrument.generator === GeneratorType.Detuned) {
    synthParams = <SynthSpecificParams />;
  }

  const changeShape = (shape: Oscillator): void => {
    const params = [new SynthParam(SynthParamType.Oscillator, shape)]; // TODO: merge with existing params
    synthCtx.setData({ ...synthCtx.data, params });
  };
  const changeType = (kind: GeneratorType): void => {
    let instrument = InstrumentRawData.simple();
    const modulators: ModulatorRawData[] = [];
    if (synthCtx.data.instrument != null) {
      instrument = synthCtx.data.instrument;
    }
    instrument.generator = kind;
    synthCtx.setData({ ...synthCtx.data, instrument, modulators });
  };
  return (
    <div className="source">
      <div className="synth">
        <SourceEnvelope />
        <div className="params">
          <fieldset>
            <title>{GeneratorType[instrument.generator]}</title>

            {Object.entries(GeneratorType)
              .filter(([key, val]) => !isNaN(Number(val)))
              .map(([key, val]) => {
                const rkey = `${key}-${Number(val)}`;
                return (
                  <label key={rkey}>
                    <input
                      type="radio"
                      name="source-type"
                      value={Number(val)}
                      onChange={(e) => changeType(Number(val))}
                      checked={Number(val) === instrument.generator}
                    />
                    <span>{key}</span>
                  </label>
                );
              })}
          </fieldset>
        </div>

        <div className="params">
          <fieldset>
            <title>{Oscillator[shape]}</title>
            {Object.entries(Oscillator)
              .filter(([key, val]) => !isNaN(Number(val)))
              .map(([key, val]) => {
                const rkey = `${key}-${Number(val)}`;
                return (
                  <label key={rkey}>
                    <input
                      type="radio"
                      name="source-shape"
                      onChange={(e) => changeShape(Number(val))}
                      value={Number(val)}
                      checked={Number(val) === shape}
                    />
                    <span>{key}</span>
                  </label>
                );
              })}
          </fieldset>
        </div>

        {synthParams}
      </div>
      {next}
    </div>
  );
};

const SynthSpecificParams = (): JSX.Element => {
  const synthCtx = useContext(SynthDataContext);

  let detune = synthCtx.data.params.filter(
    (x) =>
      x.kind === SynthParamType.DetuneHz ||
      x.kind === SynthParamType.DetuneSemitones
  )[0];
  if (detune === undefined) {
    detune = new SynthParam(SynthParamType.DetuneHz, 0);
  }
  const detuneType =
    detune.kind === SynthParamType.DetuneHz
      ? SynthParamType.DetuneHz
      : SynthParamType.DetuneSemitones;

  const detuneUnit = detune.kind === SynthParamType.DetuneHz ? 'Hz' : 'Semis';
  const detuneValue = Number(detune.value);
  const detuneInput = (
    <input
      type="number"
      min="0"
      max="100"
      onChange={(e) => changeDetuneValue(Number(e.target.value))}
      value={isNaN(detuneValue) ? 0 : detuneValue}
    />
  );

  const getUpdatedParams = (x: SynthParam): SynthParam[] => {
    const params = [...synthCtx.data.params].filter(
      (y) =>
        y.kind !== SynthParamType.DetuneHz &&
        y.kind !== SynthParamType.DetuneSemitones
    );
    params.push(x);
    return params;
  };
  const changeDetuneType = (x: SynthParamType): void => {
    const params = getUpdatedParams(new SynthParam(x, 0));
    synthCtx.setData({ ...synthCtx.data, params });
  };
  const changeDetuneValue = (x: number): void => {
    const params = getUpdatedParams(new SynthParam(detune.kind, x));
    synthCtx.setData({ ...synthCtx.data, params });
  };

  return (
    <div className="params">
      <fieldset>
        <title>Detune</title>

        <label>
          <input
            type="radio"
            name="detune-type"
            value={SynthParamType.DetuneHz}
            onChange={(e) => changeDetuneType(SynthParamType.DetuneHz)}
            checked={detuneType === SynthParamType.DetuneHz}
          />
          <span>Hz</span>
        </label>

        <label>
          <input
            type="radio"
            name="detune-type"
            value={SynthParamType.DetuneSemitones}
            onChange={(e) => changeDetuneType(SynthParamType.DetuneSemitones)}
            checked={detuneType === SynthParamType.DetuneSemitones}
          />
          <span>Semitones</span>
        </label>

        <label>
          {detuneInput}
          <span>{detuneUnit}</span>
        </label>
      </fieldset>
    </div>
  );
};
