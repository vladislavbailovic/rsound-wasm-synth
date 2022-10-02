import React from 'react';
import './display.css';

export const Display = ({
  id,
  src
}: {
  id?: string
  src?: string
}): JSX.Element => {
  return (
    <div className="display">
      <img id={id} className="graph" src={src} />
    </div>
  );
};
