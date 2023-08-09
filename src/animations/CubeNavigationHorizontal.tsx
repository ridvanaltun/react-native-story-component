import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  PanResponderGestureState,
} from 'react-native';

import type { CubeAnimationHandle } from '.';

const { width, height } = Dimensions.get('window');

const PESPECTIVE = Platform.OS === 'ios' ? 2.38 : 1.7;
const TR_POSITION = Platform.OS === 'ios' ? 2 : 1.5;

interface CubeNavigationHorizontalProps {
  children: React.ReactNode[];
  callBackAfterSwipe?: (page: number) => void;
  callbackOnSwipe?: (status: boolean) => void;
  responderCaptureDx?: number;
  loop?: boolean;
}

const CubeNavigationHorizontal = forwardRef<
  CubeAnimationHandle,
  CubeNavigationHorizontalProps
>(({ loop = false, responderCaptureDx = 60, ...props }, ref) => {
  const { pages, fullWidth } = useMemo(
    () => ({
      pages: props.children.map((_child, index) => width * -index),
      fullWidth: (props.children.length - 1) * width,
    }),
    [props.children]
  );

  const [currentPage, setCurrentPage] = useState(0);

  const _animatedValue = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const _value = useRef({ x: 0, y: 0 });

  const _panResponder = PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_evt, gestureState) =>
      Math.abs(gestureState.dx) > responderCaptureDx,
    onPanResponderGrant: (_e, _gestureState) => {
      if (props.callbackOnSwipe) {
        props.callbackOnSwipe(true);
      }
      _animatedValue.stopAnimation();
      _animatedValue.setOffset(_value.current);
    },
    onPanResponderMove: (e, gestureState) => {
      if (loop) {
        if (gestureState.dx < 0 && _value.current.x < -fullWidth) {
          _animatedValue.setOffset({ x: width, y: 0 });
        } else if (gestureState.dx > 0 && _value.current.x > 0) {
          _animatedValue.setOffset({ x: -(fullWidth + width), y: 0 });
        }
      }
      Animated.event([null, { dx: _animatedValue.x }], {
        useNativeDriver: false,
      })(e, gestureState);
    },
    onPanResponderRelease: (_e, gestureState) => {
      onDoneSwiping(gestureState);
    },
    onPanResponderTerminate: (_e, gestureState) => {
      onDoneSwiping(gestureState);
    },
  });

  useEffect(() => {
    _animatedValue.addListener((value) => {
      _value.current = value;
    });
  }, [_animatedValue]);

  useImperativeHandle(ref, () => ({
    scrollTo(page: number, animated: boolean = true) {
      const x = pages[page] as number;

      if (animated) {
        Animated.spring(_animatedValue, {
          toValue: { x, y: 0 },
          friction: 5,
          tension: 0.6,
          useNativeDriver: false,
        }).start();
      } else {
        _animatedValue.setValue({ x, y: 0 });
      }

      setCurrentPage(page);
    },
  }));

  const onDoneSwiping = (gestureState: PanResponderGestureState) => {
    if (props.callbackOnSwipe) {
      props.callbackOnSwipe(false);
    }

    const mod = gestureState.dx > 0 ? 100 : -100;
    const _currentPage = _closest(_value.current.x + mod) as number;
    const x = pages[_currentPage] as number;

    _animatedValue.flattenOffset();

    Animated.spring(_animatedValue, {
      toValue: { x, y: 0 },
      friction: 5,
      tension: 0.6,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      setCurrentPage(currentPage);
      if (props.callBackAfterSwipe) props.callBackAfterSwipe(currentPage);
    }, 500);
  };

  const _getTransformsFor = (i: number) => {
    let scrollX = _animatedValue.x;
    let pageX = -width * i;

    const loopVariable = (variable: number, sign = 1) => {
      return variable + Math.sign(sign) * (fullWidth + width);
    };

    const padInput = (variables: number[]) => {
      if (!loop) return variables;
      const returnedVariables = [...variables];
      returnedVariables.unshift(
        ...variables.map((variable) => loopVariable(variable, -1))
      );
      returnedVariables.push(
        ...variables.map((variable) => loopVariable(variable, 1))
      );
      return returnedVariables;
    };

    function padOutput<T>(variables: T[]): T[] {
      if (!loop) return variables;

      const returnedVariables = [...variables];
      returnedVariables.unshift(...variables);
      returnedVariables.push(...variables);

      return returnedVariables;
    }

    let translateX = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX, pageX + width]),
      outputRange: padOutput([
        (-width - 1) / TR_POSITION,
        0,
        (width + 1) / TR_POSITION,
      ]),
      extrapolate: 'clamp',
    });

    let rotateY = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX, pageX + width]),
      outputRange: padOutput(['-60deg', '0deg', '60deg']),
      extrapolate: 'clamp',
    });

    let translateXAfterRotate = scrollX.interpolate({
      inputRange: padInput([
        pageX - width,
        pageX - width + 0.1,
        pageX,
        pageX + width - 0.1,
        pageX + width,
      ]),
      outputRange: padOutput([
        -width - 1,
        (-width - 1) / PESPECTIVE,
        0,
        (width + 1) / PESPECTIVE,
        +width + 1,
      ]),
      extrapolate: 'clamp',
    });

    let opacity = scrollX.interpolate({
      inputRange: padInput([
        pageX - width,
        pageX - width + 10,
        pageX,
        pageX + width - 250,
        pageX + width,
      ]),
      outputRange: padOutput([0, 0.6, 1, 0.6, 0]),
      extrapolate: 'clamp',
    });

    return {
      transform: [
        { perspective: width },
        { translateX },
        { rotateY },
        { translateX: translateXAfterRotate },
      ],
      opacity,
    };
  };

  const _renderChild = (child: any, i: number) => {
    let style = [child.props.style, { width, height }];
    let element = React.cloneElement(child, { i, style });

    return (
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.child, _getTransformsFor(i)]}
        key={`cube-child-${i}`}
        pointerEvents={currentPage === i ? 'auto' : 'none'}
      >
        {element}
      </Animated.View>
    );
  };

  const _closest = (num: number) => {
    let array = pages;
    let minDiff = 1000;
    let ans;

    for (let i of array) {
      let m = Math.abs(num - (array[i] as number));
      if (m < minDiff) {
        minDiff = m;
        ans = i;
      }
    }

    return ans;
  };

  return (
    <Animated.View style={styles.container} {..._panResponder.panHandlers}>
      <Animated.View style={styles.content}>
        {props.children.map(_renderChild)}
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  child: {
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: '#000',
    position: 'absolute',
    width,
    height,
  },
});

export default CubeNavigationHorizontal;
