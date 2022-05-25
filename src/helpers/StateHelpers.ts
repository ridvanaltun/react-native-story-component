import { useEffect, useRef } from 'react';

// @see: https://usehooks.com/usePrevious/

export const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
