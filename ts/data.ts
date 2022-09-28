export class ModulatorData {
  kind: number = 0;
  shape: number = 0;
  freq: number = 0;
}

export class SynthData {
  tone: number = 0;
  modulators: ModulatorData[] = [];
}
