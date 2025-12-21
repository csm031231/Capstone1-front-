// ============================================
// 📁 src/services/apiConfig.js
// ============================================

const getApiBaseUrl = () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // ⚠️ [중요] 실행 중인 PC의 IP 주소로 변경해주세요. (cmd -> ipconfig 확인)
    // 예: return 'http://192.168.0.15:8000'; 
    return 'http://192.168.0.3:8000'; 
  } else {
    return 'https://your-production-domain.com';
  }
};

export const API_BASE_URL = getApiBaseUrl();

const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// AsyncStorage 안전하게 로드
const loadAsyncStorage = () => {
    try {
        if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
             return require('@react-native-async-storage/async-storage').default; 
        }
    } catch (e) {
        return null;
    }
    return null;
}

export const getStorageItem = async (key) => {
    const AsyncStorage = loadAsyncStorage();
    if (!AsyncStorage) return null;
    try { return await AsyncStorage.getItem(key); } catch (e) { return null; }
};

export const setStorageItem = async (key, value) => {
    const AsyncStorage = loadAsyncStorage();
    if (!AsyncStorage) return;
    try { await AsyncStorage.setItem(key, value); } catch (e) {}
};

export const removeStorageItem = async (key) => {
    const AsyncStorage = loadAsyncStorage();
    if (!AsyncStorage) return;
    try { await AsyncStorage.removeItem(key); } catch (e) {}
};

// ✅ API 엔드포인트 (백엔드 user_router.py와 일치시킴)
export const API_ENDPOINTS = {
  USER: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    ME: '/users/me',
    UPDATE_ME: '/users/me',
    CHANGE_PASSWORD: '/users/me/password',
    // 🔴 백엔드 설정: @router.put("/me/fcm-token") -> 최종 URL: /users/me/fcm-token
    FCM_TOKEN: '/users/me/fcm-token', 
  },
  
  REGION: {
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
    CATEGORIES: '/chatbot/categories'
  },

  MAP: {
    DIRECTIONS: '/directions/directions',
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...DEFAULT_HEADERS, ...options.headers };

    if (!options.skipAuth) {
      const token = await getStorageItem('access_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers };
    
    // 타임아웃
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), options.timeout || 10000);
    config.signal = controller.signal;

    console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    clearTimeout(id);

    if (!response.ok) {
        if (response.status === 401) {
            await removeStorageItem('access_token');
            await removeStorageItem('user_info');
        }
        let errorMessage = `HTTP Error ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    }
    
    if (response.status === 204) return {};
    return await response.json();

  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error.message);
    throw error;
  }
};

export const utils = {
    detectRegionFromLocation: (location) => {
        if (!location) return '전체';
        return '전체'; // 실제 로직은 필요에 따라 복구
    }
};

export default {
  API_ENDPOINTS,
  apiRequest,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  utils
};