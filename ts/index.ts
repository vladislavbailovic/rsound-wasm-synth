import init, { play, draw, draw_lfo, draw_oscillator } from "../pkg/rsound_wasm_synth.js";

class Modulator {
	kind: number = 0
	shape: number = 0
	freq: number = 0
};

const update = (tone: number) => {
	const audioCtx = new window.AudioContext;

	updateSynth(tone);

	audioCtx.resume().then(() => {
		const gain = audioCtx.createGain();
		gain.gain.value = 0.5;
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

const updateSynth = (tone: number) => {
	const graph = draw(tone, 0, getMods());
	const blob = new Blob([graph], {type: "image/svg+xml"});
	const temp_url = window.URL.createObjectURL(blob);
	const img = document.getElementById("graph");
	if (img) img.setAttribute("src", temp_url);
};

const updateSource = () => {
	const source = document.querySelector('.synth .link.source');
	if (!source) {
		return false;
	}
	const sourceGraph = draw_oscillator();
	const sourceBlob = new Blob([sourceGraph], {type: 'image/svg+xml'});
	const sourceGraphUrl = window.URL.createObjectURL(sourceBlob);
	const sourceImg = source.querySelector('img.graph');
	if (sourceImg) sourceImg.setAttribute('src', sourceGraphUrl);
};

const updateModulators = () => {
	document.querySelectorAll('.synth .link.modulator').forEach(mod => {
		const shapeEl = mod.querySelector('select');
		if (!shapeEl) {
			return false;
		}
		const shape = shapeEl.selectedIndex;
		const freq = (mod.querySelector('input[type="numeric"]') as HTMLInputElement).value;
		console.log("\tupdating modulator:", shape, freq, Number(freq));
		const modGraph = draw_lfo(Number(shape), Number(freq));
		const modBlob = new Blob([modGraph], {type: 'image/svg+xml'});
		const modGraphUrl = window.URL.createObjectURL(modBlob);
		const modImg = mod.querySelector('img.graph');
		if (modImg) modImg.setAttribute('src', modGraphUrl);
	});
};

const getMods = (): Array<Modulator> => {
	let mods: Array<Modulator> = [];
	document.querySelectorAll('.synth .link.modulator').forEach(mod => {
		const kind = (mod.querySelector('input[type="hidden"]') as HTMLInputElement).value == 'add' ? 1 : 0;
		const shapeEl = mod.querySelector('select');
		if (!shapeEl) {
			return false;
		}
		const shape = shapeEl.selectedIndex;
		const freq = (mod.querySelector('input[type="numeric"]') as HTMLInputElement).value;
		mods.push({ kind: kind, shape: Number(shape), freq: Number(freq) });
	});
	return mods;
};

const handleParamChange = () => {
	updateSynth(0);
	updateSource();
	updateModulators();
};

const handleModulatorAdd = (e: Event) => {
	const tpl: HTMLTemplateElement | null = document.querySelector("#modulator");
	if (!tpl) {
		return;
	}
	const mod = tpl.content.cloneNode(true) as HTMLElement;
	const input: HTMLInputElement | null = mod.querySelector('input[type="hidden"]');
	if (input) {
		input.value = 'add';
	}
	if (mod) {
		const lnk = mod.querySelector('.link');
		if (lnk) lnk.classList.add('add');
	}

	const last = document.querySelector('.synth .link:last-child');
	if (last) last.after(mod);
	updateModulators();
	updateSynth(0);
	updateEvents();
};
const handleModulatorSub = (e: Event) => {
	const tpl: HTMLTemplateElement | null = document.querySelector("#modulator");
	if (!tpl) {
		return;
	}
	const mod = tpl.content.cloneNode(true) as HTMLElement;
	const input: HTMLInputElement | null = (mod as HTMLElement).querySelector('input[type="hidden"]');
	if (input) {
		input.value = 'sub';
	}
	if (mod) {
		const lnk = mod.querySelector('.link');
		if (lnk) lnk.classList.add('sub');
	}

	const last = document.querySelector('.synth .link:last-child');
	if (last) last.after(mod);
	updateModulators();
	updateSynth(0);
	updateEvents();
};
const handleModulatorKill = (e: Event) => {
	const target: Element | null = e.target as Element;
	if (target) {
		const lnk: Element | null = target.closest('.link');
		if (lnk) lnk.remove();
	}
	updateModulators();
	updateSynth(0);
	updateEvents();
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
	document.querySelectorAll('.synth .link .next button.kill').forEach(inpt => {
		inpt.removeEventListener('click', handleModulatorKill);
		inpt.addEventListener('click', handleModulatorKill);
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

