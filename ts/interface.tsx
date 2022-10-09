import React from 'react';
import { Keyboard } from './keyboard';
import { Synth } from './synth/source';

export const Interface = (): JSX.Element => {
  return (
    <>
      <Synth />
      <Keyboard />
    </>
  );
};
