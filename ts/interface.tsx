import React from 'react';
import { Keyboard } from './keyboard';
import { Synth } from './synth/chain';

export const Interface = (): JSX.Element => {
  return (
    <>
      <Synth type="chain" />
      <Keyboard />
    </>
  );
};
