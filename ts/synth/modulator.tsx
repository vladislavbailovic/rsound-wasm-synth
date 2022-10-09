import React, { useContext } from 'react';
import { Display } from '../display';
import { Envelope } from './envelope';
import { SynthDataContext } from '../data';
import {
  draw_lfo,
  Oscillator,
  EnvelopeFactory,
  ModulatorKind,
  ModulatorOp,
  ModulatorRawData
} from '../../pkg/rsound_wasm_synth';
import './modulator.css';

export const Modulators = ({
  modulators
}: {
  modulators: ModulatorRawData[]
}): JSX.Element => (
  <div className="modulators">
    {modulators.map((mod, idx) => (
      <Modulator key={idx} modulator={mod} idx={idx} />
    ))}
  </div>
);

const Modulator = ({
  modulator,
  idx
}: {
  modulator: ModulatorRawData
  idx: number
}): JSX.Element => {
  const graph = draw_lfo(modulator);
  const blob = new Blob([graph], { type: 'image/svg+xml' });
  const tempUrl = window.URL.createObjectURL(blob);

  const operation = ModulatorOp[modulator.op];
  const kind = ModulatorKind[modulator.kind];

  const synthCtx = useContext(SynthDataContext);
  const del = (): void => {
    const modulators = [...synthCtx.data.modulators];
    modulators.splice(idx, 1);
    synthCtx.setData({ ...synthCtx.data, modulators });
  };
  const changeFreq = (hz: number): void => {
    const modulators = [...synthCtx.data.modulators];
    modulators[idx].freq = hz;
    synthCtx.setData({ ...synthCtx.data, modulators });
  };
  const changeShape = (shape: Oscillator): void => {
    const modulators = [...synthCtx.data.modulators];
    modulators[idx].shape = shape;
    synthCtx.setData({ ...synthCtx.data, modulators });
  };

  let envelope = null;
  if (modulator.kind === ModulatorKind.ELFO) {
    envelope = <ModulatorEnvelope modulator={modulator} idx={idx} />;
  }

  return (
    <div className="modulator-data">
      <div className="modulator">
        <div className="lfo">
          <div className="shape">
            <Display src={tempUrl} />
          </div>
          <div className="params">
            <fieldset>
              <title>
                {operation} {kind}
              </title>

              {Object.entries(Oscillator)
                .filter(([key, val]) => !isNaN(Number(val)))
                .map(([key, val]) => {
                  const rkey = `${key}-${Number(val)}`;
                  const name = `shape-${idx}`;
                  return (
                    <label key={rkey}>
                      <input
                        type="radio"
                        name={name}
                        onChange={(e) => changeShape(Number(val))}
                        value={Number(val)}
                        checked={Number(val) === modulator.shape}
                      />
                      <span>{key}</span>
                    </label>
                  );
                })}

              <label>
                <input
                  type="number"
                  value={modulator.freq}
                  onChange={(e) => changeFreq(Number(e.target.value))}
                  min="20"
                  max="20000"
                />
                <span>Hz</span>
              </label>
            </fieldset>
          </div>
        </div>
        {envelope}
      </div>
      <Next idx={idx} del={del} />
    </div>
  );
};

const ModulatorEnvelope = ({
  modulator,
  idx
}: {
  modulator: ModulatorRawData
  idx: number
}): JSX.Element | null => {
  const envelope = modulator.env;
  if (envelope == null) {
    return null;
  }
  const synthCtx = useContext(SynthDataContext);
  const changeDelay = (ms: number): void => {
    const modulators = [...synthCtx.data.modulators];
    envelope.delay = ms;
    modulators[idx].env = envelope;
    synthCtx.setData({ ...synthCtx.data, modulators });
  };
  const changeAttack = (ms: number): void => {
    const modulators = [...synthCtx.data.modulators];
    envelope.attack = ms;
    modulators[idx].env = envelope;
    synthCtx.setData({ ...synthCtx.data, modulators });
  };
  const changeSustain = (ms: number): void => {
    const modulators = [...synthCtx.data.modulators];
    envelope.sustain = ms;
    modulators[idx].env = envelope;
    synthCtx.setData({ ...synthCtx.data, modulators });
  };
  const changeRelease = (ms: number): void => {
    const modulators = [...synthCtx.data.modulators];
    envelope.release = ms;
    modulators[idx].env = envelope;
    synthCtx.setData({ ...synthCtx.data, modulators });
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

export const Next = ({
  idx,
  del
}: {
  idx?: number | null
  del?: null | (() => void)
}): JSX.Element => {
  const synthCtx = useContext(SynthDataContext);
  const nextPosition = idx == null ? 0 : idx;

  const injectModulator = (mod: ModulatorRawData): void => {
    const modulators = [...synthCtx.data.modulators];
    modulators.splice(nextPosition + 1, 0, mod);
    synthCtx.setData({ ...synthCtx.data, modulators });
  };
  const addLfo = (): void =>
    injectModulator(new ModulatorRawData(ModulatorOp.Add, ModulatorKind.LFO));
  const subLfo = (): void =>
    injectModulator(new ModulatorRawData(ModulatorOp.Sub, ModulatorKind.LFO));
  const addElfo = (): void =>
    injectModulator(
      new ModulatorRawData(
        ModulatorOp.Add,
        ModulatorKind.ELFO,
        undefined,
        undefined,
        EnvelopeFactory.ASR(13, 12, 161)
      )
    );
  const subElfo = (): void =>
    injectModulator(
      new ModulatorRawData(
        ModulatorOp.Add,
        ModulatorKind.ELFO,
        undefined,
        undefined,
        EnvelopeFactory.ASR(13, 12, 161)
      )
    );

  let kill = null;
  if (del != null) {
    kill = (
      <button onClick={(e: React.UIEvent): void => del()} className="kill">
        [x]
      </button>
    );
  }

  return (
    <div className="next">
      {kill}
      <button className="add" onClick={(e) => addLfo()}>
        Add LFO
      </button>
      <button className="add" onClick={(e) => addElfo()}>
        Add ELFO
      </button>
      <button className="sub" onClick={(e) => subLfo()}>
        Sub LFO
      </button>
      <button className="sub" onClick={(e) => subElfo()}>
        Sub ELFO
      </button>
    </div>
  );
};
