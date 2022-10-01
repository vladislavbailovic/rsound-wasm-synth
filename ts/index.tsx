import React from 'react';
import { createRoot } from 'react-dom/client';
import { Interface } from './interface';

import init from '../pkg/rsound_wasm_synth';
init()
  .then(() => {
    const container = document.getElementById('interface');
    const synth = {
      tone: 0,
      modulators: [{ kind: 0, shape: 0, freq: 45 }]
    };

    if (container != null) {
      const root = createRoot(container);
      root.render(<Interface synth={synth} />);
    }
  })
  .catch((e) => console.error(e));
