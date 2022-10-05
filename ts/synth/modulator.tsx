import React, { useContext } from 'react';
import { Display } from '../display';
import { SynthDataContext, ModulatorData } from '../data';
import {
  draw_lfo,
  draw_env,
  Oscillator,
  EnvelopeFactory,
  ModulatorKind,
  ModulatorOp
} from '../../pkg/rsound_wasm_synth';
import './chain.css';

export const Modulators = ({
  modulators
}: {
  modulators: ModulatorData[]
}): JSX.Element => (
  <>
    {modulators.map((mod, idx) => (
      <Modulator key={idx} modulator={mod} idx={idx} />
    ))}
  </>
);

const Modulator = ({
  modulator,
  idx
}: {
  modulator: ModulatorData
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
    console.log(shape, modulators);
    synthCtx.setData({ ...synthCtx.data, modulators });
  };

  let envelope = null;
  if (modulator.kind === ModulatorKind.ELFO) {
    envelope = <Envelope modulator={modulator} idx={idx} />;
  }

  return (
    <div className="link modulator">
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
      {envelope}
      <Next idx={idx} del={del} />
    </div>
  );
};

const Envelope = ({
  modulator,
  idx
}: {
  modulator: ModulatorData
  idx: number
}): JSX.Element | null => {
  const envelope = modulator.env;
  if (envelope == null) {
    return null;
  }
  const graph = draw_env(envelope);
  const blob = new Blob([graph], { type: 'image/svg+xml' });
  const tempUrl = window.URL.createObjectURL(blob);
  return (
    <div className="envelope">
      <Display src={tempUrl} />
    </div>
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

  const injectModulator = (mod: ModulatorData): void => {
    const modulators = [...synthCtx.data.modulators];
    modulators.splice(nextPosition + 1, 0, mod);
    synthCtx.setData({ ...synthCtx.data, modulators });
  };
  const addLfo = (): void =>
    injectModulator(
      ModulatorData.from({ op: ModulatorOp.Add, kind: ModulatorKind.LFO })
    );
  const subLfo = (): void =>
    injectModulator(
      ModulatorData.from({ op: ModulatorOp.Sub, kind: ModulatorKind.LFO })
    );
  const addElfo = (): void =>
    injectModulator(
      ModulatorData.from({
        op: ModulatorOp.Add,
        kind: ModulatorKind.ELFO,
        env: EnvelopeFactory.ASR(13, 12, 161)
      })
    );
  const subElfo = (): void =>
    injectModulator(
      ModulatorData.from({
        op: ModulatorOp.Add,
        kind: ModulatorKind.ELFO,
        env: EnvelopeFactory.ASR(13, 12, 161)
      })
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
