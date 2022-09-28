import React from 'react';
import { SynthData } from './data';
import { Display } from './display';
import { Keyboard } from './keyboard';
import { Synth } from './synth/chain';

export const Interface = ({synth, play}: {synth: SynthData, play: (tone:number) => void}) => {
	return <>
		<Synth type="chain" synth={synth} />
		<Keyboard activateKey={play} />
		</>;
};
