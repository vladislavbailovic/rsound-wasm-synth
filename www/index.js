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
		mods.push({ shape: Number(shape), freq: Number(freq) });
	});
	return mods;
};

const handleParamChange = e => {
	updateSynth(0);
	updateSource();
	updateModulators();
};

const handleModulatorAdd = e => {
	const tpl = document.querySelector("#modulator");
	const mod = tpl.content.cloneNode(true);
	console.log(mod)
	mod.querySelector('input[type="hidden"]').value = 'add';
	mod.querySelector('.link').classList.add('add');

	document.querySelector('.synth .link').after(mod);
	updateEvents();
	updateSource();
	updateModulators();
};
const handleModulatorSub = e => {
	const tpl = document.querySelector("#modulator");
	const mod = tpl.content.cloneNode(true);
	console.log(mod)
	mod.querySelector('input[type="hidden"]').value = 'sub';
	mod.querySelector('.link').classList.add('sub');

	document.querySelector('.synth .link').after(mod);
	updateEvents();
	updateSource();
	updateModulators();
};

const updateEvents = () => {
	document.querySelectorAll('.synth .link.modulator input[type="numeric"]').forEach(inpt => {
		inpt.removeEventListener('change', handleParamChange);
		inpt.addEventListener('change', handleParamChange);
	});
	document.querySelectorAll('.synth .link.modulator select').forEach(inpt => {
		inpt.removeEventListener('change', handleParamChange);
		inpt.addEventListener('change', handleParamChange);
	});
	document.querySelectorAll('.synth .link .next button.add').forEach(inpt => {
		inpt.removeEventListener('click', handleModulatorAdd);
		inpt.addEventListener('click', handleModulatorAdd);
	});
	document.querySelectorAll('.synth .link .next button.sub').forEach(inpt => {
		inpt.removeEventListener('click', handleModulatorSub);
		inpt.addEventListener('click', handleModulatorSub);
	});
};

init().then(res => {

	updateSynth(0);
	updateSource();
	updateModulators();
	updateEvents();

	document.querySelectorAll('.piano button').forEach((button, idx) => {
		button.addEventListener('click', () => {
			update(idx);
		});
	});
});

