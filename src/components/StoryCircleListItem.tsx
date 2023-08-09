/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';

import { isUrl } from '../helpers/ValidationHelpers';
import usePrevious from '../helpers/usePrevious';

import type { TextStyle } from 'react-native';
import type { UserStory } from '../index';

interface StoryCircleListItemProps {
  item: UserStory;
  showText?: boolean;
  textStyle?: TextStyle;
  unPressedBorderColor?: string;
  pressedBorderColor?: string;
  handleStoryItemPress?: (item: UserStory) => void;
  avatarSize?: number;
}

const StoryCircleListItem = (props: StoryCircleListItemProps) => {
  const {
    item,
    unPressedBorderColor,
    pressedBorderColor,
    avatarSize,
    showText,
    textStyle,
    handleStoryItemPress,
  } = props;

  const [isPressed, setIsPressed] = useState(props?.item?.seen);

  const prevSeen = usePrevious(props?.item?.seen);

  useEffect(() => {
    if (prevSeen !== props?.item?.seen) {
      setIsPressed(props?.item?.seen);
    }
  }, [prevSeen, props?.item?.seen]);

  const _handleItemPress = (story: UserStory) => {
    if (handleStoryItemPress) handleStoryItemPress(story);

    setIsPressed(true);
  };

  const size = avatarSize ?? 60;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => _handleItemPress(item)}
        style={[
          styles.avatarWrapper,
          {
            height: size + 4,
            width: size + 4,
          },
          !isPressed
            ? {
                borderColor: unPressedBorderColor
                  ? unPressedBorderColor
                  : '#FF0000',
              }
            : {
                borderColor: pressedBorderColor
                  ? pressedBorderColor
                  : '#808080',
              },
        ]}
      >
        <Image
          style={{
            height: size,
            width: size,
            borderRadius: size / 2,
          }}
          source={isUrl(item.avatar) ? { uri: item.avatar } : item.avatar}
          defaultSource={
            Platform.OS === 'ios'
              ? require('../assets/images/no_avatar.png')
              : null
          }
        />
      </TouchableOpacity>
      {showText && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            width: size + 4,
            ...styles.text,
            ...textStyle,
          }}
        >
          {item.name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginRight: 10,
  },
  avatarWrapper: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: '#FF0000',
    borderRadius: 100,
    height: 64,
    width: 64,
  },
  text: {
    marginTop: 3,
    textAlign: 'center',
    alignItems: 'center',
    fontSize: 11,
  },
});

export default StoryCircleListItem;
