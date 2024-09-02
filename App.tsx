import {StatusBar, StyleSheet, SafeAreaView} from 'react-native';
import React from 'react';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import FlatListSearch from './components/FlatListSearch';

const queryClient = new QueryClient();
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={style.container}>
        <StatusBar
          barStyle="light-content"
          translucent={true}
          backgroundColor={'transparent'}
        />
        <FlatListSearch />
      </SafeAreaView>
    </QueryClientProvider>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'skyblue',
  },
});

export default App;
