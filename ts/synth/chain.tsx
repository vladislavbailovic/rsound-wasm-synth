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
import './chain.css';

export const Synth = ({ type }: { type: string }): JSX.Element => {
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
      </div>
      {next}
    </div>
  );
};
