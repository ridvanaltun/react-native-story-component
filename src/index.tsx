import { Story } from './components';

declare module './animations/AndroidCubeEffect' {}

export enum ActionStates {
  PREVIOUS,
  NEXT,
}

export interface UserStory {
  id: number | string;
  avatar: any; // @todo
  name: string;
  stories: UserStoryItem[];
  seen?: boolean;
  extra?: {
    [key: string]: any;
  };
}

export interface UserStoryItem {
  id: number | string;
  image: string;
  onPress?: () => void;
  swipeText?: string;
  finished?: boolean;
}

export interface CustomStoryView {
  index: number;
  data: UserStory;
  currentPage: number;
  changeStory: (state: ActionStates) => void;
  close: () => void;
}

export interface CustomStoryList {
  data: UserStory[];
  onStoryPress: (item: UserStory, index: number) => void;
}

export interface CustomProfileBanner {
  image: any;
  name: string;
}

export interface CustomStoryImage {
  image: string;
  onLoadEnd: () => void;
  imageWidth: number;
  imageHeight: number;
}

export default Story;
