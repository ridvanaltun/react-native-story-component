import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';

import { getStatusBarHeight } from 'react-native-safearea-height';

import type { UserStoryItem } from '../index';

interface AnimationBarProps {
  stories: UserStoryItem[];
  currStoryIndex: number;
  progress: Animated.Value;
}

const AnimationBar = ({
  stories,
  currStoryIndex,
  progress,
}: AnimationBarProps) => {
  return (
    <View style={styles.container}>
      {stories.map((_, index) => {
        return (
          <View key={index} style={styles.background}>
            <Animated.View
              style={{
                flex:
                  currStoryIndex === index
                    ? progress
                    : (stories[index] as UserStoryItem).finished
                    ? 1
                    : 0,
                ...styles.active,
              }}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  background: {
    height: 2,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(117, 117, 117, 0.5)',
    marginHorizontal: 2,
    marginTop: getStatusBarHeight(true),
  },
  active: {
    height: 2,
    backgroundColor: '#FFF',
  },
});

export default AnimationBar;
