import React from 'react';

export const Keyboard = ({ activateKey }: { activateKey: (tone: number) => void }) => {
	const [activeKey, setActiveKey] = React.useState<number>(KEY_NONE);
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
		<Key name="C" idx={KEY_C} activate={activateKey} active={activeKey} />
		<Key name="Cis" idx={KEY_CIS} activate={activateKey} active={activeKey} />
		<Key name="D" idx={KEY_D} activate={activateKey} active={activeKey} />
		<Key name="Dis" idx={KEY_DIS} activate={activateKey} active={activeKey} />
		<Key name="E" idx={KEY_E} activate={activateKey} active={activeKey} />
		<Key name="F" idx={KEY_F} activate={activateKey} active={activeKey} />
		<Key name="Fis" idx={KEY_FIS} activate={activateKey} active={activeKey} />
		<Key name="G" idx={KEY_G} activate={activateKey} active={activeKey} />
		<Key name="Gis" idx={KEY_GIS} activate={activateKey} active={activeKey} />
		<Key name="A" idx={KEY_A} activate={activateKey} active={activeKey} />
		<Key name="B" idx={KEY_B} activate={activateKey} active={activeKey} />
		<Key name="H" idx={KEY_H} activate={activateKey} active={activeKey} />
	</div>;
}

const KEY_NONE = -1;
const KEY_C = 0;
const KEY_CIS = 1;
const KEY_D = 2;
const KEY_DIS = 3;
const KEY_E = 4;
const KEY_F = 5;
const KEY_FIS = 6;
const KEY_G = 7;
const KEY_GIS = 8;
const KEY_A = 9;
const KEY_B = 10;
const KEY_H = 11;

const BLACK = [ KEY_CIS, KEY_DIS, KEY_FIS, KEY_GIS, KEY_B ];
const OFFSET = BLACK.map(x => x+1);
const KEYMAP: Record<string, number> = {
	'z': KEY_C,
	's': KEY_CIS,
	'x': KEY_D,
	'd': KEY_DIS,
	'c': KEY_E,
	'v': KEY_F,
	'g': KEY_FIS,
	'b': KEY_G,
	'h': KEY_GIS,
	'n': KEY_A,
	'j': KEY_B,
	'm': KEY_H,
};

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

const Key = ({ name, idx, activate, active }: { name: string, idx: number, activate: (tone: number) => void, active: number }) => {
	const cls = ["key"];
	if (BLACK.indexOf(idx) >= 0) cls.push("black");
	if (OFFSET.indexOf(idx) >= 0) cls.push("offset");
	if (active === idx) cls.push("active");

	const keyClickHandler = (e: React.MouseEvent<HTMLElement>) => {
		activate(idx);
	};

	return <button className={cls.join(" ")} onClick={keyClickHandler}>{name}</button>;
};
