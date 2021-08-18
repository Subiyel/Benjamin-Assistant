import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import  Home  from "./src/screen/Home";



const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    flex: 1,
    backgroundColor: "#041E42" //isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
        
        <View style={styles.Header1}>
          <Text style={styles.statusBarText}>Benjamin Voice Assistant</Text>
        </View>

        <Home />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Header1:{
    backgroundColor: "#041E42",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusBarText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  
});

export default App;
