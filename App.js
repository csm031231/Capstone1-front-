import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { AppProvider } from './src/store/AppContext';
import MainScreen from './src/screens/MainScreen';
import ErrorBoundary from './src/components/common/ErrorBoundary';

export default function App() {
  useEffect(() => {
    const initFCM = async () => {
      // 🔥 푸시 권한 요청
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("푸시 권한 거부됨");
        return;
      }

      // 🔥 FCM 토큰 발급
      const token = await messaging().getToken();
      console.log("FCM TOKEN:", token);

      // 🔥 FastAPI로 보내고 싶으면 여기서 POST
      // await fetch("<http://서버주소/save-token>", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ token }),
      // });
    };

    initFCM();
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