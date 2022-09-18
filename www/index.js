import init, { play, draw, draw_lfo, draw_oscillator } from "./pkg/rsound_wasm_synth.js";

const update = tone => {
	const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

	updateSynth();

	audioCtx.resume().then(() => {
		const gain = audioCtx.createGain();
		gain.gain.volume = 0.5;
		gain.connect(audioCtx.destination);

		const result = play(tone, 0, getMods());
		const buffer = audioCtx.createBuffer(1, result.length, 44100);
		buffer.copyToChannel(result, 0);

		const source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(gain);

		source.start(0);
	});
};

const updateSynth = tone => {
	const graph = draw(tone, 0, getMods());
	const blob = new Blob([graph], {type: "image/svg+xml"});
	const temp_url = window.URL.createObjectURL(blob);
	document.getElementById("graph").setAttribute("src", temp_url);
};

const updateSource = () => {
	const source = document.querySelector('.synth .link.source');
	const sourceGraph = draw_oscillator();
	const sourceBlob = new Blob([sourceGraph], {type: 'image/svg+xml'});
	const sourceGraphUrl = window.URL.createObjectURL(sourceBlob);
	source.querySelector('img.graph').setAttribute('src', sourceGraphUrl);
};

const updateModulators = () => {
	document.querySelectorAll('.synth .link.modulator').forEach(mod => {
		const shape = mod.querySelector('select').selectedIndex;
		const freq = mod.querySelector('input[type="numeric"]').value;
		console.log("\tupdating modulator:", shape, freq, Number(freq));
		const modGraph = draw_lfo(Number(shape), Number(freq));
		const modBlob = new Blob([modGraph], {type: 'image/svg+xml'});
		const modGraphUrl = window.URL.createObjectURL(modBlob);
		mod.querySelector('img.graph').setAttribute('src', modGraphUrl);
	});
};

const getMods = () => {
	let mods = [];
	document.querySelectorAll('.synth .link.modulator').forEach(mod => {
		const shape = mod.querySelector('select').selectedIndex;
		const freq = mod.querySelector('input[type="numeric"]').value;
		mods.push(Number(freq));
	});
	console.log(mods);
	return mods;
};

init().then(res => {

	document.querySelectorAll('.synth .link.modulator input[type="numeric"]').forEach(inpt => {
		inpt.addEventListener('change', () => {
			updateSynth(0);
			updateSource();
			updateModulators();
		});
	});
	document.querySelectorAll('.synth .link.modulator select').forEach(inpt => {
		inpt.addEventListener('change', () => {
			updateSynth(0);
			updateSource();
			updateModulators();
		});
	});
	updateSynth(0);
	updateSource();
	updateModulators();

	document.querySelectorAll('.piano button').forEach((button, idx) => {
		button.addEventListener('click', () => {
			update(idx);
		});
	});
});

