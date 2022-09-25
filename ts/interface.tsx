import React from 'react';
import { WasmSynth, SynthData } from './data';
import { Display } from './display';
import { Keyboard } from './keyboard';
import { Synth } from './synth/chain';

const audioCtx = new window.AudioContext();

export const Interface = ({synth, wasmSynth}: {synth: SynthData, wasmSynth: WasmSynth}) => {
	const play = (tone: number) => {
		audioCtx.resume().then(() => {
			const gain: GainNode = audioCtx.createGain();
			gain.gain.value = 0.5;
			gain.connect(audioCtx.destination);

			const result = wasmSynth.play(tone, 0, synth.modulators);
			const buffer = audioCtx.createBuffer(1, result.length, 44100);
			buffer.copyToChannel(result, 0);

			const source = audioCtx.createBufferSource();
			source.buffer = buffer;
			source.connect(gain);

			source.start(0);
		});

	};
	return <>
		<Synth type="chain" synth={synth} wasmSynth={wasmSynth} />
		<Keyboard activateKey={play} />
		</>;
};
