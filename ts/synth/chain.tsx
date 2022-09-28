import React from 'react';
import { Display } from '../display';
import { ModulatorData, SynthData } from '../data';
import {draw} from '../../pkg/rsound_wasm_synth';

export const Synth = ({ type, synth }: { type: string, synth: SynthData }) => {
	const cls = ["synth"].concat([type]).join(" ");
	const graph = draw(synth.tone, 0, synth.modulators);
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
