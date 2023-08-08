import React from 'react';
import { Image, StyleSheet, ImageSourcePropType } from 'react-native';

import { getStatusBarHeight } from 'react-native-safearea-height';

import Computed from '../helpers/Computed';

interface StoryImageProps {
  onLoadEnd: () => void;
  height: number;
  width: number;
  source: ImageSourcePropType;
}

const StoryImage = ({ onLoadEnd, height, width, source }: StoryImageProps) => {
  return (
    <Image
      source={source}
      style={[
        styles.image,
        {
          width,
          height,
        },
      ]}
      onLoadEnd={onLoadEnd}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    maxWidth: Computed.DEVICE_WIDTH,
    maxHeight: Computed.DEVICE_HEIGHT - getStatusBarHeight(true),
  },
});

export default StoryImage;
