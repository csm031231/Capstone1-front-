// src/screens/MainScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Keyboard, StyleSheet} from 'react-native';
import { useAppState, useAppDispatch, actions } from '../store/AppContext';
import { apiService } from '../services/ApiService';
import emergencyMessageService from '../services/emergencyMessageService';
import disasterActionService from '../services/disasterActionService';
import Header from '../components/Header/Header';
import MapContainer from '../components/Map/MapContainer';
import BottomSheet from '../components/BottomSheet/BottomSheet';
import BottomNavigation from '../components/Navigation/BottomNavigation';
import ErrorToast from '../components/common/ErrorToast';

import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

const API_BASE_URL = 'http://192.168.0.16:8000';

export default function MainScreen() {
  const { currentLocation, currentViewport, selectedTab, error, shelters } = useAppState();
  const dispatch = useAppDispatch();
  const [theme, setTheme] = useState('white');
  const [searchText, setSearchText] = useState('');
  const [relatedSearches, setRelatedSearches] = useState([]);
  const [showRelatedSearches, setShowRelatedSearches] = useState(false);
  const searchTimeoutRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const [disasterData, setDisasterData] = useState(null);

  useEffect(() => {
    const loadSheltersAlways = async () => {
      if (currentViewport) {
        // 현재 화면 범위의 대피소 로드
        await loadShelters(currentViewport);
      } else if (mapRef.current?.getViewportBounds) {
        // viewport가 없으면 지도로부터 가져옴
        const bounds = await mapRef.current.getViewportBounds();
        await loadShelters(bounds);
      }
    };
    loadSheltersAlways();
  }, [currentViewport]);
  
  // 탭 변경시 데이터 로드
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

  useEffect(() => {
    loadNews();
    loadDisasterMapData(); // 👈 추가됨
  }, []);

  // ▼▼▼ [3] 추가: 재난 지도 데이터 로드 함수 ▼▼▼
  const loadDisasterMapData = async () => {
    try {
      console.log('🗺️ 메인 화면에서 재난 지도 데이터 요청');
      const data = await apiService.getDisasterMap();
      setDisasterData(data); // State 업데이트 -> MapContainer로 전달됨
    } catch (error) {
      console.error('❌ 재난 지도 데이터 로드 실패:', error);
      // 에러가 나도 앱이 멈추지 않게 별도 처리는 생략하거나 토스트 메시지
    }
  };
  // 뉴스는 컴포넌트 마운트 시 한 번만 로드
  useEffect(() => {
    loadNews();
  }, []);
  
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
  
  // 재난행동요령 로드
  const loadActions = async () => {
    try {
      dispatch(actions.setLoading('actions', true));
      const response = await disasterActionService.getAllActions(1, 10);
      
      if (response.success) {
        dispatch(actions.setActions(response.items));
      }
    } catch (error) {
      console.error('재난행동요령 로드 실패:', error);
      dispatch(actions.setError('재난행동요령을 불러올 수 없습니다'));
    } finally {
      dispatch(actions.setLoading('actions', false));
    }
  };

  // 테마 변경 핸들러
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (mapRef.current && mapRef.current.applyTheme) {
      mapRef.current.applyTheme(newTheme);
    }
  };
  
  // 대피소 데이터 로드
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
  
  // 뉴스 데이터 로드
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
  
  // 맵 뷰포트 변경 핸들러
  const handleViewportChange = (viewport) => {
    dispatch(actions.setViewport(viewport));
  };

  // 에러 토스트 닫기
  const handleErrorDismiss = () => {
    dispatch(actions.clearError());
  };

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

  // 검색어 자동완성 핸들러
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

  // 검색 핸들러
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

  // 지도 터치시 키보드 닫기
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
    if (showRelatedSearches) {
      setShowRelatedSearches(false);
    }
  };

  const handleBottomSheetClose = () => {
    console.log('🔽 BottomSheet 닫기');
    if(mapRef.current?.clearRoute) {
        mapRef.current.clearRoute(); // 닫을 때 지도에 그려진 경로도 지웁니다.
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const enableImmersiveMode = async () => {
      // 1) 하단 내비게이션 바 숨김 ('hidden')
      await NavigationBar.setVisibilityAsync("hidden");
      
      // 2) 동작 설정: 'overlay-swipe'
      // -> 평소엔 안 보이다가, 사용자가 쓸어올리면 반투명하게 나타나고 다시 사라짐
      await NavigationBar.setBehaviorAsync("overlay-swipe");
      
      // (선택) 하단 바 배경색을 투명하게
      // await NavigationBar.setBackgroundColorAsync("transparent"); 
    };

    enableImmersiveMode();
    
    // (선택) 화면 나갈 때 복구하고 싶다면 return에 cleanup 함수 작성
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.mapLayer}>
        <MapContainer
          ref={mapRef}
          currentLocation={currentLocation}
          onViewportChange={handleViewportChange}
          theme={theme}
          shelters={shelters}
          onMapPress={handleKeyboardDismiss}
          disasters={disasterData}
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

      <BottomSheet 
        onClose={handleBottomSheetClose} // BottomSheet 닫기 시 호출
        mapRef={mapRef} // ⬅️ **MapContainer의 Ref 전달 (핵심 수정)**
      />
      
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