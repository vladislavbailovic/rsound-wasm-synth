import React from 'react';
import {PitchClass} from '../pkg/rsound_wasm_synth';

const KEYMAP: Record<string, number> = {
	'z': PitchClass.C,
	's': PitchClass.Cis,
	'x': PitchClass.D,
	'd': PitchClass.Dis,
	'c': PitchClass.E,
	'v': PitchClass.F,
	'g': PitchClass.Fis,
	'b': PitchClass.G,
	'h': PitchClass.Gis,
	'n': PitchClass.A,
	'j': PitchClass.B,
	'm': PitchClass.H,
};

const BLACK = [ PitchClass.Cis, PitchClass.Dis, PitchClass.Fis, PitchClass.Gis, PitchClass.B ];
const OFFSET = BLACK.map(x => x+1);

export const Keyboard = ({ activateKey }: { activateKey: (tone: number) => void }) => {
	const [activeKey, setActiveKey] = React.useState<PitchClass|null>(null);
	keypressListener((e: any) => {
		const event = (e as React.KeyboardEvent);
		if (!event) {
			return;
		}
		if (Object.keys(KEYMAP).indexOf(event.key) < 0) {
			return;
		}
		setActiveKey(KEYMAP[event.key]);
		activateKey(KEYMAP[event.key]);
	}, (e: any) => {
		setActiveKey(-1);
	});
	return <div className="piano">
		{
			Object.entries(PitchClass)
				.filter(([key, val]) => !isNaN(Number(val)))
				.map(
					([key, val]) => {
						const idx = `${key}-${Number(val)}`;
						return <Key key={idx} name={key} idx={Number(val)} activate={activateKey} active={activeKey} />;
					}
				)
		}
	</div>;
}

// TODO: make toggleable?
const keypressListener = (activate: (e: any) => void, deactivate?: (e: any) => void) => {
	const activateHandler = React.useRef<(e: any) => void>();
	const deactivateHandler = React.useRef<(e: any) => void>();

	React.useEffect(() => {
		activateHandler.current = activate;
		deactivateHandler.current = deactivate;
	}, [activate, deactivate]);

	React.useEffect(() => {
		const activateListener = (event: any) => {
			if (activateHandler.current) {
				return activateHandler.current(event);
			}
		};
		const deactivateListener = (event: any) => {
			if (deactivateHandler.current) {
				return deactivateHandler.current(event);
			}
		};
		window.addEventListener('keydown', activateListener);
		window.addEventListener('keyup', deactivateListener);
		return () => {
			window.removeEventListener('keydown', activateListener);
			window.removeEventListener('keyup', deactivateListener);
		};
	});
};

const Key = ({ name, idx, activate, active }: { name: string, idx: number, activate: (tone: number) => void, active: PitchClass|null }) => {
	const cls = ["key"];
	if (BLACK.indexOf(idx) >= 0) cls.push("black");
	if (OFFSET.indexOf(idx) >= 0) cls.push("offset");
	if (active === idx) cls.push("active");

	const keyClickHandler = (e: React.MouseEvent<HTMLElement>) => {
		activate(idx);
	};

	return <button className={cls.join(" ")} onClick={keyClickHandler}>{name}</button>;
};
