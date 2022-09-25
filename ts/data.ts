export interface WasmSynth {
	draw: (tone: number, base: number, mods: Array<ModulatorData>) => Uint8Array
	play: (tone: number, base: number, mods: Array<ModulatorData>) => Float32Array
}

export class ModulatorData {
	kind: number = 0
	shape: number = 0
	freq: number = 0
};

export class SynthData {
	tone: number = 0
	modulators: Array<ModulatorData> = []
}

