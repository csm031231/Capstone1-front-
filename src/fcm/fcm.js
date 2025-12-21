// ============================================
// 📁 src/fcm/fcm.js
// ============================================
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// ✅ getToken 함수 (명시적 Named Export)
export const getToken = async () => {
  try {
    // iOS 권한 요청
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
      if (!enabled) {
        console.log('🚫 [FCM] iOS 권한 거부됨');
        return null;
      }
    }

    // 토큰 가져오기
    const token = await messaging().getToken();
    console.log('🔥 [FCM] 발급된 토큰:', token);
    return token;

  } catch (error) {
    console.error('❌ [FCM] 토큰 가져오기 실패:', error);
    return null;
  }
};

// 앱 시작 시 권한 요청용 (필요하다면 유지)
export const registerForPushNotificationsAsync = async () => {
  return await getToken();
};