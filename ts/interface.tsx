import React from 'react';
import { WasmSynth, SynthData } from './data';
import { Display } from './display';
import { Keyboard } from './keyboard';
import { Synth } from './synth/chain';

export const Interface = ({synth, wasmSynth, play}: {synth: SynthData, wasmSynth: WasmSynth, play: (tone:number) => void}) => {
	return <>
		<Synth type="chain" synth={synth} wasmSynth={wasmSynth} />
		<Keyboard activateKey={play} />
		</>;
};
