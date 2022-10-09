import React from 'react';
import { Display } from '../display';
import {
  draw_env,
  EnvelopeRawData,
  EnvelopeKind
} from '../../pkg/rsound_wasm_synth';
import './envelope.css';

export const Envelope = ({
  envelope,
  changeDelay,
  changeAttack,
  changeSustain,
  changeRelease
}: {
  envelope: EnvelopeRawData
  changeDelay: (x: number) => void
  changeAttack: (x: number) => void
  changeSustain: (x: number) => void
  changeRelease: (x: number) => void
}): JSX.Element => {
  const name = EnvelopeKind[envelope.kind];

  const graph = draw_env(envelope);
  const blob = new Blob([graph], { type: 'image/svg+xml' });
  const tempUrl = window.URL.createObjectURL(blob);

  return (
    <div className="envelope">
      <div className="shape">
        <Display src={tempUrl} />
      </div>
      <div className="params">
        <fieldset>
          <title>{name}</title>

          <label>
            <input
              type="number"
              onChange={(e) => changeDelay(Number(e.target.value))}
              value={envelope.delay !== undefined ? envelope.delay : 0}
              min="0"
              max="1000"
            />
            <span>ms</span>
          </label>

          <label>
            <input
              type="number"
              onChange={(e) => changeAttack(Number(e.target.value))}
              value={envelope.attack}
              min="0"
              max="1000"
            />
            <span>ms</span>
          </label>

          <label>
            <input
              type="number"
              value={envelope.sustain}
              onChange={(e) => changeSustain(Number(e.target.value))}
              min="0"
              max="1000"
            />
            <span>ms</span>
          </label>

          <label>
            <input
              type="number"
              value={envelope.release}
              onChange={(e) => changeRelease(Number(e.target.value))}
              min="0"
              max="1000"
            />
            <span>ms</span>
          </label>
        </fieldset>
      </div>
    </div>
  );
};
