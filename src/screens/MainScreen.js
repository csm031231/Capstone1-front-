// src/screens/MainScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Keyboard, StyleSheet} from 'react-native';
import { useAppState, useAppDispatch, actions } from '../store/AppContext';
import { apiService } from '../services/ApiService';
// import emergencyMessageService from '../services/emergencyMessageService'; // ❌ 제거됨
import disasterActionService from '../services/disasterActionService';
import Header from '../components/Header/Header';
import MapContainer from '../components/Map/MapContainer';
import BottomSheet from '../components/BottomSheet/BottomSheet';
import BottomNavigation from '../components/Navigation/BottomNavigation';
import ErrorToast from '../components/common/ErrorToast';

import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

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
      // 🚨 탭이 '대피소'일 때만 로드하도록 되어 있는지 체크
      const shouldLoad = selectedTab === '대피소' || selectedTab === null;
      console.log('👀 useEffect 감지됨 | Tab:', selectedTab, 'Viewport:', !!currentViewport);
      if (currentViewport && shouldLoad) {
        // 1. 뷰포트가 있으면 로드
        await loadShelters(currentViewport);
      } else if (mapRef.current?.getViewportBounds && shouldLoad) {
        // 2. 뷰포트가 없으면 지도로부터 직접 가져와서 로드
        const bounds = await mapRef.current.getViewportBounds();
        await loadShelters(bounds);
      }
    };
    loadSheltersAlways();
  }, [currentViewport, selectedTab]);
  
  // 탭 변경시 데이터 로드
  useEffect(() => {
    switch (selectedTab) {
      case '재난문자':
        // ❌ loadMessages() 제거 (MessageContent.js에서 직접 처리)
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
    loadDisasterMapData();
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
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
  
  // ❌ loadMessages 함수 제거됨

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
    // 🚨 [진단용 로그 1] 함수가 실행되는지 확인
    console.log('🚀 loadShelters 함수 진입! 받은 viewport:', viewport);

    try {
      // 🚨 [진단용 로그 2] 탭 상태 확인 (탭이 '대피소'가 아니면 실행 안 될 수도 있음)
      if (selectedTab !== '대피소') {
        console.log('⚠️ 현재 탭이 대피소가 아님:', selectedTab);
        // 필요하다면 여기서 return 하지 않고 강제 실행하도록 수정 고려
      }
      dispatch(actions.setLoading('shelters', true));
      const bounds = {
        startLat: viewport.startLat || viewport.southWest?.latitude, // 안전장치 추가
        endLat: viewport.endLat || viewport.northEast?.latitude,
        startLot: viewport.startLot || viewport.southWest?.longitude, // 오타 주의: startLot vs startLng
        endLot: viewport.endLot || viewport.northEast?.longitude
      };
      
      console.log('📦 정리된 bounds 데이터:', bounds); // [진단용 로그 3]

      // 좌표가 하나라도 없으면 API 호출 중단 (이게 원인일 수 있음)
      if (!bounds.startLat || !bounds.endLat) {
        console.error('❌ 좌표 데이터가 불완전하여 API를 호출하지 않습니다.');
        return;
      }

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
  const handleViewportChange = useCallback((viewport) => {
    dispatch(actions.setViewport(viewport));
  },[dispatch]);

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
    setSearchText(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setShowRelatedSearches(false);
      setRelatedSearches([]);
      return;
    }

    if (text.trim().length < 2) return;

    searchTimeoutRef.current = setTimeout(() => {
      fetchAutocompleteSuggestions(text.trim());
    }, 500);
  }, []);

  const fetchAutocompleteSuggestions = async (query) => {
    try {
      // console.log('🔍 자동완성 요청:', query);
      
      // apiService의 검색 기능 활용
      const result = await apiService.searchAddress(query);

      // 결과가 있고, 여러 개(multiple)인 경우 목록으로 표시
      if (result.isSuccess && result.type === 'multiple' && result.data) {
        console.log('📍 자동완성 결과 수:', result.data.length);
        const suggestions = result.data.map(item => item.title || item.address);
        setRelatedSearches(suggestions);
        setShowRelatedSearches(true);
      } else {
        setShowRelatedSearches(false);
      }
    } catch (error) {
      console.error('자동완성 검색 오류:', error);
      setShowRelatedSearches(false);
    }
  };

  const handleRelatedSearchClick = (searchQuery) => {
    console.log('🔍 관련 검색어 클릭:', searchQuery);
    setSearchText(searchQuery);
    setShowRelatedSearches(false);
    handleSearch(searchQuery);
  };

  // 검색 핸들러
  const handleSearch = async (customQuery = null) => {
    Keyboard.dismiss();
    
    // 1. 검색어 정리
    const queryRaw = typeof customQuery === 'string' ? customQuery : searchText;
    const query = queryRaw?.trim();

    if (!query) {
      console.log('⚠️ 검색어가 없습니다.');
      return;
    }

    console.log('🔍 검색 실행:', query);
    setShowRelatedSearches(false);

    const matchedShelter = (shelters || []).find(s => 
      s.REARE_NM?.includes(query) || s.RONA_DADDR?.includes(query)
    );

    if (matchedShelter) {
      console.log('✅ 내부 대피소 발견:', matchedShelter.REARE_NM);
      mapRef.current?.moveAndZoom?.(matchedShelter.latitude, matchedShelter.longitude, 15);
      setSearchText('');
      setRelatedSearches([]);
      return;
    }

    try {
      console.log('📡 외부 API 검색 시도...');
      const result = await apiService.searchAddress(query);

      if (result.isSuccess) {
        let lat, lng;

        // case A: 단일 결과 (Single)
        if (result.type === 'single') {
          lat = result.latitude;
          lng = result.longitude;
        } 
        // case B: 여러 결과 중 추천 (Multiple)
        else if (result.type === 'multiple' && result.recommended) {
          const r = result.recommended;
          // 다양한 필드명 대응 (안전장치)
          lat = parseFloat(r.lat || r.latitude || r.mapy); 
          lng = parseFloat(r.lot || r.lng || r.longitude || r.mapx);
        }

        // 좌표 유효성 검사 후 이동
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log('✅ API 위치 이동:', lat, lng);
          mapRef.current?.moveAndZoom?.(lat, lng, 15);
          if (mapRef.current?.hideBoundaries) {
            console.log('🛑 검색 이동 -> 경계선 숨기기 요청');
            mapRef.current.hideBoundaries();
         }
          setSearchText('');
          setRelatedSearches([]);
        } else {
           Alert.alert('알림', '위치 정보를 정확히 찾을 수 없습니다.');
        }

      } else {
        // 검색 실패 메시지
        console.warn('❌ 검색 실패:', result.message);
        Alert.alert('검색 결과 없음', result.message || `"${query}"의 위치를 찾을 수 없습니다.`);
      }

    } catch (error) {
      console.error('❌ 검색 중 오류:', error);
      Alert.alert('오류', '검색 중 문제가 발생했습니다.');
    }
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
    const enableImmersiveMode = async () => {
      await NavigationBar.setVisibilityAsync("hidden");
      await NavigationBar.setBehaviorAsync("overlay-swipe");
    };
    enableImmersiveMode();
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
          moveAndZoomMap={moveAndZoomMap}
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