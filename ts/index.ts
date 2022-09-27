import React from 'react';
import {createRoot} from 'react-dom/client';
import {
	Interface
} from './interface';
import { WasmSynth, SynthData } from './data';

class Player {
	audioCtx: AudioContext
	gainNode: GainNode
	bufferNode: AudioBufferSourceNode | null = null
	synthData: SynthData
	playSynth: WasmSynth["play"]

	constructor(ctx: AudioContext, play: WasmSynth["play"], data: SynthData) {
		this.audioCtx = ctx;
		this.playSynth = play;
		this.gainNode = this.audioCtx.createGain();
		this.gainNode.gain.value = 0.5;
		this.gainNode.connect(this.audioCtx.destination);
		this.synthData = data;

		this.play = this.play.bind(this);
	}

	play(tone: number) {
		console.log(this);
		this.audioCtx.resume().then(() => {
			if (this.bufferNode) {
				this.bufferNode.stop();
			}
			const result = this.playSynth(tone, 0, this.synthData.modulators);
			const buffer = this.audioCtx.createBuffer(1, result.length, 44100);
			buffer.copyToChannel(result, 0);

			this.bufferNode = this.audioCtx.createBufferSource();
			this.bufferNode.buffer = buffer;
			this.bufferNode.connect(this.gainNode);

			this.bufferNode.start(0);
		});
	}
}


import('../pkg').then(async (wasm) => {
	const wasmSynth = await wasm.default;
	const container = document.getElementById('interface');

	const audioCtx = new window.AudioContext();


	const synth = {
		tone: 0,
		modulators: [
			{ kind: 0, shape: 0, freq: 45 },
		],
	};

	const player = new Player(audioCtx, wasmSynth.play, synth);

	if (container) {
		const root = createRoot(container);
		root.render(Interface({ synth, wasmSynth, play: player.play }));
	}
});
