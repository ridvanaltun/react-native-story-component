/* eslint-disable react-native/no-inline-styles */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
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

import { usePrevious } from '../helpers/StateHelpers';
import { isNullOrWhitespace } from '../helpers/ValidationHelpers';

import { ActionStates } from '../index';
import StoryImage from './StoryImage';
import type {
  UserStoryItem,
  CustomProfileBanner,
  CustomStoryImage,
} from '../index';
import { getStatusBarHeight } from 'react-native-safearea-height';

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
  customProfileBanner?: (props: CustomProfileBanner) => React.ReactNode;
  customStoryImage?: (props: CustomStoryImage) => React.ReactNode;
  stories: UserStoryItem[];
  showProfileBanner?: boolean;
  currentPage: number;
};

const StoryListItem = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [pressed, setPressed] = useState(false);
  const [currStoryIndex, setCurrStoryIndex] = useState(0);
  const [content, setContent] = useState(props.stories);
  const [currImageWidth, setCurrImageWidth] = useState(0);
  const [currImageHeight, setCurrImageHeight] = useState(0);

  const currStory = useMemo(
    () => content[currStoryIndex],
    [content, currStoryIndex]
  ) as UserStoryItem;

  const currPageIndex = useMemo(() => props.currentPage, [props.currentPage]);

  const swipeText = useMemo(
    () => content?.[currStoryIndex]?.swipeText || props.swipeText || 'Swipe Up',
    [content, currStoryIndex, props.swipeText]
  );

  const progress = useRef(new Animated.Value(0)).current;

  const prevPageIndex = usePrevious(currPageIndex);
  const prevStoryIndex = usePrevious(currStoryIndex);

  const close = useCallback(
    (state: ActionStates) => {
      let data = [...content];
      data.map((x) => (x.finished = false));
      setContent(data);
      progress.setValue(0);
      if (currPageIndex === props.index) {
        if (props.onFinish) {
          props.onFinish(state);
        }
      }
    },
    [content, currPageIndex, progress, props]
  );

  const next = useCallback(() => {
    // check if the next content is not empty
    setLoading(true);
    if (currStoryIndex !== content.length - 1) {
      let data = [...content];
      (data[currStoryIndex] as UserStoryItem).finished = true;
      setContent(data);
      setCurrStoryIndex(currStoryIndex + 1);
      progress.setValue(0);
    } else {
      // the next content is empty
      close(ActionStates.NEXT);
    }
  }, [close, content, currStoryIndex, progress]);

  const previous = () => {
    // checking if the previous content is not empty
    setLoading(true);
    if (currStoryIndex - 1 >= 0) {
      let data = [...content];
      (data[currStoryIndex] as UserStoryItem).finished = false;
      setContent(data);
      setCurrStoryIndex(currStoryIndex - 1);
      progress.setValue(0);
    } else {
      // the previous content is empty
      close(ActionStates.PREVIOUS);
    }
  };

  const startProgressAnimation = useCallback(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: props.duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) next();
    });
  }, [next, progress, props.duration]);

  const startStory = useCallback(() => {
    Image.getSize(
      (content[currStoryIndex] as UserStoryItem).image,
      (imageWidth, imageHeight) => {
        let newHeight = imageHeight;
        let newWidth = imageWidth;

        const isImageWidthBiggerThenPhone = imageWidth > width;

        if (isImageWidthBiggerThenPhone) {
          newWidth = width;
          newHeight = imageHeight
            ? Math.floor(width * (imageHeight / imageWidth))
            : width;
        }

        const isNewHeightBiggerThenPhone = newHeight > height;

        if (isNewHeightBiggerThenPhone) {
          newWidth = height * (imageWidth / imageHeight);
          newHeight = height;
        }

        setCurrImageWidth(newWidth);
        setCurrImageHeight(newHeight);
        setLoading(false);
        progress.setValue(0);
        startProgressAnimation();
      },
      (errorMsg) => {
        console.log(errorMsg);
      }
    );
  }, [content, currStoryIndex, progress, startProgressAnimation]);

  // call every page changes
  useEffect(() => {
    const isPrevious = !!prevPageIndex && prevPageIndex > currPageIndex;

    if (isPrevious) {
      setCurrStoryIndex(content.length - 1);
    } else {
      setCurrStoryIndex(0);
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

      if (isNextStory && (prevStory as UserStoryItem).id === currStory.id) {
        startStory();
      } else if (isPrevStory && nextStory?.id === currStory.id) {
        startStory();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currStoryIndex]);

  const onSwipeUp = () => {
    if (props.onClosePress) props.onClosePress();

    if (currStory.onPress) currStory.onPress();
  };

  const onSwipeDown = () => {
    props?.onClosePress();
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

  const renderStoryImage = () => {
    if (props.customStoryImage)
      return props.customStoryImage({
        image: currStory.image,
        onLoadEnd: startStory,
        imageWidth: currImageWidth,
        imageHeight: currImageHeight,
      });

    return (
      <StoryImage
        source={{ uri: currStory.image }}
        width={currImageWidth}
        height={currImageHeight}
        onLoadEnd={startStory}
      />
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
        {renderStoryImage()}
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
                        : (content[currStoryIndex] as UserStoryItem).finished
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
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
