// ============================================
// 📁 App.js
// ============================================
import React, { useEffect } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// ✅ 네비게이션 관련 임포트 (추가됨)
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from './src/store/AppContext';
import MainScreen from './src/screens/MainScreen';
import ErrorBoundary from './src/components/common/ErrorBoundary';

// 스택 네비게이터 생성
const Stack = createNativeStackNavigator();

export default function App() {
  
  // 🔥 FCM 권한 및 토큰 로직 (기존 코드 유지)
  useEffect(() => {
    const initFCM = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("푸시 권한 거부됨");
        return;
      }

      const token = await messaging().getToken();
      console.log("FCM TOKEN:", token);
    };

    initFCM();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        {/* ✅ SafeAreaProvider와 NavigationContainer로 감싸야 함 */}
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {/* Header.js에서 reset할 때 사용한 이름 'Home'과 일치해야 함 */}
              <Stack.Screen name="Home" component={MainScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        </SafeAreaProvider>
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