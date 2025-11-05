// src/screens/MainScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Keyboard, StyleSheet } from 'react-native';
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
  const [relatedSearches, setRelatedSearches] = useState([]);
  const [showRelatedSearches, setShowRelatedSearches] = useState(false);
  const mapRef = React.useRef(null);
  const searchTimeoutRef = React.useRef(null);
  
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

  // ⭐ 지도 이동 및 확대 - 여러 방법 동시 시도
  const moveAndZoomMap = (latitude, longitude, zoomLevel = 15) => {
    console.log('🗺️ moveAndZoomMap 호출:', { latitude, longitude, zoomLevel });

    if (!mapRef.current) {
      console.error('❌ mapRef가 없습니다');
      return;
    }

    const attemptMove = (retryCount = 0) => {
      // ✅ 1순위: moveAndZoom과 isMapReady가 모두 준비되었는지 확인
      if (mapRef.current.moveAndZoom && mapRef.current.isMapReady && mapRef.current.isMapReady()) {
        console.log(`✅ moveAndZoom 함수 실행 (시도: ${retryCount + 1})`);
        mapRef.current.moveAndZoom(latitude, longitude, zoomLevel);
      } 
      // ❌ 10번 이상(5초) 시도해도 안되면 실패 처리
      else if (retryCount > 10) {
        console.error('❌ 지도 준비 시간 초과. moveAndZoom 실행 실패.');
        // 🚨 최후의 수단: updateLocation이라도 호출 (마커만이라도 이동)
        if (mapRef.current.updateLocation) {
          console.warn('⚠️ 최후의 수단: updateLocation 호출');
          mapRef.current.updateLocation({ latitude, longitude, zoom: zoomLevel });
        }
      } 
      // ⏳ 2순위: 아직 준비가 안됐으면 0.5초 후 재시도
      else {
        console.warn(`⚠️ 지도가 아직 준비되지 않았습니다. 500ms 후 재시도합니다... (시도: ${retryCount + 1})`);
        setTimeout(() => attemptMove(retryCount + 1), 500); // 0.5초 후 재귀 호출
      }
    };

    attemptMove(); // 첫 번째 시도 시작
  };

  // ⭐ 검색어 입력 시 자동완성 검색 (디바운스 적용)
  const handleSearchTextChange = useCallback((text) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setShowRelatedSearches(false);
      setRelatedSearches([]);
      return;
    }

    if (text.trim().length < 2) {
      setShowRelatedSearches(false);
      setRelatedSearches([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchAutocompleteSuggestions(text.trim());
    }, 500);
  }, []);

  const fetchAutocompleteSuggestions = async (query) => {
    try {
      console.log('🔍 자동완성 검색:', query);
      const response = await fetch(`${API_BASE_URL}/map/coordinates?address=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.multiple_results && data.results && data.results.length > 1) {
        console.log('📍 자동완성 결과:', data.results.length);
        const suggestions = data.results.map(result => result.title || result.address);
        setRelatedSearches(suggestions);
        setShowRelatedSearches(true);
      } else {
        setShowRelatedSearches(false);
        setRelatedSearches([]);
      }
    } catch (error) {
      console.error('자동완성 검색 오류:', error);
      setShowRelatedSearches(false);
      setRelatedSearches([]);
    }
  };

  const handleSearch = async (customQuery = null) => {
    Keyboard.dismiss();
    
    const query = (customQuery || searchText).trim();
    if (!query) {
      console.log('⚠️ 검색어가 비어있습니다');
      return;
    }

    console.log('🔍 검색 실행:', query);
    setShowRelatedSearches(false);

    // 1. 대피소 검색
    const matchedShelter = shelters?.find(shelter => 
      shelter.REARE_NM?.includes(query) || 
      shelter.RONA_DADDR?.includes(query)
    );

    if (matchedShelter) {
      console.log('✅ 대피소 매칭:', matchedShelter.REARE_NM);
      console.log('📍 좌표:', matchedShelter.latitude, matchedShelter.longitude);
      
      moveAndZoomMap(matchedShelter.latitude, matchedShelter.longitude);
      dispatch(actions.setSelectedTab('대피소'));
      setSearchText('');
      setRelatedSearches([]);
      return;
    }

    // 2. API 검색
    try {
      const response = await fetch(`${API_BASE_URL}/map/coordinates?address=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      console.log('📡 API 응답:', data);
    
      // 여러 결과
      if (data.multiple_results && data.results && data.results.length > 1) {
        console.log('📍 여러 결과:', data.results.length);
        
        if (data.recommended) {
          console.log('✅ 추천 위치:', data.recommended.title);
          // ✅ FIX: API가 lat, lot 필드를 반환
          const lat = parseFloat(data.recommended.lat || data.recommended.latitude);
          const lng = parseFloat(data.recommended.lot || data.recommended.lng || data.recommended.longitude);
          console.log('📍 좌표:', lat, lng);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            moveAndZoomMap(lat, lng);
            setSearchText('');
          } else {
            console.error('❌ 유효하지 않은 좌표:', data.recommended);
          }
        }
        return;
      }
    
      // 단일 결과
      // ✅ FIX: API가 lat, lot 필드를 반환
      const lat = parseFloat(data.lat || data.latitude);
      const lng = parseFloat(data.lot || data.lng || data.longitude);
      const isSuccess = data.success === true || (response.ok && !isNaN(lat) && !isNaN(lng));
    
      if (isSuccess) {
        console.log('✅ 검색 성공');
        console.log('📍 좌표:', lat, lng);
        
        setRelatedSearches([]);
        moveAndZoomMap(lat, lng);
        setSearchText('');
      } else {
        const errorMessage = data.detail || data.error || '검색 결과가 없습니다.';
        console.warn('❌ 검색 실패:', errorMessage);
        console.warn('📊 받은 데이터:', data);
        setRelatedSearches([]);
      }
    
    } catch (error) {
      console.error('❌ API 오류:', error);
      setRelatedSearches([]);
    }
  };

  const handleRelatedSearchClick = (searchQuery) => {
    console.log('🔍 관련 검색어 클릭:', searchQuery);
    setSearchText(searchQuery);
    setShowRelatedSearches(false);
    handleSearch(searchQuery);
  };

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
    if (showRelatedSearches) {
      setShowRelatedSearches(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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