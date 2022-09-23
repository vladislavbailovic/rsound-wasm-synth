import init, { play, draw, draw_lfo, draw_oscillator } from "../pkg/rsound_wasm_synth.js";
var Modulator = /** @class */ (function () {
    function Modulator() {
    }
    return Modulator;
}());
;
var update = function (tone) {
    var audioCtx = new window.AudioContext;
    updateSynth(null);
    audioCtx.resume().then(function () {
        var gain = audioCtx.createGain();
        gain.gain.value = 0.5;
        gain.connect(audioCtx.destination);
        var result = play(tone, 0, getMods());
        var buffer = audioCtx.createBuffer(1, result.length, 44100);
        buffer.copyToChannel(result, 0);
        var source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(gain);
        source.start(0);
    });
};
var updateSynth = function (tone) {
    var graph = draw(tone, 0, getMods());
    var blob = new Blob([graph], { type: "image/svg+xml" });
    var temp_url = window.URL.createObjectURL(blob);
    document.getElementById("graph").setAttribute("src", temp_url);
};
var updateSource = function () {
    var source = document.querySelector('.synth .link.source');
    var sourceGraph = draw_oscillator();
    var sourceBlob = new Blob([sourceGraph], { type: 'image/svg+xml' });
    var sourceGraphUrl = window.URL.createObjectURL(sourceBlob);
    source.querySelector('img.graph').setAttribute('src', sourceGraphUrl);
};
var updateModulators = function () {
    document.querySelectorAll('.synth .link.modulator').forEach(function (mod) {
        var shape = mod.querySelector('select').selectedIndex;
        var freq = mod.querySelector('input[type="numeric"]').value;
        console.log("\tupdating modulator:", shape, freq, Number(freq));
        var modGraph = draw_lfo(Number(shape), Number(freq));
        var modBlob = new Blob([modGraph], { type: 'image/svg+xml' });
        var modGraphUrl = window.URL.createObjectURL(modBlob);
        mod.querySelector('img.graph').setAttribute('src', modGraphUrl);
    });
};
var getMods = function () {
    var mods = [];
    document.querySelectorAll('.synth .link.modulator').forEach(function (mod) {
        var kind = mod.querySelector('input[type="hidden"]').value == 'add' ? 1 : 0;
        var shape = mod.querySelector('select').selectedIndex;
        var freq = mod.querySelector('input[type="numeric"]').value;
        mods.push({ kind: kind, shape: Number(shape), freq: Number(freq) });
    });
    return mods;
};
var handleParamChange = function (e) {
    updateSynth(0);
    updateSource();
    updateModulators();
};
var handleModulatorAdd = function (e) {
    var tpl = document.querySelector("#modulator");
    var mod = tpl.content.cloneNode(true);
    var input = mod.querySelector('input[type="hidden"]');
    input.value = 'add';
    mod.querySelector('.link').classList.add('add');
    document.querySelector('.synth .link:last-child').after(mod);
    updateModulators();
    updateSynth(0);
    updateEvents();
};
var handleModulatorSub = function (e) {
    var tpl = document.querySelector("#modulator");
    var mod = tpl.content.cloneNode(true);
    var input = mod.querySelector('input[type="hidden"]');
    input.value = 'sub';
    mod.querySelector('.link').classList.add('sub');
    document.querySelector('.synth .link:last-child').after(mod);
    updateModulators();
    updateSynth(0);
    updateEvents();
};
var handleModulatorKill = function (e) {
    e.target.closest('.link').remove();
    updateModulators();
    updateSynth(0);
    updateEvents();
};
var updateEvents = function () {
    document.querySelectorAll('.synth .link.modulator input[type="numeric"]').forEach(function (inpt) {
        inpt.removeEventListener('change', handleParamChange);
        inpt.addEventListener('change', handleParamChange);
    });
    document.querySelectorAll('.synth .link.modulator select').forEach(function (inpt) {
        inpt.removeEventListener('change', handleParamChange);
        inpt.addEventListener('change', handleParamChange);
    });
    document.querySelectorAll('.synth .link .next button.add').forEach(function (inpt) {
        inpt.removeEventListener('click', handleModulatorAdd);
        inpt.addEventListener('click', handleModulatorAdd);
    });
    document.querySelectorAll('.synth .link .next button.sub').forEach(function (inpt) {
        inpt.removeEventListener('click', handleModulatorSub);
        inpt.addEventListener('click', handleModulatorSub);
    });
    document.querySelectorAll('.synth .link .next button.kill').forEach(function (inpt) {
        inpt.removeEventListener('click', handleModulatorKill);
        inpt.addEventListener('click', handleModulatorKill);
    });
};
init().then(function (res) {
    updateSynth(0);
    updateSource();
    updateModulators();
    updateEvents();
    document.querySelectorAll('.piano button').forEach(function (button, idx) {
        button.addEventListener('click', function () {
            update(idx);
        });
    });
});
