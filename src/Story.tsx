import React, {
  Fragment,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Dimensions, View, Platform, StyleSheet } from 'react-native';
import Modal from 'react-native-modalbox';

import StoryListItem from './StoryListItem';
import StoryCircleListView from './StoryCircleListView';
import AndroidCubeEffect from './components/AndroidCubeEffect';
import CubeNavigationHorizontal from './components/CubeNavigationHorizontal';

import { isNullOrWhitespace } from './helpers/ValidationHelpers';

import { CloseStates } from './StoryListItem';
import type { TextStyle, ViewStyle } from 'react-native';
import type { IUserStory } from './interfaces/IUserStory';

declare module './components/CubeNavigationHorizontal' {}

declare module './components/AndroidCubeEffect' {}

type Props = {
  data: IUserStory[];
  style?: ViewStyle;
  unPressedBorderColor?: string;
  pressedBorderColor?: string;
  onClose?: (item: IUserStory) => void;
  onStart?: (item: IUserStory) => void;
  duration?: number;
  swipeText?: string;
  customSwipeUpComponent?: any;
  customCloseComponent?: any;
  avatarSize?: number;
  showAvatarText?: boolean;
  avatarTextStyle?: TextStyle;
};

const Story = (props: Props) => {
  const {
    data,
    unPressedBorderColor,
    pressedBorderColor,
    style,
    onStart,
    onClose,
    duration,
    swipeText,
    customSwipeUpComponent,
    customCloseComponent,
    avatarSize,
    showAvatarText,
    avatarTextStyle,
  } = props;

  const [dataState, setDataState] = useState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedData, setSelectedData] = useState<IUserStory[]>([]);
  const cube = useRef();

  // Component Functions
  const _handleStoryItemPress = (item: IUserStory, index: number) => {
    const newData = dataState.slice(index);
    if (onStart) {
      onStart(item);
    }

    setCurrentPage(0);
    setSelectedData(newData);
    setIsModalOpen(true);
  };

  const handleSeen = useCallback(() => {
    const seen = selectedData[currentPage];
    const seenIndex = dataState.indexOf(seen);
    if (seenIndex > 0) {
      if (!dataState[seenIndex]?.seen) {
        let tempData = dataState;
        dataState[seenIndex] = {
          ...dataState[seenIndex],
          seen: true,
        };
        setDataState(tempData);
      }
    }
  }, [currentPage, dataState, selectedData]);

  useEffect(() => {
    handleSeen();
  }, [currentPage, handleSeen]);

  const onStoryFinish = (state: CloseStates) => {
    if (!isNullOrWhitespace(state)) {
      if (state === CloseStates.NEXT) {
        const newPage = currentPage + 1;
        if (newPage < selectedData.length) {
          setCurrentPage(newPage);
          //@ts-ignore
          cube?.current?.scrollTo(newPage);
        } else {
          setIsModalOpen(false);
          setCurrentPage(0);
          if (onClose) {
            onClose(selectedData[selectedData.length - 1]);
          }
        }
      } else if (state === CloseStates.PREVIOUS) {
        const newPage = currentPage - 1;
        if (newPage < 0) {
          setIsModalOpen(false);
          setCurrentPage(0);
        } else {
          setCurrentPage(newPage);
          //@ts-ignore
          cube?.current?.scrollTo(newPage);
        }
      }
    }
  };

  const renderStoryList = () =>
    selectedData.map((story, i) => {
      return (
        <StoryListItem
          duration={duration ? duration * 1000 : undefined}
          key={i}
          profileName={story.name}
          profileImage={story.avatar}
          stories={story.stories}
          currentPage={currentPage}
          onFinish={onStoryFinish}
          swipeText={swipeText}
          customSwipeUpComponent={customSwipeUpComponent}
          customCloseComponent={customCloseComponent}
          onClosePress={() => {
            setIsModalOpen(false);
            if (onClose) {
              onClose(story);
            }
          }}
          index={i}
        />
      );
    });

  const renderCube = () => {
    if (Platform.OS === 'ios') {
      return (
        <CubeNavigationHorizontal
          //@ts-ignore
          ref={cube}
          callBackAfterSwipe={(x: string | number) => {
            if (parseInt(`${x}`, 10) !== currentPage) {
              setCurrentPage(parseInt(`${x}`, 10));
            }
          }}
        >
          {renderStoryList()}
        </CubeNavigationHorizontal>
      );
    } else {
      return (
        <AndroidCubeEffect
          //@ts-ignore
          ref={cube}
          callBackAfterSwipe={(x: string | number) => {
            if (parseInt(`${x}`, 10) !== currentPage) {
              setCurrentPage(parseInt(`${x}`, 10));
            }
          }}
        >
          {renderStoryList()}
        </AndroidCubeEffect>
      );
    }
  };

  return (
    <Fragment>
      <View style={style}>
        <StoryCircleListView
          handleStoryItemPress={_handleStoryItemPress}
          data={dataState}
          avatarSize={avatarSize}
          unPressedBorderColor={unPressedBorderColor}
          pressedBorderColor={pressedBorderColor}
          showText={showAvatarText}
          textStyle={avatarTextStyle}
        />
      </View>
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
    </Fragment>
  );
};

Story.defaultProps = {
  showAvatarText: true,
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
});

export default Story;
