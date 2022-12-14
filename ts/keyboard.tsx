import React, { useContext } from 'react';
import { PitchClass, Octave, ToneData } from '../pkg/rsound_wasm_synth';
import { SynthDataContext } from './data';
import { PlayerContext } from './player';
import './keyboard.css';

const KEYMAP: Record<string, number> = {
  z: PitchClass.C,
  s: PitchClass.Cis,
  x: PitchClass.D,
  d: PitchClass.Dis,
  c: PitchClass.E,
  v: PitchClass.F,
  g: PitchClass.Fis,
  b: PitchClass.G,
  h: PitchClass.Gis,
  n: PitchClass.A,
  j: PitchClass.B,
  m: PitchClass.H
};

const BLACK = [
  PitchClass.Cis,
  PitchClass.Dis,
  PitchClass.Fis,
  PitchClass.Gis,
  PitchClass.B
];
const OFFSET = BLACK.map((x) => Number(x) + 1);

export const Keyboard = (): JSX.Element => {
  const player = useContext(PlayerContext);
  const synthCtx = useContext(SynthDataContext);
  const tone =
    synthCtx.data.tone !== null
      ? synthCtx.data.tone
      : new ToneData(PitchClass.A, Octave.C3);
  const [activeKey, setActiveKey] = React.useState<PitchClass | null>(null);
  keypressListener(
    (e: any) => {
      const event = e as React.KeyboardEvent;
      if (!Object.keys(KEYMAP).includes(event.key)) {
        return;
      }
      if (event.repeat !== false) {
        return;
      }
      setActiveKey(KEYMAP[event.key]);
      player.play(KEYMAP[event.key]);
    },
    (e: any) => {
      setActiveKey(-1);
    }
  );

  const updateOctave = (x: Octave): void => {
    const tone = new ToneData(PitchClass.A, x);
    synthCtx.setData({ ...synthCtx.data, tone });
  };

  return (
    <div className="tone-data">
      {Object.entries(Octave)
        .filter(([key, val]) => !isNaN(Number(val)))
        .map(([key, val]) => {
          const rkey = `octave-${Number(val)}`;
          return (
            <label key={rkey}>
              <input
                type="radio"
                name="octave"
                value={Number(val)}
                onChange={(e) => updateOctave(Number(e.target.value))}
                checked={Number(val) === tone.octave}
              />
              <span>{key}</span>
            </label>
          );
        })}
      <div className="piano">
        {Object.entries(PitchClass)
          .filter(([key, val]) => !isNaN(Number(val)))
          .map(([key, val]) => {
            const idx = `${key}-${Number(val)}`;
            return (
              <Key
                key={idx}
                name={key}
                idx={Number(val)}
                activate={player.play}
                active={activeKey}
              />
            );
          })}
      </div>
    </div>
  );
};

// TODO: make toggleable?
const keypressListener = (
  activate: (e: any) => void,
  deactivate?: (e: any) => void
): void => {
  const activateHandler = React.useRef<(e: any) => void>();
  const deactivateHandler = React.useRef<(e: any) => void>();

  React.useEffect(() => {
    activateHandler.current = activate;
    deactivateHandler.current = deactivate;
  }, [activate, deactivate]);

  React.useEffect(() => {
    const activateListener = (event: any): void => {
      if (activateHandler.current !== undefined) {
        return activateHandler.current(event);
      }
    };
    const deactivateListener = (event: any): void => {
      if (deactivateHandler.current !== undefined) {
        return deactivateHandler.current(event);
      }
    };
    window.addEventListener('keydown', activateListener);
    window.addEventListener('keyup', deactivateListener);
    return (): void => {
      window.removeEventListener('keydown', activateListener);
      window.removeEventListener('keyup', deactivateListener);
    };
  });
};

const Key = ({
  name,
  idx,
  activate,
  active
}: {
  name: string
  idx: number
  activate: (tone: number) => void
  active: PitchClass | null
}): JSX.Element => {
  const cls = ['key'];
  if (BLACK.includes(idx)) cls.push('black');
  if (OFFSET.includes(idx)) cls.push('offset');
  if (active === idx) cls.push('active');

  const keyClickHandler = (e: React.MouseEvent<HTMLElement>): void => {
    activate(idx);
  };

  return (
    <button className={cls.join(' ')} onClick={keyClickHandler}>
      {name}
    </button>
  );
};
