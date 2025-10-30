// src/store/AppContext.js - 대한민국 전국 서비스 버전
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as Location from 'expo-location';

// 액션 타입들
export const ActionTypes = {
  SET_CURRENT_LOCATION: 'SET_CURRENT_LOCATION',
  SET_VIEWPORT: 'SET_VIEWPORT',
  SET_SELECTED_TAB: 'SET_SELECTED_TAB',
  SET_SEARCH_TEXT: 'SET_SEARCH_TEXT',
  SET_NEWS: 'SET_NEWS',
  SET_SHELTERS: 'SET_SHELTERS',
  SET_MESSAGES: 'SET_MESSAGES',           // 새로 추가
  SET_ACTIONS: 'SET_ACTIONS',             // 새로 추가
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_MAP_READY: 'SET_MAP_READY',
  SET_SHOW_SHELTERS: 'SET_SHOW_SHELTERS',
  SET_USER_INFO: 'SET_USER_INFO',         // 새로 추가
  SET_IS_LOGGED_IN: 'SET_IS_LOGGED_IN',   // 새로 추가
};

// 대한민국 중심 좌표 (서울 시청)
const KOREA_DEFAULT_LOCATION = {
  latitude: 37.5665,
  longitude: 126.9780
};

// 한국 좌표인지 확인하는 함수
const isKoreanCoordinate = (lat, lng) => {
  return lat >= 33.0 && lat <= 38.5 && lng >= 124.0 && lng <= 132.0;
};

// 위치 검증 및 필터링 함수
const validateAndFilterLocation = (location) => {
  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    console.log('❌ 잘못된 위치 데이터, 대한민국 중심 좌표 사용');
    return KOREA_DEFAULT_LOCATION;
  }

  const { latitude, longitude } = location;
  
  // 한국 좌표가 아닌 경우 대한민국 중심 좌표로 대체
  if (!isKoreanCoordinate(latitude, longitude)) {
    console.log(`🌏 해외 좌표 감지됨 (${latitude}, ${longitude}), 대한민국 중심 좌표로 대체`);
    return KOREA_DEFAULT_LOCATION;
  }

  console.log(`✅ 유효한 한국 좌표 확인: ${latitude}, ${longitude}`);
  return { latitude, longitude };
};

// 초기 상태
const initialState = {
  currentLocation: KOREA_DEFAULT_LOCATION,
  currentViewport: null,
  selectedTab: '재난문자',
  searchText: '',
  
  // 데이터
  news: [],
  shelters: [],
  messages: [],    // 새로 추가
  actions: [],     // 새로 추가
  
  // 로딩 상태
  loading: {
    news: false,
    shelters: false,
    messages: false,    // 새로 추가
    actions: false,     // 새로 추가
    location: false
  },
  
  error: null,
  mapReady: false,
  showShelters: true,
  
  // 사용자 인증
  isLoggedIn: false,  // 새로 추가
  userInfo: null,     // 새로 추가
};

// 리듀서
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_LOCATION: {
      const validatedLocation = validateAndFilterLocation(action.payload);
      return {
        ...state,
        currentLocation: validatedLocation,
        error: null
      };
    }
      
    case ActionTypes.SET_VIEWPORT:
      return {
        ...state,
        currentViewport: action.payload
      };
      
    case ActionTypes.SET_SELECTED_TAB:
      return {
        ...state,
        selectedTab: action.payload
      };
      
    case ActionTypes.SET_SEARCH_TEXT:
      return {
        ...state,
        searchText: action.payload
      };
      
    case ActionTypes.SET_NEWS: {
      const newsData = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        news: newsData
      };
    }
      
    case ActionTypes.SET_SHELTERS: {
      const sheltersData = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        shelters: sheltersData
      };
    }
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: {
          news: false,
          shelters: false,
          messages: false,    // 새로 추가
          actions: false,     // 새로 추가
          location: false
        }
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ActionTypes.SET_MAP_READY:
      return {
        ...state,
        mapReady: action.payload
      };

    case ActionTypes.SET_SHOW_SHELTERS:
      return {
        ...state,
        showShelters: action.payload
      };
    // 새 reducer 케이스들 추가
    // ============================================
    case ActionTypes.SET_MESSAGES: {
      const messagesData = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        messages: messagesData,
      };
    }

    case ActionTypes.SET_ACTIONS: {
      const actionsData = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        actions: actionsData,
      };
    }

    case ActionTypes.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.payload,
        isLoggedIn: action.payload !== null,
      };

    case ActionTypes.SET_IS_LOGGED_IN:
      return {
        ...state,
        isLoggedIn: action.payload,
      };
    // ============================================
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

// Context 생성
const AppStateContext = createContext(undefined);
const AppDispatchContext = createContext(undefined);

// Provider 컴포넌트
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 초기 위치 설정
  useEffect(() => {
    let isMounted = true;
    
    const initializeLocation = async () => {
      try {
        console.log('📍 위치 권한 요청 시작...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (!isMounted) return;
        
        if (status !== 'granted') {
          console.log('❌ 위치 권한 거부됨, 대한민국 중심 좌표 사용');
          dispatch({
            type: ActionTypes.SET_CURRENT_LOCATION,
            payload: KOREA_DEFAULT_LOCATION
          });
          return;
        }

        console.log('✅ 위치 권한 승인됨, 현재 위치 가져오는 중...');
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
        });
        
        if (!isMounted) return;
        
        const currentPos = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };

        console.log('📱 시스템에서 받은 위치:', currentPos);

        dispatch({
          type: ActionTypes.SET_CURRENT_LOCATION,
          payload: currentPos
        });
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('❌ 위치 정보 가져오기 실패:', error);
        console.log('🇰🇷 대한민국 중심 좌표로 설정');
        
        dispatch({
          type: ActionTypes.SET_CURRENT_LOCATION,
          payload: KOREA_DEFAULT_LOCATION
        });
      }
    };
    
    // 5초 후에 위치 초기화 시작
    const timer = setTimeout(() => {
      initializeLocation();
    }, 5000);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// Custom Hooks
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within AppProvider');
  }
  return context;
}

// 액션 크리에이터들
export const actions = {
  setLocation: (location) => {
    const validatedLocation = validateAndFilterLocation(location);
    return {
      type: ActionTypes.SET_CURRENT_LOCATION,
      payload: validatedLocation
    };
  },
  
  setViewport: (viewport) => ({
    type: ActionTypes.SET_VIEWPORT,
    payload: viewport
  }),
  
  setSelectedTab: (tab) => ({
    type: ActionTypes.SET_SELECTED_TAB,
    payload: tab
  }),
  
  setSearchText: (text) => ({
    type: ActionTypes.SET_SEARCH_TEXT,
    payload: text
  }),
  
  setNews: (news) => ({
    type: ActionTypes.SET_NEWS,
    payload: Array.isArray(news) ? news : []
  }),
  
  setShelters: (shelters) => ({
    type: ActionTypes.SET_SHELTERS,
    payload: Array.isArray(shelters) ? shelters : []
  }),
  
  setLoading: (key, value) => ({
    type: ActionTypes.SET_LOADING,
    payload: { key, value }
  }),
  
  setError: (error) => ({
    type: ActionTypes.SET_ERROR,
    payload: error
  }),
  
  clearError: () => ({
    type: ActionTypes.CLEAR_ERROR
  }),

  setMapReady: (ready) => ({
    type: ActionTypes.SET_MAP_READY,
    payload: ready
  }),

  setShowShelters: (show) => ({
    type: ActionTypes.SET_SHOW_SHELTERS,
    payload: show
  }),
  // 새 action creators 추가
  setMessages: (messages) => ({
    type: ActionTypes.SET_MESSAGES,
    payload: Array.isArray(messages) ? messages : [],
  }),

  setActions: (actions) => ({
    type: ActionTypes.SET_ACTIONS,
    payload: Array.isArray(actions) ? actions : [],
  }),

  setUserInfo: (userInfo) => ({
    type: ActionTypes.SET_USER_INFO,
    payload: userInfo,
  }),

  setIsLoggedIn: (isLoggedIn) => ({
    type: ActionTypes.SET_IS_LOGGED_IN,
    payload: isLoggedIn,
  }),
};