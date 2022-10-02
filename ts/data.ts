import { createContext } from 'react';

export class ModulatorData {
  kind: ModulatorKind = ModulatorKind.Add;
  shape: number = 0;
  freq: number = 0;
}

export enum ModulatorKind {
  Add = 0,
  Sub,
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
