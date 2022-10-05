import React, { useContext } from 'react';
import { Display } from '../display';
import { SynthDataContext } from '../data';
import { Modulators, Next } from './modulator';
import { draw } from '../../pkg/rsound_wasm_synth';
import './chain.css';

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
    <div className="link source">
      <div className="params">
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
      </div>
      <Next />
    </div>
  );
};
