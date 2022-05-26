# react-native-story-component <!-- omit in toc -->

[![npm version](https://img.shields.io/npm/v/react-native-story-component.svg)](https://npmjs.com/package/react-native-story-component)
[![CircleCI](https://circleci.com/gh/ridvanaltun/react-native-story-component/tree/master.svg?style=shield)](https://circleci.com/gh/ridvanaltun/react-native-story-component/tree/master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![license](https://img.shields.io/npm/l/react-native-story-component.svg)](https://github.com/ridvanaltun/react-native-story-component/blob/master/LICENSE)

> A decent story component for React-Native

# Table of Contents <!-- omit in toc -->

- [Getting started](#getting-started)
- [Props](#props)
- [Usage](#usage)
- [Example App](#example-app)
- [Credit](#credit)
- [Contributing](#contributing)
- [License](#license)

## Getting started

```sh
npm i react-native-story-component
```

## Props

| Name                   | Description                                         | Type                                                                                         | Default Value |
| :--------------------- | :-------------------------------------------------- | :------------------------------------------------------------------------------------------- | :-----------: |
| data                   | Array of IUserStory. You can check from interfaces. | object                                                                                       |               |
| unPressedBorderColor   | Unpressed border color of profile circle            | color                                                                                        |      red      |
| pressedBorderColor     | Pressed border color of profile circle              | color                                                                                        |     grey      |
| onClose                | Todo when close                                     | function                                                                                     |     null      |
| onStart                | Todo when start                                     | function                                                                                     |     null      |
| duration               | Per story duration seconds                          | number                                                                                       |      10       |
| swipeText              | Text of swipe component                             | string                                                                                       |   Swipe Up    |
| customSwipeUpComponent | For use custom component for swipe area             | () => component                                                                              |               |
| customCloseComponent   | For use custom component for close button           | () => component                                                                              |               |
| customStoryList        | For use custom component for story list             | ({data: IUserStory[], onStoryPress: (item: IUserStory, index: number) => void}) => component |               |
| avatarSize             | Size of avatar circle                               | number                                                                                       |      60       |
| showAvatarText         | For show or hide avatar text.                       | bool                                                                                         |     true      |
| textStyle              | For avatar text style                               | TextStyle                                                                                    |               |

## Usage

```jsx
import Stories from 'react-native-story-component';

const App = () => {
  return (
    <Stories
      data={[
        {
          id: 1,
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          name: 'Marvin Lane',
          stories: [
            {
              id: 1,
              image: 'https://picsum.photos/1080/1920',
              swipeText: 'Custom swipe text for this story',
              onPress: () => console.log('story 1 swiped'),
            },
            {
              id: 2,
              image: 'https://picsum.photos/1080/1920',
            },
          ],
        },
        {
          id: 2,
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          name: 'Manuel Weaver',
          stories: [
            {
              id: 1,
              image: 'https://picsum.photos/1080/1920',
              swipeText: 'Custom swipe text for this story',
              onPress: () => console.log('story 1 swiped'),
            },
            {
              id: 2,
              image: 'https://picsum.photos/1080/1920',
              swipeText: 'Custom swipe text for this story',
              onPress: () => console.log('story 2 swiped'),
            },
          ],
        },
      ]}
      duration={10}
      onStart={(item) => {
        console.log(item);
      }}
      onClose={(item) => {
        console.log('close: ', item);
      }}
      customSwipeUpComponent={() => (
        <View>
          <Text>Swipe</Text>
        </View>
      )}
    />
  );
};
```

## Example App

```sh
# clone the project
git clone https://github.com/ridvanaltun/react-native-story-component.git

# go into the example folder
cd react-native-story-component/example

# install dependencies
npm i

# run for android
npm run android

# or

# run for ios
npm run ios
```

## Credit

I copied and rewrite the codebase from https://github.com/caglardurmus/react-native-insta-story in this project. I created this project because I was needed a better one.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
