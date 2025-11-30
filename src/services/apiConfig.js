// apiConfig.js - FINAL VERSION

const getApiBaseUrl = () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // 개발 환경 API URL
    return 'http://192.168.0.16:8000'; 
  } else {
    // 운영 환경 API URL
    return 'https://your-production-domain.com';
  }
};

const API_BASE_URL = getApiBaseUrl();

const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// =========================================================================
// ✅ AsyncStorage 로드 로직 재수정: ReferenceError 방지 로직 강화
// =========================================================================

// 네이티브 전용 모듈을 지연 로드하는 헬퍼 함수
const loadAsyncStorage = () => {
    try {
        if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
             // 💡 require 호출이 실패하면 catch 블록으로 이동하여 null을 반환합니다.
             // 이로써 AsyncStorage를 사용하는 모든 함수가 null 체크를 할 수 있게 됩니다.
             return require('@react-native-async-storage/async-storage').default; 
        }
    } catch (e) {
        console.warn('AsyncStorage load failed:', e.message);
        return null;
    }
    return null;
}

export const getStorageItem = async (key) => {
  try {
    // React Native 환경인 경우에만 AsyncStorage 로드 시도
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      const AsyncStorage = loadAsyncStorage();
      if (AsyncStorage) { // ✅ AsyncStorage가 null이 아닐 때만 사용
         return await AsyncStorage.getItem(key);
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

export const setStorageItem = async (key, value) => { 
    try {
        if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
            const AsyncStorage = loadAsyncStorage();
            if (AsyncStorage) { // ✅ AsyncStorage가 null이 아닐 때만 사용
                await AsyncStorage.setItem(key, value);
                return;
            }
        }
        
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
    } catch (error) {
        console.warn('Storage 저장 실패:', error);
    }
};

export const removeStorageItem = async (key) => { 
  try {
    // React Native 환경인 경우에만 AsyncStorage 로드 시도
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      const AsyncStorage = loadAsyncStorage();
      if (AsyncStorage) { // ✅ AsyncStorage가 null이 아닐 때만 사용
         await AsyncStorage.removeItem(key);
         return;
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

// =========================================================================

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
      if (options.token) {
        config.headers['Authorization'] = `Bearer ${options.token}`;
      } else {
        const token = await getStorageItem('access_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
      config.body = options.body;
    }
    
    // 요청 데이터 로깅
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`API 요청: ${config.method} ${url}`);
      const isJsonBody = config.headers['Content-Type']?.includes('application/json');
      if (config.body) {
        console.log('요청 데이터:', isJsonBody ? JSON.parse(config.body) : config.body);
      }
    }

    const response = await fetch(url, config);
    
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`응답 상태: ${response.status} ${response.statusText}`);
    }

    // --- HTTP 상태 코드 오류 처리 (4xx, 5xx) ---
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
        // 비정상적인 응답 (JSON이 아닌 경우) 처리
        console.log('응답 오류를 JSON으로 파싱할 수 없음 (일반 텍스트일 수 있음).');
      }
      
      if (response.status === 401) {
        await removeStorageItem('access_token');
        await removeStorageItem('user_info');
      }
      
      throw new Error(errorMessage);
    }
    
    // --- 정상 응답 처리 (2xx) ---
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('응답 데이터 (JSON):', JSON.stringify(data, null, 2));
      }
      return data;
    } else {
      const text = await response.text();
      
      if (text.length > 0) {
        console.warn(`API 응답 (${endpoint}): JSON이 아닌 텍스트 응답이 도착했습니다.`, text.substring(0, 50));
        return null; 
      }
      
      return null;
    }
    
  } catch (error) {
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
    CHANGE_PASSWORD: '/users/me/password', // 💡 /users/change-password에서 수정
    DELETE: '/users/delete',
  },
  
  REGION: { // 💡 새 섹션 추가
    ALL: '/users/regions/list',
    SEARCH: '/users/regions/search',
    MY_REGIONS: '/users/regions/my-regions',
    ADD: '/users/regions/add',
    REMOVE: '/users/regions/remove',
    BULK_ADD: '/users/regions/add-multiple',
    CLEAR: '/users/regions/clear',
  },
  
  EMERGENCY: {
    MESSAGES: '/message_router/get_emergency_message',
    RANDOM: '/message_router/get_random_emergency_message', 
    DETAIL: '/message_router/message',
    REGIONS: '/message_router/regions',
    DISASTER_MAP: '/message_router/disaster_map',
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