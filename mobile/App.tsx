import React from 'react';
import './global.css';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/app/AppNavigator';
import { configureGoogleAuth } from '@/utils/googleAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnReconnect: true,
    },
  },
});

configureGoogleAuth();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          animated
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={false}
        />
        <QueryClientProvider client={queryClient}>
          <AppNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
