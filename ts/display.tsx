import React from 'react';

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
