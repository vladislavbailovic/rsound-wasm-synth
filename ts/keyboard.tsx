import React, { useContext } from 'react';
import { PitchClass } from '../pkg/rsound_wasm_synth';
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
  const [activeKey, setActiveKey] = React.useState<PitchClass | null>(null);
  keypressListener(
    (e: any) => {
      const event = e as React.KeyboardEvent;
      if (!Object.keys(KEYMAP).includes(event.key)) {
        return;
      }
      setActiveKey(KEYMAP[event.key]);
      player.play(KEYMAP[event.key]);
    },
    (e: any) => {
      setActiveKey(-1);
    }
  );
  return (
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
