/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';

import { usePrevious } from './helpers/StateHelpers';
import { isNullOrWhitespace } from './helpers/ValidationHelpers';

import type { IUserStoryItem } from './interfaces/IUserStory';

const { width, height } = Dimensions.get('window');

export enum CloseStates {
  PREVIOUS = 'previous',
  NEXT = 'next',
}

type Props = {
  index: number;
  profileName: string;
  profileImage: string;
  duration?: number;
  onFinish?: (state: CloseStates) => void;
  onClosePress: () => void;
  key: number;
  swipeText?: string;
  customSwipeUpComponent?: () => React.ReactNode;
  customCloseComponent?: () => React.ReactNode;
  stories: IUserStoryItem[];
  currentPage: number;
};

const StoryListItem = (props: Props) => {
  const stories = props.stories;

  const [load, setLoad] = useState(true);
  const [pressed, setPressed] = useState(false);
  const [content, setContent] = useState(
    stories.map((story) => {
      return {
        image: story.image,
        onPress: story.onPress,
        swipeText: story.swipeText,
        finish: 0,
      };
    })
  );

  const [current, setCurrent] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;

  const prevCurrentPage = usePrevious(props.currentPage);

  useEffect(() => {
    let isPrevious = !!prevCurrentPage && prevCurrentPage > props.currentPage;
    if (isPrevious) {
      setCurrent(content.length - 1);
    } else {
      setCurrent(0);
    }

    let data = [...content];
    data.map((x, i) => {
      if (isPrevious) {
        x.finish = 1;
        if (i === content.length - 1) {
          x.finish = 0;
        }
      } else {
        x.finish = 0;
      }
    });
    setContent(data);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentPage]);

  const prevCurrent = usePrevious(current);

  useEffect(() => {
    if (!isNullOrWhitespace(prevCurrent)) {
      const isCurrent = !!prevCurrent && current > prevCurrent;
      if (isCurrent && content[current - 1].image === content[current].image) {
        start();
      } else if (
        isCurrent &&
        content[current + 1].image === content[current].image
      ) {
        start();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const start = () => {
    setLoad(false);
    progress.setValue(0);
    startAnimation();
  };

  const startAnimation = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: props.duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        next();
      }
    });
  };

  const onSwipeUp = () => {
    if (props.onClosePress) {
      props.onClosePress();
    }
    if (content[current].onPress) {
      content[current].onPress();
    }
  };

  const onSwipeDown = () => {
    props?.onClosePress();
  };

  const next = () => {
    // check if the next content is not empty
    setLoad(true);
    if (current !== content.length - 1) {
      let data = [...content];
      data[current].finish = 1;
      setContent(data);
      setCurrent(current + 1);
      progress.setValue(0);
    } else {
      // the next content is empty
      close(CloseStates.NEXT);
    }
  };

  const previous = () => {
    // checking if the previous content is not empty
    setLoad(true);
    if (current - 1 >= 0) {
      let data = [...content];
      data[current].finish = 0;
      setContent(data);
      setCurrent(current - 1);
      progress.setValue(0);
    } else {
      // the previous content is empty
      close(CloseStates.PREVIOUS);
    }
  };

  const close = (state: CloseStates) => {
    let data = [...content];
    data.map((x) => (x.finish = 0));
    setContent(data);
    progress.setValue(0);
    if (props.currentPage === props.index) {
      if (props.onFinish) {
        props.onFinish(state);
      }
    }
  };

  const swipeText = useMemo(
    () => content?.[current]?.swipeText || props.swipeText || 'Swipe Up',
    [content, current, props.swipeText]
  );

  const renderSwipeButton = () => {
    if (props.customSwipeUpComponent) {
      return props.customSwipeUpComponent();
    }

    return (
      <>
        <Text style={styles.swipeText} />
        <Text style={styles.swipeText}>{swipeText}</Text>
      </>
    );
  };

  const renderCloseButton = () => {
    if (props.customCloseComponent) {
      return props.customCloseComponent();
    }

    return <Text style={styles.closeText}>X</Text>;
  };

  return (
    <GestureRecognizer
      onSwipeUp={onSwipeUp}
      onSwipeDown={onSwipeDown}
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
      }}
      style={styles.container}
    >
      <SafeAreaView style={styles.backgroundContainer}>
        <Image
          onLoadEnd={() => start()}
          source={{ uri: content[current].image }}
          style={styles.image}
        />
        {load && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
      </SafeAreaView>
      <View style={styles.content}>
        <View style={styles.animationBarContainer}>
          {content.map((_, index) => {
            return (
              <View key={index} style={styles.animationBackground}>
                <Animated.View
                  style={{
                    flex: current === index ? progress : content[index].finish,
                    height: 2,
                    backgroundColor: '#FFF',
                  }}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.userContainer}>
          <View style={styles.profileContainer}>
            <Image
              style={styles.avatarImage}
              source={{ uri: props.profileImage }}
            />
            <Text style={styles.avatarText}>{props.profileName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (props.onClosePress) {
                props.onClosePress();
              }
            }}
          >
            <View style={styles.closeIconContainer}>{renderCloseButton()}</View>
          </TouchableOpacity>
        </View>
        <View style={styles.pressContainer}>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation();
            }}
            onPress={() => {
              if (!pressed && !load) {
                previous();
              }
            }}
          >
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation();
            }}
            onPress={() => {
              if (!pressed && !load) {
                next();
              }
            }}
          >
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </View>
      {content[current].onPress && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onSwipeUp}
          style={styles.swipeUpBtn}
        >
          {renderSwipeButton()}
        </TouchableOpacity>
      )}
    </GestureRecognizer>
  );
};

StoryListItem.defaultProps = {
  duration: 10000,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  spinnerContainer: {
    zIndex: -100,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: '#000',
    alignSelf: 'center',
    width: width,
    height: height,
  },
  content: {
    flexDirection: 'column',
    flex: 1,
  },
  animationBarContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  animationBackground: {
    height: 2,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(117, 117, 117, 0.5)',
    marginHorizontal: 2,
  },
  userContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  avatarImage: {
    height: 30,
    width: 30,
    borderRadius: 100,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#FFF',
    paddingLeft: 10,
  },
  closeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: 15,
  },
  pressContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  swipeUpBtn: {
    position: 'absolute',
    right: 0,
    left: 0,
    alignItems: 'center',
    bottom: Platform.OS === 'ios' ? 20 : 50,
  },
  swipeText: {
    color: '#FFF',
    marginTop: 5,
  },
  closeText: {
    color: '#FFF',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default StoryListItem;
