import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { AppProvider } from './src/store/AppContext';
import MainScreen from './src/screens/MainScreen';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { registerForPushNotificationsAsync } from './src/fcm/fcm'; // fcm.js에서 가져오기

export default function App() {
  useEffect(() => {
    // 앱 시작 시 FCM 권한 요청 + 토큰 발급
    registerForPushNotificationsAsync();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.container}>
          <MainScreen />
        </View>
      </AppProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
