import { useEffect, useRef } from 'react';

// @see: https://usehooks.com/usePrevious/

const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default usePrevious;
