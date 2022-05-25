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
import { usePrevious } from './helpers/StateHelpers';

import type { TextStyle } from 'react-native';
import type { IUserStory } from './interfaces/IUserStory';

interface Props {
  item: IUserStory;
  showText?: Boolean;
  textStyle?: TextStyle;
  unPressedBorderColor?: string;
  pressedBorderColor?: string;
  handleStoryItemPress?: (item: IUserStory) => void;
  avatarSize?: number;
}

const StoryCircleListItem = (props: Props) => {
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

  const _handleItemPress = (story: IUserStory) => {
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
                  : 'red',
              }
            : {
                borderColor: pressedBorderColor ? pressedBorderColor : 'grey',
              },
        ]}
      >
        <Image
          style={{
            height: size,
            width: size,
            borderRadius: 100,
          }}
          source={{ uri: item.avatar }}
          defaultSource={
            Platform.OS === 'ios'
              ? require('./assets/images/no_avatar.png')
              : null
          }
        />
      </TouchableOpacity>
      {showText && (
        <Text
          numberOfLines={1}
          ellipsizeMode={'tail'}
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
    borderColor: 'red',
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
