// src/screens/MainScreen.js
import React, { useEffect, useState } from 'react';
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
  const searchTimeoutRef = React.useRef(null);
  const [selectedShelter] = useState(null);

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
  
  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
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

  // 검색어 자동완성 핸들러
  const handleSearchTextChange = (text) => {
    setSearchText(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!text.trim()) {
      setRelatedSearches([]);
      setShowRelatedSearches(false);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const regionMatches = Object.keys(REGION_COORDINATES).filter(region =>
        region.includes(text) || text.includes(region)
      );
      
      const shelterMatches = (shelters || [])
        .filter(shelter => 
          shelter.REARE_NM?.includes(text) || 
          shelter.RONA_DADDR?.includes(text)
        )
        .slice(0, 5)
        .map(s => s.REARE_NM);
      
      const allMatches = [...new Set([...regionMatches, ...shelterMatches])].slice(0, 10);
      
      setRelatedSearches(allMatches);
      setShowRelatedSearches(allMatches.length > 0);
    }, 300);
  };

  // 자동완성 항목 클릭 핸들러
  const handleRelatedSearchClick = (searchItem) => {
    setSearchText(searchItem);
    setShowRelatedSearches(false);
    
    const matchedRegion = Object.keys(REGION_COORDINATES).find(region => 
      searchItem.includes(region) || region.includes(searchItem)
    );

    if (matchedRegion) {
      const coords = REGION_COORDINATES[matchedRegion];
      if (mapRef.current && mapRef.current.moveAndZoom) {
        mapRef.current.moveAndZoom(coords.latitude, coords.longitude, 13);
      }
    } else {
      const matchedShelter = (shelters || []).find(shelter => 
        shelter.REARE_NM === searchItem
      );
      
      if (matchedShelter && mapRef.current && mapRef.current.moveAndZoom) {
        mapRef.current.moveAndZoom(matchedShelter.latitude, matchedShelter.longitude, 15);
        dispatch(actions.setSelectedTab('대피소'));
      }
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    Keyboard.dismiss();
    
    if (!searchText.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    const query = searchText.trim();
    console.log('🔍 검색 시작:', query);

    // 지역명 검색
    const matchedRegion = Object.keys(REGION_COORDINATES).find(region => 
      query.includes(region) || region.includes(query)
    );

    if (matchedRegion) {
      const coords = REGION_COORDINATES[matchedRegion];
      console.log(`✅ 지역 찾음: ${matchedRegion}`, coords);
      
      if (mapRef.current && mapRef.current.moveAndZoom) {
        mapRef.current.moveAndZoom(coords.latitude, coords.longitude, 13);
        
        Alert.alert('검색 완료', `${matchedRegion} 지역으로 이동합니다.`);
        setSearchText('');
        setShowRelatedSearches(false);
      }
      return;
    }

    // 대피소명 검색
    if (shelters && shelters.length > 0) {
      const matchedShelter = shelters.find(shelter => 
        shelter.REARE_NM?.includes(query) || 
        shelter.RONA_DADDR?.includes(query)
      );

      if (matchedShelter) {
        console.log('✅ 대피소 찾음:', matchedShelter.REARE_NM);
        
        if (mapRef.current && mapRef.current.moveAndZoom) {
          mapRef.current.moveAndZoom(matchedShelter.latitude, matchedShelter.longitude, 15);
          
          dispatch(actions.setSelectedTab('대피소'));
          
          Alert.alert('검색 완료', `${matchedShelter.REARE_NM}을(를) 찾았습니다.`);
          setSearchText('');
          setShowRelatedSearches(false);
        }
        return;
      }
    }

    // 검색 결과 없음
    Alert.alert(
      '검색 결과 없음',
      `"${query}"에 대한 검색 결과가 없습니다.\n\n지역명(예: 김해, 부산, 서울)이나 대피소명을 입력해주세요.`
    );
  };

  // 지도 터치시 키보드 닫기
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
  
  // 🆕 4. BottomSheet 닫기 핸들러 정의
  const handleBottomSheetClose = () => {
    console.log('🔽 BottomSheet 닫기');
    if(mapRef.current?.clearRoute) {
        mapRef.current.clearRoute(); // 닫을 때 지도에 그려진 경로도 지웁니다.
    }
  };
  return (
    <View style={styles.container}>
      {/* 지도 영역 */}
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
      
      {/* Header는 지도 위에 */}
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

      {/* 📍 6. BottomSheet에 필요한 props 전달 */}
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