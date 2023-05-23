import React from 'react';
import {
  Image,
  Dimensions,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';

import { getStatusBarHeight } from 'react-native-safearea-height';

const { width, height } = Dimensions.get('window');

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
    maxWidth: width,
    maxHeight: height - getStatusBarHeight(true),
  },
});

export default StoryImage;
