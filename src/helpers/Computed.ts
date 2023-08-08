import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default {
  DEVICE_WIDTH: width,
  DEVICE_HEIGHT: height,
};
