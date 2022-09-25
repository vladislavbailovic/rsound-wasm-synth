import React from 'react';
import {createRoot} from 'react-dom/client';
import {
	Interface
} from './all';

import('../pkg').then(async (wasm) => {
	const wasmSynth = await wasm.default;
	const container = document.getElementById('interface');

	const synth = {
		tone: 0,
		modulators: [
			{ kind: 0, shape: 0, freq: 45 },
		],
	};
	if (container) {
		const root = createRoot(container);
		root.render(Interface({ synth, wasmSynth }));
	}
});
