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
import AutoHeightImage from 'react-native-auto-height-image';

import { usePrevious } from '../helpers/StateHelpers';
import { isNullOrWhitespace } from '../helpers/ValidationHelpers';

import { ActionStates } from '../index';
import type { IUserStoryItem, ICustomProfileBanner } from '../index';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const { width, height } = Dimensions.get('window');

type Props = {
  index: number;
  profileName: string;
  profileImage: any; // @todo
  duration?: number;
  onFinish?: (state: ActionStates) => void;
  onClosePress: () => void;
  swipeText?: string;
  customSwipeUpButton?: () => React.ReactNode;
  customCloseButton?: () => React.ReactNode;
  customProfileBanner?: (props: ICustomProfileBanner) => React.ReactNode;
  stories: IUserStoryItem[];
  showProfileBanner?: boolean;
  currentPage: number;
};

const StoryListItem = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [pressed, setPressed] = useState(false);
  const [currStoryIndex, setCurrentStoryIndex] = useState(0);
  const [content, setContent] = useState(props.stories);

  const currStory = useMemo(
    () => content[currStoryIndex],
    [content, currStoryIndex]
  );

  const currPageIndex = useMemo(() => props.currentPage, [props.currentPage]);

  const swipeText = useMemo(
    () => content?.[currStoryIndex]?.swipeText || props.swipeText || 'Swipe Up',
    [content, currStoryIndex, props.swipeText]
  );

  const progress = useRef(new Animated.Value(0)).current;

  const prevPageIndex = usePrevious(currPageIndex);
  const prevStoryIndex = usePrevious(currStoryIndex);

  // call every page changes
  useEffect(() => {
    const isPrevious = !!prevPageIndex && prevPageIndex > currPageIndex;

    if (isPrevious) {
      setCurrentStoryIndex(content.length - 1);
    } else {
      setCurrentStoryIndex(0);
    }

    let data = [...content];
    data.map((x, i) => {
      if (isPrevious) {
        x.finished = true;
        if (i === content.length - 1) {
          x.finished = false;
        }
      } else {
        x.finished = false;
      }
    });

    setContent(data);
    startStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currPageIndex]);

  // call every story change requests
  // ... and decide next or prev
  useEffect(() => {
    if (!isNullOrWhitespace(prevStoryIndex)) {
      const isNextStory = !!prevStoryIndex && currStoryIndex > prevStoryIndex;
      const isPrevStory = !isNextStory;

      const nextStory = content[currStoryIndex + 1];
      const prevStory = content[currStoryIndex - 1];

      if (isNextStory && prevStory.id === currStory.id) {
        startStory();
      } else if (isPrevStory && nextStory?.id === currStory.id) {
        startStory();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currStoryIndex]);

  const startProgressAnimation = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: props.duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) next();
    });
  };

  const startStory = () => {
    setLoading(false);
    progress.setValue(0);
    startProgressAnimation();
  };

  const onSwipeUp = () => {
    if (props.onClosePress) props.onClosePress();

    if (currStory.onPress) currStory.onPress();
  };

  const onSwipeDown = () => {
    props?.onClosePress();
  };

  const next = () => {
    // check if the next content is not empty
    setLoading(true);
    if (currStoryIndex !== content.length - 1) {
      let data = [...content];
      data[currStoryIndex].finished = true;
      setContent(data);
      setCurrentStoryIndex(currStoryIndex + 1);
      progress.setValue(0);
    } else {
      // the next content is empty
      close(ActionStates.NEXT);
    }
  };

  const previous = () => {
    // checking if the previous content is not empty
    setLoading(true);
    if (currStoryIndex - 1 >= 0) {
      let data = [...content];
      data[currStoryIndex].finished = false;
      setContent(data);
      setCurrentStoryIndex(currStoryIndex - 1);
      progress.setValue(0);
    } else {
      // the previous content is empty
      close(ActionStates.PREVIOUS);
    }
  };

  const close = (state: ActionStates) => {
    let data = [...content];
    data.map((x) => (x.finished = false));
    setContent(data);
    progress.setValue(0);
    if (currPageIndex === props.index) {
      if (props.onFinish) {
        props.onFinish(state);
      }
    }
  };

  const renderSwipeButton = () => {
    if (props.customSwipeUpButton) {
      return props.customSwipeUpButton();
    }

    return <Text style={styles.swipeText}>{swipeText}</Text>;
  };

  const renderCloseButton = () => {
    if (props.customCloseButton) {
      return props.customCloseButton();
    }

    return <Text style={styles.closeText}>X</Text>;
  };

  const renderProfileBanner = () => {
    if (!props.showProfileBanner) return;

    if (props.customProfileBanner)
      return props.customProfileBanner({
        image: props.profileImage,
        name: props.profileName,
      });

    return (
      <>
        <Image style={styles.avatarImage} source={props.profileImage} />
        <Text style={styles.avatarText}>{props.profileName}</Text>
      </>
    );
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
        <AutoHeightImage
          source={{ uri: currStory.image }}
          width={width}
          style={styles.image}
          onLoadEnd={startStory}
        />
        {loading && (
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
                    flex:
                      currStoryIndex === index
                        ? progress
                        : content[index].finished
                        ? 1
                        : 0,
                    height: 2,
                    backgroundColor: '#FFF',
                  }}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.userContainer}>
          <View style={styles.profileContainer}>{renderProfileBanner()}</View>
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
              startProgressAnimation();
            }}
            onPress={() => {
              if (!pressed && !loading) previous();
            }}
          >
            <View style={{ flex: 0.3 }} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startProgressAnimation();
            }}
            onPress={() => {
              if (!pressed && !loading) next();
            }}
          >
            <View style={{ flex: 0.7 }} />
          </TouchableWithoutFeedback>
        </View>
      </View>
      {currStory.onPress && (
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
    maxHeight: height - getStatusBarHeight(true),
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
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
    marginTop: getStatusBarHeight(true),
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
    marginTop: 10,
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
