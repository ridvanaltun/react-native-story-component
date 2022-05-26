import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { faker } from '@faker-js/faker';

import Story from 'react-native-story-component';

const createData = () => {
  const array = [];

  const USER_COUNT = 10;
  const USER_STORY_COUNT = 15;

  for (let i = 1; i <= USER_COUNT; i++) {
    const storyArray = [];
    for (let k = 1; k <= USER_STORY_COUNT; k++) {
      storyArray.push({
        id: i,
        image: faker.image.imageUrl(1080, 1920, undefined, true),
        swipeText: faker.lorem.text(),
        onPress: () => console.log(`Story ${i} swiped!`),
      });
    }

    array.push({
      // seen: Math.random() < 0.5,
      id: i,
      avatar: faker.image.avatar(),
      name: faker.name.findName(),
      stories: storyArray,
    });
  }

  return array;
};

const App = () => {
  return (
    <>
      <StatusBar backgroundColor="#000" style="light" />
      <View style={styles.container}>
        <Story
          data={createData()}
          duration={10}
          customSwipeUpComponent={() => (
            <View>
              <Text>Swipe</Text>
            </View>
          )}
          style={styles.story}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  story: {
    marginTop: 70,
  },
});

export default App;
