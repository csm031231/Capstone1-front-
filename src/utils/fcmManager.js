// src/utils/fcmManager.js - FCM 토큰 발급 및 백엔드 전송 (완전판)

import { apiRequest } from '../services/apiConfig';

let messaging = null;
try {
    messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
    console.warn('FCM: @react-native-firebase/messaging 모듈을 로드할 수 없습니다.');
}

/**
 * FCM 토큰을 백엔드 서버로 전송
 * API: PUT /users/me/fcm-token
 */
const sendFcmTokenToServer = async (token) => {
    if (!token) {
        console.error('❌ FCM 토큰이 없습니다.');
        return false;
    }

    try {
        console.log('📤 FCM 토큰 백엔드 전송 시작:', token.substring(0, 30) + '...');
        
        const response = await apiRequest('/users/me/fcm-token', {
            method: 'PUT',
            body: JSON.stringify({ 
                fcm_token: token 
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            skipAuth: false,
        });

        console.log('✅ FCM 토큰 백엔드 전송 성공');
        return true;

    } catch (error) {
        console.error('❌ FCM 토큰 전송 실패:', error.message);
        return false;
    }
};

/**
 * FCM 셋업 (로그인 후 호출)
 */
export const setupFCM = async () => {
    if (!messaging) {
        console.warn('⚠️ FCM 모듈 미로드');
        return false;
    }

    try {
        console.log('🚀 FCM 셋업 시작...');

        // 1. 알림 권한 요청
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
            console.warn('⚠️ 알림 권한 거부됨');
            return false;
        }
        console.log('✅ 알림 권한 승인');

        // 2. FCM 토큰 가져오기
        const currentToken = await messaging().getToken();
        
        if (currentToken) {
            console.log('✅ FCM 토큰 획득');
            await sendFcmTokenToServer(currentToken);
        }

        // 3. 토큰 갱신 리스너
        messaging().onTokenRefresh(async (newToken) => {
            console.log('🔄 FCM 토큰 갱신');
            await sendFcmTokenToServer(newToken);
        });

        // 4. 포그라운드 메시지 핸들러
        messaging().onMessage(async (remoteMessage) => {
            console.log('📬 포그라운드 메시지:', remoteMessage.notification?.title);
        });

        console.log('✅ FCM 셋업 완료');
        return true;

    } catch (error) {
        console.error('❌ FCM 셋업 실패:', error);
        return false;
    }
};

/**
 * 테스트용: FCM 토큰 확인
 */
export const testFCMToken = async () => {
    if (!messaging) {
        console.warn('FCM 모듈 없음');
        return null;
    }

    try {
        const token = await messaging().getToken();
        console.log('🧪 현재 FCM 토큰:', token);
        return token;
    } catch (error) {
        console.error('🧪 FCM 토큰 확인 실패:', error);
        return null;
    }
};

export default {
    setupFCM,
    testFCMToken,
};