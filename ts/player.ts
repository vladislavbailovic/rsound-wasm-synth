import { SynthData } from './data';
import { play } from '../pkg/rsound_wasm_synth';

export class Player {
  audioCtx: AudioContext;
  gainNode: GainNode;
  bufferNode: AudioBufferSourceNode | null = null;
  synthData: SynthData | null = null;

  constructor (data?: SynthData | null) {
    this.audioCtx = new window.AudioContext();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.5;
    this.gainNode.connect(this.audioCtx.destination);
    if (data != null) {
      this.synthData = data;
    }
    console.log('constructed');
  }

  play (tone: number): void {
    this.audioCtx
      .resume()
      .then(() => {
        if (this.bufferNode != null) {
          this.bufferNode.stop();
        }
        const modulators =
          this.synthData != null ? this.synthData.modulators : [];
        const result = play(tone, 0, modulators);
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
