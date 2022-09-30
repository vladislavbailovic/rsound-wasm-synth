import React from 'react';
import { SynthData } from './data';
import { Keyboard } from './keyboard';
import { Synth } from './synth/chain';

export const Interface = ({ synth }: { synth: SynthData }): JSX.Element => {
  return (
    <>
      <Synth type="chain" synth={synth} />
      <Keyboard />
    </>
  );
};
