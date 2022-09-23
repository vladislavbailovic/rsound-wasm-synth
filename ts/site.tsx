const Interface = () => (<>
	<Display id="graph" />
	<Synth type="chain" />
	<Keyboard />
</>);

const Display = ({ id }: { id?: string | undefined}) => {
	return <div className="display">
		<img id={id} className="graph" src="" />
	</div>;
};

const Synth = ({ type }: { type: string }) => {
	const cls = ["synth"].concat([type]).join(" ");
	return <div className={cls}>
		<SynthSource />
		<Modulators />
	</div>;
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
			<input type="numeric" value="440" />
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
		<input type="numeric" value="45" />
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

// @ts-expect-error
ReactDOM.render(
	<Interface />,
	document.getElementById('interface')
);
