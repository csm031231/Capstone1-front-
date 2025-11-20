// src/screens/MainScreen.js - FCM 통합 완전판

import React, { useEffect, useState } from 'react';
import { View, Keyboard, StyleSheet, Alert } from 'react-native';
import { useAppState, useAppDispatch, actions } from '../store/AppContext';
import { setupFCM } from '../utils/fcmManager';
import { apiService } from '../services/ApiService';
import userService from '../services/userService';
import emergencyMessageService from '../services/emergencyMessageService';
import disasterActionService from '../services/disasterActionService';

import Header from '../components/Header/Header';
import MapContainer from '../components/Map/MapContainer';
import BottomSheet from '../components/BottomSheet/BottomSheet';
import BottomNavigation from '../components/Navigation/BottomNavigation';
import ErrorToast from '../components/common/ErrorToast';

export default function MainScreen() {
  const { currentLocation, currentViewport, selectedTab, error, shelters } = useAppState();
  const dispatch = useAppDispatch();
  const [theme, setTheme] = useState('white');
  const [searchText, setSearchText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const mapRef = React.useRef(null);

  // ✅ 1. 초기화: 로그인 상태 확인 및 FCM 셋업
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const isValid = await userService.checkToken();
      setIsLoggedIn(isValid);

      if (isValid) {
        console.log('✅ 로그인 확인됨');
        // ✅ 로그인 후 FCM 셋업
        await setupFCM();
      }
    } catch (error) {
      console.error('로그인 확인 실패:', error);
      setIsLoggedIn(false);
    }
  };

  // ✅ 2. Viewport 변경 시 대피소 데이터 로드
  useEffect(() => {
    if (currentViewport && selectedTab === '대피소') {
      loadShelters(currentViewport);
    }
  }, [currentViewport, selectedTab]);

  // ✅ 3. 탭 변경 시 각 데이터 로드
  useEffect(() => {
    switch (selectedTab) {
      case '재난문자':
        loadMessages();
        break;
      case '뉴스':
        loadNews();
        break;
      case '재난행동요령':
        loadActions();
        break;
      default:
        break;
    }
  }, [selectedTab]);

  // 재난문자 로드
  const loadMessages = async () => {
    try {
      dispatch(actions.setLoading('messages', true));
      const region = '김해시';
      const response = await emergencyMessageService.getEmergencyMessages(region);

      if (response.success) {
        dispatch(actions.setMessages(response.messages));
      }
    } catch (error) {
      console.error('재난문자 로드 실패:', error);
      dispatch(actions.setError('재난문자를 불러올 수 없습니다'));
    } finally {
      dispatch(actions.setLoading('messages', false));
    }
  };

  // 뉴스 로드 (한 번만 로드)
  const loadNews = async () => {
    try {
      dispatch(actions.setLoading('news', true));
      const data = await apiService.getNews();
      dispatch(actions.setNews(data));
    } catch (error) {
      console.error('뉴스 로드 실패:', error);
      dispatch(actions.setError('뉴스를 불러올 수 없습니다'));
      dispatch(actions.setNews([]));
    } finally {
      dispatch(actions.setLoading('news', false));
    }
  };

  // 재난행동요령 로드
  const loadActions = async () => {
    try {
      dispatch(actions.setLoading('actions', true));
      const response = await disasterActionService.getAllActions(1, 10);

      if (response.success) {
        dispatch(actions.setActions(response.items));
      }
    } catch (error) {
      console.error('행동요령 로드 실패:', error);
      dispatch(actions.setError('행동요령을 불러올 수 없습니다'));
    } finally {
      dispatch(actions.setLoading('actions', false));
    }
  };

  // 대피소 로드
  const loadShelters = async (viewport) => {
    try {
      dispatch(actions.setLoading('shelters', true));

      const bounds = {
        startLat: viewport.startLat,
        endLat: viewport.endLat,
        startLot: viewport.startLot,
        endLot: viewport.endLot
      };

      const data = await apiService.getShelters(bounds, currentLocation);
      dispatch(actions.setShelters(data));
    } catch (error) {
      console.error('대피소 로드 실패:', error);
      dispatch(actions.setError('대피소 정보를 불러올 수 없습니다'));
      dispatch(actions.setShelters([]));
    } finally {
      dispatch(actions.setLoading('shelters', false));
    }
  };

  // 테마 변경
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (mapRef.current && mapRef.current.applyTheme) {
      mapRef.current.applyTheme(newTheme);
    }
  };

  // Viewport 변경
  const handleViewportChange = (viewport) => {
    dispatch(actions.setViewport(viewport));
  };

  // 검색
  const handleSearch = () => {
    Keyboard.dismiss();

    if (!searchText.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    const query = searchText.trim();
    console.log('🔍 검색:', query);

    // 지역명 검색
    const regions = {
      '서울': { latitude: 37.5665, longitude: 126.9780 },
      '부산': { latitude: 35.1796, longitude: 129.0756 },
      '대구': { latitude: 35.8714, longitude: 128.6014 },
      '인천': { latitude: 37.4563, longitude: 126.7052 },
      '광주': { latitude: 35.1595, longitude: 126.8526 },
      '대전': { latitude: 36.3504, longitude: 127.3845 },
      '울산': { latitude: 35.5384, longitude: 129.3114 },
      '세종': { latitude: 36.4800, longitude: 127.2890 },
      '김해': { latitude: 35.2286, longitude: 128.8892 },
      '창원': { latitude: 35.2281, longitude: 128.6811 },
      '진주': { latitude: 35.1800, longitude: 128.1076 },
    };

    for (const [region, coords] of Object.entries(regions)) {
      if (query.includes(region) || region.includes(query)) {
        console.log(`✅ 지역 찾음: ${region}`);

        if (mapRef.current && mapRef.current.updateLocation) {
          mapRef.current.updateLocation(coords);
          Alert.alert('검색 완료', `${region} 지역으로 이동합니다.`);
          setSearchText('');
        }
        return;
      }
    }

    Alert.alert('검색 결과 없음', '지역명을 입력해주세요. (예: 김해, 부산, 서울)');
  };

  // 에러 토스트 닫기
  const handleErrorDismiss = () => {
    dispatch(actions.clearError());
  };

  // 지도 터치 시 키보드 닫기
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <View style={styles.mapLayer}>
        <MapContainer
          ref={mapRef}
          currentLocation={currentLocation}
          onViewportChange={handleViewportChange}
          theme={theme}
          shelters={shelters}
          onMapPress={handleKeyboardDismiss}
        />
      </View>

      {/* 헤더 */}
      <View style={styles.headerLayer}>
        <Header
          theme={theme}
          onThemeChange={handleThemeChange}
          searchText={searchText}
          setSearchText={setSearchText}
          onSearch={handleSearch}
        />
      </View>

      {/* 바텀시트 */}
      <BottomSheet />
      <BottomNavigation />

      {/* 에러 토스트 */}
      {error && (
        <ErrorToast
          message={error}
          onDismiss={handleErrorDismiss}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mapLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  headerLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});