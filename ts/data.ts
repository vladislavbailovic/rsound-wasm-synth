import { createContext } from 'react';
import {
  ModulatorRawData,
  InstrumentRawData,
  SynthParam
} from '../pkg/rsound_wasm_synth';

export class SynthData {
  tone: number = 0;
  instrument: InstrumentRawData | null = null;
  params: SynthParam[] = [];
  modulators: ModulatorRawData[] = [];
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
