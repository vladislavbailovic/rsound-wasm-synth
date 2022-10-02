import React, { useContext } from 'react';
import { Display } from '../display';
import { SynthDataContext, ModulatorData } from '../data';
import { draw, draw_lfo, Oscillator } from '../../pkg/rsound_wasm_synth';

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

      <div className={cls}>
        <SynthSource />
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
        <input type="numeric" defaultValue="440" />
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
  const changeShape = (shape: number): void => {
    const modulators = [...synthCtx.data.modulators];
    modulators[idx].shape = shape;
    synthCtx.setData({ ...synthCtx.data, modulators });
  };

  return (
    <Link type={LinkType.Modulator} graph={tempUrl} del={del} idx={idx}>
      <input type="hidden" value="1" />
      <label>
        <span className="kind"></span>
        <select
          onChange={(e) => changeShape(Number(e.target.value))}
          value={modulator.shape}
        >
          {Object.entries(Oscillator)
            .filter(([key, val]) => !isNaN(Number(val)))
            .map(([key, val]) => {
              const idx = `${key}-${Number(val)}`;
              return (
                <option key={idx} value={Number(val)}>
                  {key}
                </option>
              );
            })}
        </select>
      </label>
      <label>
        <input
          type="numeric"
          value={modulator.freq}
          onChange={(e) => changeFreq(Number(e.target.value))}
        />
        <span>Hz</span>
      </label>
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
  children: JSX.Element[]
}): JSX.Element => {
  const typeClass = type === LinkType.Source ? 'synth' : 'modulator';
  const cls = ['link'].concat([typeClass]).join(' ');
  const synthCtx = useContext(SynthDataContext);
  const nextPosition = idx == null ? 0 : idx;

  const add = (): void => {
    const modulators = [...synthCtx.data.modulators];
    modulators.splice(nextPosition, 0, new ModulatorData());
    synthCtx.setData({ ...synthCtx.data, modulators });
  };

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

  return (
    <div className={cls}>
      <div className="shape">
        <Display src={graph} />
      </div>
      <div className="params">{children}</div>
      <div className="next">
        {kill}
        <button className="add" onClick={(e) => add()}>
          Add
        </button>
        <button className="sub" onClick={(e) => add()}>
          Sub
        </button>
      </div>
    </div>
  );
};
