// apiConfig.js - 수정된 버전 (AsyncStorage 의존성 제거 + 랜덤 엔드포인트 추가)

const getApiBaseUrl = () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'http://172.20.10.5:8000'; 
  } else {
    return 'https://your-production-domain.com';
  }
};

const API_BASE_URL = getApiBaseUrl();

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// AsyncStorage 헬퍼 함수 (환경에 따라 다르게 동작)
const getStorageItem = async (key) => {
  try {
    // React Native 환경
    if (typeof require !== 'undefined') {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.getItem(key);
      } catch (e) {
        // AsyncStorage가 없으면 넘어감
      }
    }
    
    // 웹 환경 (localStorage 사용)
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    
    return null;
  } catch (error) {
    console.warn('Storage 접근 실패:', error);
    return null;
  }
};

const removeStorageItem = async (key) => {
  try {
    // React Native 환경
    if (typeof require !== 'undefined') {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem(key);
        return;
      } catch (e) {
        // AsyncStorage가 없으면 넘어감
      }
    }
    
    // 웹 환경
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Storage 삭제 실패:', error);
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const config = {
      method: options.method || 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
    };

    // 인증 토큰 처리
    if (!options.skipAuth) {
      // 옵션으로 토큰이 직접 제공되었는지 확인
      if (options.token) {
        config.headers['Authorization'] = `Bearer ${options.token}`;
      } else {
        // Storage에서 토큰 가져오기 시도
        const token = await getStorageItem('access_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
      config.body = options.body;
    }

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`API 요청: ${config.method} ${url}`);
      if (config.body) {
        console.log('요청 데이터:', JSON.parse(config.body));
      }
    }

    const response = await fetch(url, config);
    
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`응답 상태: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const responseText = await response.text();
        if (responseText) {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData?.detail
            ? (Array.isArray(errorData.detail) ? JSON.stringify(errorData.detail) : errorData.detail)
            : errorData?.message || errorMessage;
        }
      } catch (parseError) {
        console.log('응답을 JSON으로 파싱할 수 없음:', parseError);
      }
      
      if (response.status === 401) {
        await removeStorageItem('access_token');
        await removeStorageItem('user_info');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('응답 데이터:', JSON.stringify(data, null, 2));
    }

    return data;
    
  } catch (error) {
    console.error(`API 오류 (${endpoint}):`, error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    
    throw error;
  }
};

export const API_ENDPOINTS = {
  USER: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    ME: '/users/me',
    UPDATE_ME: '/users/me',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE: '/users/delete',
  },
  
  EMERGENCY: {
    MESSAGES: '/message_router/get_emergency_message',
    RANDOM: '/message_router/get_random_emergency_message', // ✅ 새로 추가
    DETAIL: '/message_router/message',
    REGIONS: '/message_router/regions',
  },
  
  ACTION: {
    ACTIONS: '/disaster-actions',
    CATEGORIES: '/disaster-actions/categories',
    STATS: '/disaster-actions/categories/stats'
  },
  
  SHELTER: {
    LIST: '/shelter_router/get_shelter',
  },
  
  CHATBOT: {
    ASK: '/chatbot/ask',
    ASK_SMART: '/chatbot/ask-smart',
    HEALTH: '/chatbot/health',
    CATEGORIES: '/chatbot/categories',
  },
  
  SYSTEM: {
    HEALTH: '/health',
    ROOT: '/',
  }
};

export const checkConnection = async () => {
  try {
    const response = await apiRequest('/health', { skipAuth: true });
    return response.status === 'healthy';
  } catch (error) {
    console.error('연결 상태 확인 실패:', error.message);
    return false;
  }
};

export default {
  apiRequest,
  checkConnection,
  API_ENDPOINTS,
  API_BASE_URL,
};