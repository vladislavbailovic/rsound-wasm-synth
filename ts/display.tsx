import React from 'react';

export const Display = ({ id, src }: { id?: string, src?: string }) => {
	return <div className="display">
		<img id={id} className="graph" src={src} />
	</div>;
};

