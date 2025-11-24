// src/screens/MainScreen.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Keyboard, StyleSheet, Alert } from 'react-native';
import { useAppState, useAppDispatch, actions } from '../store/AppContext';
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
  const [relatedSearches, setRelatedSearches] = useState([]);
  const [showRelatedSearches, setShowRelatedSearches] = useState(false);
  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  // 🟢 viewport 변경 시 대피소 자동 로드
  useEffect(() => {
    if (currentViewport && selectedTab === '대피소') {
      loadShelters(currentViewport);
    }
  }, [currentViewport, selectedTab]);

  // 🟢 탭 변경 시 필요한 데이터 로드
  useEffect(() => {
    switch (selectedTab) {
      case '재난문자': loadMessages(); break;
      case '뉴스': loadNews(); break;
      case '재난행동요령': loadActions(); break;
      default: break;
    }
  }, [selectedTab]);

  // 🟢 컴포넌트 마운트 시 뉴스 로드
  useEffect(() => { loadNews(); }, []);

  // 🟢 검색 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // 🔹 테마 변경
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    mapRef.current?.applyTheme?.(newTheme);
  };

  // 🔹 대피소 데이터 로드
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
    } catch (e) {
      console.error('대피소 로드 실패:', e);
      dispatch(actions.setError('대피소 정보를 불러올 수 없습니다'));
      dispatch(actions.setShelters([]));
    } finally {
      dispatch(actions.setLoading('shelters', false));
    }
  };

  // 🔹 뉴스 로드
  const loadNews = async () => {
    try {
      dispatch(actions.setLoading('news', true));
      const data = await apiService.getNews();
      dispatch(actions.setNews(data));
    } catch (e) {
      console.error('뉴스 로드 실패:', e);
      dispatch(actions.setError('뉴스를 불러올 수 없습니다'));
      dispatch(actions.setNews([]));
    } finally {
      dispatch(actions.setLoading('news', false));
    }
  };

  // 🔹 재난문자 로드
  const loadMessages = async () => {
    try {
      dispatch(actions.setLoading('messages', true));
      const region = '김해시'; // 필요 시 유동적으로 바꾸세요
      const response = await emergencyMessageService.getEmergencyMessages(region);
      if (response.success) dispatch(actions.setMessages(response.messages));
    } catch (e) {
      console.error('재난문자 로드 실패:', e);
      dispatch(actions.setError('재난문자를 불러올 수 없습니다'));
    } finally {
      dispatch(actions.setLoading('messages', false));
    }
  };

  // 🔹 재난행동요령 로드
  const loadActions = async () => {
    try {
      dispatch(actions.setLoading('actions', true));
      const response = await disasterActionService.getAllActions(1, 10);
      if (response.success) dispatch(actions.setActions(response.items));
    } catch (e) {
      console.error('재난행동요령 로드 실패:', e);
      dispatch(actions.setError('재난행동요령을 불러올 수 없습니다'));
    } finally {
      dispatch(actions.setLoading('actions', false));
    }
  };

  // 🔹 검색어 자동완성
  const handleSearchTextChange = useCallback((text) => {
    setSearchText(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!text.trim()) {
      setRelatedSearches([]);
      setShowRelatedSearches(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      // shelters 이름 기반 자동완성
      const matches = (shelters || [])
        .filter(s => s.REARE_NM?.includes(text) || s.RONA_DADDR?.includes(text))
        .slice(0, 10)
        .map(s => s.REARE_NM);
      setRelatedSearches(matches);
      setShowRelatedSearches(matches.length > 0);
    }, 300);
  }, [shelters]);

  // 🔹 관련 검색 클릭
  const handleRelatedSearchClick = (searchItem) => {
    setSearchText(searchItem);
    setShowRelatedSearches(false);
    handleSearch(searchItem);
  };

  // 🔹 검색 실행
  const handleSearch = async (customQuery) => {
    Keyboard.dismiss();
    const query = (customQuery || searchText).trim();
    if (!query) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    // shelters 검색
    const matchedShelter = (shelters || []).find(s =>
      s.REARE_NM?.includes(query) || s.RONA_DADDR?.includes(query)
    );

    if (matchedShelter && mapRef.current?.moveAndZoom) {
      mapRef.current.moveAndZoom(matchedShelter.latitude, matchedShelter.longitude, 15);
      dispatch(actions.setSelectedTab('대피소'));
      setSearchText('');
      setRelatedSearches([]);
      return;
    }

    Alert.alert('검색 결과 없음', `"${query}"에 대한 검색 결과가 없습니다.`);
    setRelatedSearches([]);
  };

  const handleViewportChange = (viewport) => dispatch(actions.setViewport(viewport));
  const handleErrorDismiss = () => dispatch(actions.clearError());
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
    if (showRelatedSearches) setShowRelatedSearches(false);
  };
  const handleBottomSheetClose = () => mapRef.current?.clearRoute?.();

  return (
    <View style={styles.container}>
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

      <View style={styles.headerLayer}>
        <Header
          theme={theme}
          onThemeChange={handleThemeChange}
          searchText={searchText}
          setSearchText={setSearchText}
          onSearch={handleSearch}
          relatedSearches={relatedSearches}
          onRelatedSearchClick={handleRelatedSearchClick}
          showRelatedSearches={showRelatedSearches}
          onSearchTextChange={handleSearchTextChange}
        />
      </View>

      <BottomSheet onClose={handleBottomSheetClose} mapRef={mapRef} />
      <BottomNavigation />

      {error && <ErrorToast message={error} onDismiss={handleErrorDismiss} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },
  headerLayer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
});
