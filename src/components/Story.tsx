import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Dimensions, View, Platform, StyleSheet } from 'react-native';
import Modal from 'react-native-modalbox';

import StoryListItem from './StoryListItem';
import StoryCircleListView from './StoryCircleListView';

import AndroidCubeEffect from '../animations/AndroidCubeEffect';
import CubeNavigationHorizontal from '../animations/CubeNavigationHorizontal';

import { isNullOrWhitespace, isUrl } from '../helpers/ValidationHelpers';

import { ActionStates } from '../index';
import type {
  IUserStory,
  ICustomStoryView,
  ICustomStoryList,
  ICustomProfileBanner,
  ICustomStoryImage,
} from '../index';
import type { TextStyle, ViewStyle } from 'react-native';

declare module '../animations/CubeNavigationHorizontal' {}

declare module '../animations/AndroidCubeEffect' {}

type Props = {
  data: IUserStory[];
  storyListStyle?: ViewStyle;
  unPressedBorderColor?: string;
  pressedBorderColor?: string;
  onClose?: (item: IUserStory) => void;
  onStart?: (item: IUserStory) => void;
  duration?: number;
  swipeText?: string;
  customSwipeUpButton?: () => React.ReactNode;
  customCloseButton?: () => React.ReactNode;
  customStoryList?: (props: ICustomStoryList) => React.ReactNode;
  customStoryView?: (props: ICustomStoryView) => React.ReactNode;
  customProfileBanner?: (props: ICustomProfileBanner) => React.ReactNode;
  customStoryImage?: (props: ICustomStoryImage) => React.ReactNode;
  avatarSize?: number;
  showAvatarText?: boolean;
  showProfileBanner?: boolean;
  avatarTextStyle?: TextStyle;
};

const Story = (props: Props) => {
  const {
    data,
    unPressedBorderColor,
    pressedBorderColor,
    storyListStyle,
    onStart,
    onClose,
    duration,
    swipeText,
    customSwipeUpButton,
    customCloseButton,
    customStoryList,
    customProfileBanner,
    customStoryImage,
    avatarSize,
    showAvatarText,
    showProfileBanner,
    avatarTextStyle,
  } = props;

  const [dataState, setDataState] = useState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedData, setSelectedData] = useState<IUserStory[]>([]);
  const cubeRef = useRef();

  const _handleStoryItemPress = (item: IUserStory, index: number) => {
    const newData = dataState.slice(index);

    if (onStart) onStart(item);

    setCurrentPage(0);
    setSelectedData(newData);
    setIsModalOpen(true);
  };

  const handleSeen = useCallback(() => {
    const seen = selectedData[currentPage] as IUserStory;
    const seenIndex = dataState.indexOf(seen);
    if (seenIndex > 0) {
      if (!dataState[seenIndex]?.seen) {
        let tempData = dataState;
        dataState[seenIndex] = {
          ...dataState[seenIndex],
          seen: true,
        } as IUserStory;
        setDataState(tempData);
      }
    }
  }, [currentPage, dataState, selectedData]);

  useEffect(() => {
    handleSeen();
  }, [currentPage, handleSeen]);

  const onStoryFinish = (state: ActionStates) => {
    if (!isNullOrWhitespace(state)) {
      if (state === ActionStates.NEXT) {
        const newPage = currentPage + 1;
        if (newPage < selectedData.length) {
          setCurrentPage(newPage);
          //@ts-ignore
          cubeRef?.current?.scrollTo(newPage);
        } else {
          setIsModalOpen(false);
          setCurrentPage(0);
          if (onClose) {
            onClose(selectedData[selectedData.length - 1] as IUserStory);
          }
        }
      } else if (state === ActionStates.PREVIOUS) {
        const newPage = currentPage - 1;
        if (newPage < 0) {
          setIsModalOpen(false);
          setCurrentPage(0);
        } else {
          setCurrentPage(newPage);
          //@ts-ignore
          cubeRef?.current?.scrollTo(newPage);
        }
      }
    }
  };

  const onClosePress = (story: IUserStory) => {
    setIsModalOpen(false);
    if (onClose) onClose(story);
  };

  const renderStoryList = () => {
    return selectedData.map((story, i) => {
      if (props.customStoryView)
        return props.customStoryView({
          index: i,
          data: story,
          currentPage,
          changeStory: onStoryFinish,
          close: () => onClosePress(story),
        });

      return (
        <StoryListItem
          key={`story-${story.id}`}
          index={i}
          duration={duration ? duration * 1000 : undefined}
          profileName={story.name}
          profileImage={
            isUrl(story.avatar) ? { uri: story.avatar } : story.avatar
          }
          stories={story.stories}
          currentPage={currentPage}
          onFinish={onStoryFinish}
          swipeText={swipeText}
          customSwipeUpButton={customSwipeUpButton}
          customCloseButton={customCloseButton}
          customProfileBanner={customProfileBanner}
          customStoryImage={customStoryImage}
          showProfileBanner={showProfileBanner}
          onClosePress={() => onClosePress(story)}
        />
      );
    });
  };

  const renderStoryCircleList = () => {
    if (customStoryList) {
      return customStoryList({
        data: dataState,
        onStoryPress: _handleStoryItemPress,
      });
    }

    return (
      <StoryCircleListView
        handleStoryItemPress={_handleStoryItemPress}
        data={dataState}
        avatarSize={avatarSize}
        unPressedBorderColor={unPressedBorderColor}
        pressedBorderColor={pressedBorderColor}
        showText={showAvatarText}
        textStyle={avatarTextStyle}
      />
    );
  };

  const renderCube = () => {
    if (Platform.OS === 'ios') {
      return (
        <CubeNavigationHorizontal
          //@ts-ignore
          ref={cubeRef}
          callBackAfterSwipe={(x: string | number) => {
            if (parseInt(`${x}`, 10) !== currentPage) {
              setCurrentPage(parseInt(`${x}`, 10));
            }
          }}
        >
          {renderStoryList()}
        </CubeNavigationHorizontal>
      );
    }

    return (
      <AndroidCubeEffect
        //@ts-ignore
        ref={cubeRef}
        callBackAfterSwipe={(x: string | number) => {
          if (parseInt(`${x}`, 10) !== currentPage) {
            setCurrentPage(parseInt(`${x}`, 10));
          }
        }}
      >
        {renderStoryList()}
      </AndroidCubeEffect>
    );
  };

  return (
    <>
      <View style={storyListStyle}>{renderStoryCircleList()}</View>
      <Modal
        style={styles.modal}
        isOpen={isModalOpen}
        onClosed={() => setIsModalOpen(false)}
        position="center"
        swipeToClose
        swipeArea={250}
        backButtonClose
        coverScreen={true}
      >
        {renderCube()}
      </Modal>
    </>
  );
};

Story.defaultProps = {
  showAvatarText: true,
  showProfileBanner: true,
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
});

export default Story;
