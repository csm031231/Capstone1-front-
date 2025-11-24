import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';

/**
 * 앱 시작 시 FCM 푸시 권한 요청 + 토큰 발급
 * Android는 권한 manifest에서 처리됨
 * iOS는 requestPermission() 필요
 */
export async function registerForPushNotificationsAsync() {
  try {
    // iOS 권한 요청
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        Alert.alert('푸시 알림 권한 거부됨');
        return;
      }
    }

    // FCM 토큰 발급
    const token = await messaging().getToken();
    console.log('🔥 FCM TOKEN:', token);

    // 원하면 서버로 전송
    // await fetch('https://yourserver.com/save-token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ token }),
    // });

  } catch (error) {
    console.log('FCM 등록 에러:', error);
  }
}
