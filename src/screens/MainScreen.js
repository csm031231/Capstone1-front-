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

export default function MainScreen() {
  const { currentLocation, currentViewport, selectedTab, error, shelters } = useAppState();
  const dispatch = useAppDispatch();
  const [theme, setTheme] = useState('white');
  const [searchText, setSearchText] = useState('');
  const mapRef = React.useRef(null);
  
  // 지역별 좌표 데이터
  const REGION_COORDINATES = {
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
    '통영': { latitude: 34.8544, longitude: 128.4331 },
    '사천': { latitude: 35.0036, longitude: 128.0642 },
    '밀양': { latitude: 35.5040, longitude: 128.7469 },
    '거제': { latitude: 34.8808, longitude: 128.6211 },
    '양산': { latitude: 35.3350, longitude: 129.0372 },
    '수원': { latitude: 37.2636, longitude: 127.0286 },
    '성남': { latitude: 37.4201, longitude: 127.1262 },
    '고양': { latitude: 37.6584, longitude: 126.8320 },
    '용인': { latitude: 37.2410, longitude: 127.1776 },
    '춘천': { latitude: 37.8813, longitude: 127.7300 },
    '강릉': { latitude: 37.7519, longitude: 128.8761 },
    '청주': { latitude: 36.6424, longitude: 127.4890 },
    '천안': { latitude: 36.8151, longitude: 127.1139 },
    '전주': { latitude: 35.8242, longitude: 127.1479 },
    '목포': { latitude: 34.8118, longitude: 126.3922 },
    '여수': { latitude: 34.7604, longitude: 127.6622 },
    '제주': { latitude: 33.4996, longitude: 126.5312 },
  };
  
  // viewport 변경시 대피소 데이터 자동 로드
  useEffect(() => {
    if (currentViewport && selectedTab === '대피소') {
      loadShelters(currentViewport);
    }
  }, [currentViewport, selectedTab]);
  
  // 뉴스는 컴포넌트 마운트 시 한 번만 로드
  useEffect(() => {
    loadNews();
  }, []);
  
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
      
      if (mapRef.current && mapRef.current.updateLocation) {
        mapRef.current.updateLocation({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
        
        Alert.alert('검색 완료', `${matchedRegion} 지역으로 이동합니다.`);
        setSearchText('');
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
        
        if (mapRef.current && mapRef.current.updateLocation) {
          mapRef.current.updateLocation({
            latitude: matchedShelter.latitude,
            longitude: matchedShelter.longitude
          });
          
          dispatch(actions.setSelectedTab('대피소'));
          
          Alert.alert('검색 완료', `${matchedShelter.REARE_NM}을(를) 찾았습니다.`);
          setSearchText('');
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
  };

  return (
    <View style={styles.container}>
      {/* ⭐ 지도 영역 */}
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
      
      {/* ⭐ Header는 지도 위에 */}
      <View style={styles.headerLayer}>
        <Header 
          theme={theme}
          onThemeChange={handleThemeChange}
          searchText={searchText}
          setSearchText={setSearchText}
          onSearch={handleSearch}
        />
      </View>

      {/* ⭐ BottomSheet (BottomNavigation 포함) */}
      <BottomSheet />
      <BottomNavigation /> 
      
      {/* ⭐ 에러 토스트 */}
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