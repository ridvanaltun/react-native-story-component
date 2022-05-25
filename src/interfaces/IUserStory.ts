export interface IUserStory {
  id: number;
  avatar: string;
  name: string;
  stories: IUserStoryItem[];
  seen?: Boolean;
}

export interface IUserStoryItem {
  id: number;
  image: string;
  onPress?: any;
  swipeText?: string;
}
