import { SynthData } from './data';
import { play as playCback } from '../pkg/rsound_wasm_synth';

export default class Player {
  audioCtx: AudioContext;
  gainNode: GainNode;
  bufferNode: AudioBufferSourceNode | null = null;
  synthData: SynthData;
  playSynth: typeof playCback;

  constructor (ctx: AudioContext, play: typeof playCback, data: SynthData) {
    this.audioCtx = ctx;
    this.playSynth = play;
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.5;
    this.gainNode.connect(this.audioCtx.destination);
    this.synthData = data;

    this.play = this.play.bind(this);
  }

  play (tone: number): void {
    this.audioCtx
      .resume()
      .then(() => {
        if (this.bufferNode != null) {
          this.bufferNode.stop();
        }
        const result = this.playSynth(tone, 0, this.synthData.modulators);
        const buffer = this.audioCtx.createBuffer(1, result.length, 44100);
        buffer.copyToChannel(result, 0);

        this.bufferNode = this.audioCtx.createBufferSource();
        this.bufferNode.buffer = buffer;
        this.bufferNode.connect(this.gainNode);

        this.bufferNode.start(0);
      })
      .catch((e) => console.error(e));
  }
}
