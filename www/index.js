import init, { play, draw } from "./pkg/rsound_wasm_synth.js";

const update = tone => {
	const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

	const graph = draw(tone);
	const blob = new Blob([graph], {type: "image/svg+xml"});
	const temp_url = window.URL.createObjectURL(blob);
	document.getElementById("graph").setAttribute("src", temp_url);

	audioCtx.resume().then(() => {
		const gain = audioCtx.createGain();
		gain.gain.volume = 0.5;
		gain.connect(audioCtx.destination);

		const result = play(tone);
		const buffer = audioCtx.createBuffer(1, result.length, 44100);
		buffer.copyToChannel(result, 0);

		const source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(gain);

		source.start(0);
	});
};

init().then(res => {
	document.querySelectorAll('button').forEach((button, idx) => {
		button.addEventListener('click', () => {
			update(idx);
		});
	});
});

