import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import StoryCircleListItem from './StoryCircleListItem';

import type { TextStyle } from 'react-native';
import type { IUserStory } from '../index';

interface Props {
  data: IUserStory[];
  handleStoryItemPress?: (item: IUserStory, index: number) => void;
  unPressedBorderColor?: string;
  pressedBorderColor?: string;
  avatarSize?: number;
  showText?: Boolean;
  textStyle?: TextStyle;
}

const StoryCircleListView = (props: Props) => {
  const {
    data,
    handleStoryItemPress,
    unPressedBorderColor,
    pressedBorderColor,
    avatarSize,
    showText,
    textStyle,
  } = props;

  return (
    <View>
      <FlatList
        keyExtractor={(item) => `story-item-${item.id}`}
        data={data}
        horizontal
        style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={<View style={styles.footer} />}
        renderItem={({ item, index }) => (
          <StoryCircleListItem
            avatarSize={avatarSize}
            handleStoryItemPress={() =>
              handleStoryItemPress && handleStoryItemPress(item, index)
            }
            unPressedBorderColor={unPressedBorderColor}
            pressedBorderColor={pressedBorderColor}
            item={item}
            showText={showText}
            textStyle={textStyle}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 12,
  },
  footer: {
    flex: 1,
    width: 8,
  },
});

export default StoryCircleListView;
