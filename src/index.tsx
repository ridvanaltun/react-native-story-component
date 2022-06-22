import { Story } from './components';

export enum ActionStates {
  PREVIOUS,
  NEXT,
}

export interface IUserStory {
  id: number | string;
  avatar: any; // @todo
  name: string;
  stories: IUserStoryItem[];
  seen?: Boolean;
  extra?: {
    [key: string]: any;
  };
}

export interface IUserStoryItem {
  id: number | string;
  image: string;
  onPress?: () => void;
  swipeText?: string;
  finished?: boolean;
}

export interface ICustomStoryView {
  index: number;
  data: IUserStory;
  currentPage: number;
  changeStory: (state: ActionStates) => void;
  close: () => void;
}

export interface ICustomStoryList {
  data: IUserStory[];
  onStoryPress: (item: IUserStory, index: number) => void;
}

export interface ICustomProfileBanner {
  image: any;
  name: string;
}

export interface ICustomStoryImage {
  image: String;
  onLoadEnd: () => void;
  imageWidth: Number;
  imageHeight: Number;
}

export default Story;
