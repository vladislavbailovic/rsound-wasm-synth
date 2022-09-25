import React from 'react';
import { WasmSynth, SynthData } from './data';
import { Display } from './display';
import { Synth } from './synth/chain';

export const Interface = ({synth, wasmSynth}: {synth: SynthData, wasmSynth: WasmSynth}) => (<>
	<Synth type="chain" synth={ synth } wasmSynth={wasmSynth} />
	<Keyboard />
</>);

const Keyboard = () => (<div className="piano">
	<button className="key">C</button>
	<button className="key black">Cis</button>
	<button className="key offset">D</button>
	<button className="key black">Dis</button>
	<button className="key offset">E</button>
	<button className="key">F</button>
	<button className="key black">Fis</button>
	<button className="key offset">G</button>
	<button className="key black">Gis</button>
	<button className="key offset">A</button>
	<button className="key black">B</button>
	<button className="key offset">H</button>
</div>);
