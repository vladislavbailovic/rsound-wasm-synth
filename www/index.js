import init, { play } from "./pkg/rsound_wasm_synth.js";


init().then(res => {
	document.querySelector('button').addEventListener('click', function() {
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

		audioCtx.resume().then(() => {
			const gain = audioCtx.createGain();
			gain.gain.volume = 0.5;
			gain.connect(audioCtx.destination);

			const result = play();
			const buffer = audioCtx.createBuffer(1, result.length, 44100);
			buffer.copyToChannel(result, 0);

			const source = audioCtx.createBufferSource();
			source.buffer = buffer;
			source.connect(gain);

			source.start(0);
		});
	});
});

