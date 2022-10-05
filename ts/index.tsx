import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Interface } from './interface';
import { SynthDataContext, SynthData } from './data';
import { Player, PlayerContext } from './player';

import init, { ModulatorRawData } from '../pkg/rsound_wasm_synth';

const ContextProvider = ({
  children
}: {
  children: JSX.Element
}): JSX.Element => {
  const synth = {
    tone: 0,
    modulators: [ModulatorRawData.from(undefined, undefined, undefined, 45)]
  };
  const [data, setData] = useState<SynthData>(synth);

  return (
    <SynthDataContext.Provider value={{ data, setData }}>
      <PlayerContext.Provider value={new Player(data)}>
        {children}
      </PlayerContext.Provider>
    </SynthDataContext.Provider>
  );
};
init()
  .then(() => {
    const container = document.getElementById('interface');

    if (container != null) {
      const root = createRoot(container);
      root.render(
        <ContextProvider>
          <Interface />
        </ContextProvider>
      );
    }
  })
  .catch((e) => console.error(e));
