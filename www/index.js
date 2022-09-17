import init, { play, draw } from "./pkg/rsound_wasm_synth.js";


init().then(res => {
	document.querySelector('button').addEventListener('click', function() {
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

		const graph = draw();
		console.log("graph", graph);
		const blob = new Blob([graph], {type: "image/svg+xml"});
		console.log("blob", blob);
		const temp_url = window.URL.createObjectURL(blob);
		console.log("url", temp_url);
		document.getElementById("graph").setAttribute("src", temp_url);

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

