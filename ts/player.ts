import { createContext } from 'react';
import { SynthData } from './data';
import { play, PitchClass } from '../pkg/rsound_wasm_synth';

export class Player {
  audioCtx: AudioContext | null = null;
  gainNode: GainNode | null = null;
  bufferNode: AudioBufferSourceNode | null = null;
  synthData: SynthData | null = null;

  constructor (data?: SynthData | null) {
    if (data != null) {
      this.synthData = data;
    }
    this.play = this.play.bind(this);
  }

  get_ctx (): AudioContext | null {
    if (this.audioCtx != null) {
      return this.audioCtx;
    }
    this.audioCtx = new window.AudioContext();
    if (this.audioCtx != null) {
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0.5;
      this.gainNode.connect(this.audioCtx.destination);
    }
    return this.audioCtx;
  }

  set_synth (data: SynthData): void {
    this.synthData = data;
  }

  play (tone: PitchClass): void {
    const ctx = this.get_ctx();
    if (ctx == null) {
      console.log('no context');
      return;
    }
    ctx
      .resume()
      .then(() => {
        if (this.bufferNode != null) {
          this.bufferNode.stop();
        }
        if (this.audioCtx == null) {
          return;
        }
        if (this.gainNode == null) {
          return;
        }
        const note = this.synthData != null ? this.synthData.tone : null;
        if (note == null) {
          return;
        }
        note.pitch = tone;
        const instrument =
          this.synthData != null ? this.synthData.instrument : null;
        if (instrument == null) {
          return;
        }
        const params = this.synthData != null ? this.synthData.params : [];
        const modulators =
          this.synthData != null ? this.synthData.modulators : [];
        const result = play(note, instrument, params, modulators);
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

export const PlayerContext = createContext<Player>(new Player());
