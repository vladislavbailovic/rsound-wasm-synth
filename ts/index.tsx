import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Interface } from './interface';
import { SynthDataContext, SynthData } from './data';

import init from '../pkg/rsound_wasm_synth';

const synth = {
  tone: 0,
  modulators: [{ kind: 0, shape: 0, freq: 45 }]
};

const SynthContextProvider = ({
  children
}: {
  children: JSX.Element
}): JSX.Element => {
  const [data, setData] = useState<SynthData>(synth);

  return (
    <SynthDataContext.Provider value={{ data, setData }}>
      {children}
    </SynthDataContext.Provider>
  );
};
init()
  .then(() => {
    const container = document.getElementById('interface');

    if (container != null) {
      const root = createRoot(container);
      root.render(
        <SynthContextProvider>
          <Interface />
        </SynthContextProvider>
      );
    }
  })
  .catch((e) => console.error(e));
