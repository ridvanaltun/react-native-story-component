import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { faker } from '@faker-js/faker';

import Story from 'react-native-story-component';

const createStories = () => {
  const USER_COUNT = 5;
  const USER_STORY_COUNT = 3;

  return [...Array(USER_COUNT).keys()].map((i) => ({
    id: `user-${i}`,
    avatar: faker.image.avatar(),
    name: faker.name.findName(),
    // seen: Math.random() < 0.5,
    stories: [...Array(USER_STORY_COUNT).keys()].map((y) => ({
      id: `story-${i}-${y}`,
      image: faker.image.imageUrl(1080, 1920, undefined, true),
      swipeText: faker.lorem.text(),
      onPress: () => console.log(`Story ${i}-${y} swiped!`),
    })),
  }));
};

const App = () => {
  return (
    <>
      <StatusBar backgroundColor="#000" style="light" />
      <View style={styles.container}>
        <Story
          data={createStories()}
          duration={10}
          // customStoryView={({ index }) => {
          //   return (
          //     <View
          //       key={index}
          //       style={{
          //         backgroundColor: '#fff',
          //       }}
          //     >
          //       <Text>Custom View</Text>
          //     </View>
          //   );
          // }}
          customSwipeUpButton={() => (
            <View>
              <Text>Swipe</Text>
            </View>
          )}
          storyListStyle={styles.story}
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
