	import React from 'react';
import { createRoot } from 'react-dom/client';

import('../pkg').then(async (wasm) => {
	const wasmSynth = await wasm.default;

class ModulatorData {
	kind: number = 0
	shape: number = 0
	freq: number = 0
};

class SynthData {
	tone: number = 0
	modulators: Array<ModulatorData> = []
}

const Interface = ({synth}: {synth: SynthData}) => (<>
	<Synth type="chain" synth={ synth } />
	<Keyboard />
</>);

const Display = ({ id, src }: { id?: string, src?: string }) => {
	return <div className="display">
		<img id={id} className="graph" src={src} />
	</div>;
};

const Synth = ({ type, synth }: { type: string, synth: SynthData }) => {
	const cls = ["synth"].concat([type]).join(" ");
	const graph = wasmSynth.draw(synth.tone, 0, synth.modulators);
	const blob = new Blob([graph], {type: "image/svg+xml"});
	const temp_url = window.URL.createObjectURL(blob);
	return <>
		<Display id="graph" src={temp_url} />

		<div className={cls}>
			<SynthSource />
			<Modulators />
		</div>
	</>;
};

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

const SynthSource = () => {
	return <Link type="source">
		<label>
			<select>
				<option>Sine</option>
				<option>Square</option>
			</select>
		</label>
		<label>
			<input type="numeric" defaultValue="440" />
			<span>Hz</span>
		</label>
	</Link>
};

const Modulators = () => (<>
	<Modulator />
</>);

const Modulator = () => <Link type="modulator">
	<input type="hidden" value="1" />
	<label>
		<span className="kind"></span>
		<select>
			<option>Sine</option>
			<option>Square</option>
			<option>Triangle</option>
			<option>Saw</option>
		</select>
	</label>
	<label>
		<input type="numeric" defaultValue="45" />
		<span>Hz</span>
	</label>
</Link>

const Link = ({ type, children }: { type: string, children: Array<JSX.Element> }) => {
	const cls = ["link"].concat([type]).join(" ");
	let kill = null;
	if (type === "modulator") {
		kill = <button className="kill">[x]</button>;
	}
	return <div className={cls}>
		<div className="shape">
			<Display />
		</div>
		<div className="params">
			{ children }
		</div>
		<div className="next">
			{ kill }
			<button className="add">Add</button>
			<button className="sub">Sub</button>
		</div>
	</div>
};

	const synth = {
		tone: 0,
		modulators: [
			{ kind: 0, shape: 0, freq: 45 },
		],
	};
const container = document.getElementById('interface');
if (container) {
	const root = createRoot(container);
	root.render( <Interface synth={synth} />);
}
});
