// src/screens/MainScreen.js
import React, { useEffect, useState } from 'react';
import { View, Keyboard, StyleSheet, Alert } from 'react-native';
import { useAppState, useAppDispatch, actions } from '../store/AppContext';
import { apiService } from '../services/ApiService';
import Header from '../components/Header/Header';
import MapContainer from '../components/Map/MapContainer';
import BottomSheet from '../components/BottomSheet/BottomSheet';
import BottomNavigation from '../components/Navigation/BottomNavigation';
import ErrorToast from '../components/common/ErrorToast';

// ⭐ 백엔드 서버 주소 (FastAPI 서버가 실행중인 PC의 IP 주소로 변경하세요)
const API_BASE_URL = 'http://192.168.0.16:8000'; // << 💻 이 부분을 꼭 수정해주세요!

export default function MainScreen() {
  const { currentLocation, currentViewport, selectedTab, error, shelters } = useAppState();
  const dispatch = useAppDispatch();
  const [theme, setTheme] = useState('white');
  const [searchText, setSearchText] = useState('');
  const mapRef = React.useRef(null);
  
  // ⭐ 하드코딩된 지역 좌표 데이터(REGION_COORDINATES)를 제거했습니다.
  
  useEffect(() => {
    if (currentViewport && selectedTab === '대피소') {
      loadShelters(currentViewport);
    }
  }, [currentViewport, selectedTab]);
  
  useEffect(() => {
    loadNews();
  }, []);
  
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (mapRef.current?.applyTheme) {
      mapRef.current.applyTheme(newTheme);
    }
  };
  
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
  
  const handleViewportChange = (viewport) => {
    dispatch(actions.setViewport(viewport));
  };

  const handleErrorDismiss = () => {
    dispatch(actions.clearError());
  };

  // ⭐ 검색 핸들러 (API 중심으로 로직 간소화)
  const handleSearch = async () => {
    Keyboard.dismiss();
    
    const query = searchText.trim();
    if (!query) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    console.log('🔍 검색 시작:', query);

    // 1. 현재 지도에 로드된 대피소명이 일치하는지 먼저 확인 (네트워크 요청 최소화)
    const matchedShelter = shelters?.find(shelter => 
      shelter.REARE_NM?.includes(query) || 
      shelter.RONA_DADDR?.includes(query)
    );

    if (matchedShelter) {
      if (mapRef.current?.updateLocation) {
        mapRef.current.updateLocation({
          latitude: matchedShelter.latitude,
          longitude: matchedShelter.longitude
        });
        dispatch(actions.setSelectedTab('대피소'));
        Alert.alert('검색 완료', `${matchedShelter.REARE_NM}을(를) 찾았습니다.`);
        setSearchText('');
        return;
      }
    }

    // 2. 일치하는 대피소가 없으면, 백엔드 API에 모든 검색을 위임
    try {
      const response = await fetch(`${API_BASE_URL}/map/coordinates?address=${encodeURIComponent(query)}`);
      const data = await response.json();
    
      // 💡 성공 조건을 유연하게 처리
      const isSuccess = data.success === true || (response.ok && data.latitude && data.longitude);
    
      if (isSuccess) {
        console.log('✅ API 검색 성공:', data.address || query);
        if (mapRef.current?.updateLocation) {
          mapRef.current.updateLocation({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          Alert.alert('검색 완료', `[${data.address || query}] 위치로 이동합니다.`);
          setSearchText('');
        }
      } else {
        // 💡 백엔드가 success 없이 detail만 줄 때 대비
        const errorMessage = data.detail || data.error || '검색 결과가 없습니다.';
        console.warn('검색 실패:', errorMessage);
        Alert.alert('검색 실패', `"${query}"에 대한 결과를 찾을 수 없습니다.\n\n${errorMessage}`);
      }
    
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류', '서버와 통신 중 문제가 발생했습니다.');
    }
  };

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

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
        />
      </View>

      <BottomSheet />
      <BottomNavigation /> 
      
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