import { createContext } from 'react';
import {
  ModulatorOp,
  ModulatorKind,
  Oscillator
} from '../pkg/rsound_wasm_synth';

export class ModulatorData {
  op: ModulatorOp = ModulatorOp.Add;
  kind: ModulatorKind = ModulatorKind.LFO;
  shape: Oscillator = Oscillator.Sine;
  freq: number = 0;

  static from ({
    op,
    kind,
    shape,
    freq
  }: {
    op?: ModulatorOp
    kind?: ModulatorKind
    shape?: Oscillator
    freq?: number
  }): ModulatorData {
    const data = new ModulatorData();
    if (kind !== undefined) data.kind = kind;
    if (shape !== undefined) data.shape = shape;
    if (op !== undefined) data.op = op;
    if (freq !== undefined) data.freq = freq;
    return data;
  }
}

export class SynthData {
  tone: number = 0;
  modulators: ModulatorData[] = [];
}

export class SynthDataStore {
  data: SynthData;

  static default (): SynthDataStore {
    return new SynthDataStore(new SynthData());
  }

  constructor (data: SynthData) {
    this.data = data;
  }

  setData (data: SynthData): void {
    this.data = data;
  }
}

export const SynthDataContext = createContext<SynthDataStore>(
  SynthDataStore.default()
);
