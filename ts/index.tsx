import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Interface } from './interface';
import { SynthDataContext, SynthData } from './data';
import { Player, PlayerContext } from './player';

import init, {
  ToneData,
  PitchClass,
  Octave,
  InstrumentRawData,
  GeneratorType,
  SynthParamType,
  SynthParam,
  Oscillator,
  EnvelopeFactory
} from '../pkg/rsound_wasm_synth';

const ContextProvider = ({
  children
}: {
  children: JSX.Element
}): JSX.Element => {
  const instrument = new InstrumentRawData(
    GeneratorType.Simple,
    EnvelopeFactory.ASR(13, 161, 12)
  );
  const synth = {
    tone: new ToneData(PitchClass.A, Octave.C3),
    instrument,
    params: [new SynthParam(SynthParamType.Oscillator, Oscillator.Triangle)],
    modulators: []
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
