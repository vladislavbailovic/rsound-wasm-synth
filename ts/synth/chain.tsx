import React, { useContext } from 'react';
import { Display } from '../display';
import { SynthDataContext, ModulatorData } from '../data';
import { draw, draw_lfo } from '../../pkg/rsound_wasm_synth';

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
    <Link type="source">
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
      <Modulator key={idx} modulator={mod} />
    ))}
  </>
);

const Modulator = ({
  modulator
}: {
  modulator: ModulatorData
}): JSX.Element => {
  const graph = draw_lfo(modulator.shape, modulator.freq);
  const blob = new Blob([graph], { type: 'image/svg+xml' });
  const tempUrl = window.URL.createObjectURL(blob);
  return (
    <Link type="modulator" graph={tempUrl}>
      <input type="hidden" value="1" />
      <label>
        <span className="kind"></span>
        <select>
          <option>Sine</option>
          <option>Square</option>
          <option>Triangle</option>
          <option>Saw</option>
        </select>
      </label>
      <label>
        <input type="numeric" defaultValue="45" />
        <span>Hz</span>
      </label>
    </Link>
  );
};

const Link = ({
  type,
  graph,
  children
}: {
  type: string
  graph?: string | undefined
  children: JSX.Element[]
}): JSX.Element => {
  const cls = ['link'].concat([type]).join(' ');
  let kill = null;
  if (type === 'modulator') {
    kill = <button className="kill">[x]</button>;
  }
  return (
    <div className={cls}>
      <div className="shape">
        <Display src={graph} />
      </div>
      <div className="params">{children}</div>
      <div className="next">
        {kill}
        <button className="add">Add</button>
        <button className="sub">Sub</button>
      </div>
    </div>
  );
};
