import { useEffect } from 'react';

const useMountEffect = (effect: () => void) => {
  if (typeof effect !== 'function') {
    console.error('Effect must be a function');
  }

  useEffect(() => {
    effect?.();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useMountEffect;
