import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import InstaStory from 'react-native-story-component';

const createData = () => {
  const array = [];

  const userCount = 10;
  const userStoryCount = 15;

  for (let i = 1; i <= userCount; i++) {
    const storyArray = [];
    for (let k = 1; k <= userStoryCount; k++) {
      storyArray.push({
        id: i,
        image: 'https://picsum.photos/500/800?random=' + Math.random(),
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log(`story ${i} swiped`),
      });
    }

    array.push({
      // seen: Math.random() < 0.5,
      id: i,
      avatar: 'https://picsum.photos/200/300?random=' + Math.random(),
      name: 'Test User ' + i,
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
        <InstaStory
          data={createData()}
          duration={10}
          customSwipeUpComponent={
            <View>
              <Text>Swipe</Text>
            </View>
          }
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
