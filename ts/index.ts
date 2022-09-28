import { createRoot } from 'react-dom/client';
import { Interface } from './interface';
import Player from './player';

import init, { play } from '../pkg/rsound_wasm_synth';
init()
  .then(() => {
    const container = document.getElementById('interface');

    const audioCtx = new window.AudioContext();

    const synth = {
      tone: 0,
      modulators: [{ kind: 0, shape: 0, freq: 45 }]
    };

    const player = new Player(audioCtx, play, synth);

    if (container != null) {
      const root = createRoot(container);
      root.render(Interface({ synth, play: player.play }));
    }
  })
  .catch((e) => console.error(e));
