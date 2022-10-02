import React, { useContext } from 'react';
import { Display } from '../display';
import { SynthDataContext, ModulatorData } from '../data';
import {
  draw,
  draw_lfo,
  Oscillator,
  ModulatorKind,
  ModulatorOp
} from '../../pkg/rsound_wasm_synth';
import './chain.css';

enum LinkType {
  Source = 1,
  Modulator,
}

export const Synth = ({ type }: { type: string }): JSX.Element => {
  const synthCtx = useContext(SynthDataContext);

  const cls = ['synth'].concat([type]).join(' ');
  const graph = draw(synthCtx.data.tone, 0, synthCtx.data.modulators);
  const blob = new Blob([graph], { type: 'image/svg+xml' });
  const tempUrl = window.URL.createObjectURL(blob);
  return (
    <>
      <Display id="graph" src={tempUrl} />
      <SynthSource />

      <div className={cls}>
        <Modulators modulators={synthCtx.data.modulators} />
      </div>
    </>
  );
};

const SynthSource = (): JSX.Element => {
  return (
    <Link type={LinkType.Source}>
      <label>
        <select>
          <option>Sine</option>
          <option>Square</option>
        </select>
      </label>
      <label>
        <input type="number" defaultValue="440" min="20" max="20000" />
        <span>Hz</span>
      </label>
    </Link>
  );
};

const Modulators = ({
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
  const graph = draw_lfo(modulator.shape, modulator.freq);
  const blob = new Blob([graph], { type: 'image/svg+xml' });
  const tempUrl = window.URL.createObjectURL(blob);

  const operation = ModulatorOp[modulator.kind];

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

  return (
    <Link type={LinkType.Modulator} graph={tempUrl} del={del} idx={idx}>
      <fieldset>
        <title>{operation}</title>

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
    </Link>
  );
};

const Link = ({
  type,
  graph,
  idx,
  del,
  children
}: {
  type: LinkType
  idx?: number | null
  graph?: string | undefined
  del?: null | (() => void)
  children: JSX.Element | JSX.Element[]
}): JSX.Element => {
  const typeClass = type === LinkType.Source ? 'source' : 'modulator';
  const cls = ['link'].concat([typeClass]).join(' ');
  const synthCtx = useContext(SynthDataContext);
  const nextPosition = idx == null ? 0 : idx;

  const injectModulator = (op: ModulatorOp, kind: ModulatorKind): void => {
    const modulators = [...synthCtx.data.modulators];
    const mod = ModulatorData.from({ op, kind });
    modulators.splice(nextPosition + 1, 0, mod);
    synthCtx.setData({ ...synthCtx.data, modulators });
  };
  const addLfo = (): void =>
    injectModulator(ModulatorOp.Add, ModulatorKind.LFO);
  const subLfo = (): void =>
    injectModulator(ModulatorOp.Sub, ModulatorKind.LFO);
  const addElfo = (): void =>
    injectModulator(ModulatorOp.Add, ModulatorKind.ELFO);
  const subElfo = (): void =>
    injectModulator(ModulatorOp.Sub, ModulatorKind.ELFO);

  let kill = null;
  if (type === LinkType.Modulator) {
    const delHandler =
      del != null ? (e: React.UIEvent): void => del() : undefined;
    kill = (
      <button onClick={delHandler} className="kill">
        [x]
      </button>
    );
  }

  let shape = null;
  if (type === LinkType.Modulator) {
    shape = (
      <div className="shape">
        <Display src={graph} />
      </div>
    );
  }

  return (
    <div className={cls}>
      {shape}
      <div className="params">{children}</div>
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
    </div>
  );
};
