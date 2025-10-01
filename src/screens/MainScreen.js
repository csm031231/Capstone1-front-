// src/screens/MainScreen.js
// React 및 기본 구성 요소를 임포트합니다.
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
// 전역 상태 관리(Context API)를 위한 훅과 액션을 임포트합니다.
import { useAppState, useAppDispatch, actions } from '../store/AppContext';
// API 통신을 위한 서비스를 임포트합니다.
import { apiService } from '../services/ApiService';
// UI 컴포넌트들을 임포트합니다.
import Header from '../components/Header/Header';
import MapContainer from '../components/Map/MapContainer';
import BottomSheet from '../components/BottomSheet/BottomSheet';
import BottomNavigation from '../components/Navigation/BottomNavigation';
import ErrorToast from '../components/common/ErrorToast';

// 메인 화면 컴포넌트를 정의합니다.
export default function MainScreen() {
  // 전역 상태에서 필요한 값들을 가져옵니다.
  const { currentLocation, currentViewport, selectedTab, error } = useAppState();
  // 전역 상태 업데이트를 위한 디스패치 함수를 가져옵니다.
  const dispatch = useAppDispatch();
  // 테마 상태를 관리합니다. 기본값은 'white'입니다.
  const [theme, setTheme] = useState('white'); // 테마 상태 관리
  // MapContainer 컴포넌트의 ref를 생성하여 직접 접근할 수 있도록 합니다.
  const mapRef = React.useRef(null);
  
  // viewport 변경시 대피소 데이터 자동 로드 로직
  useEffect(() => {
    // currentViewport가 있고 선택된 탭이 '대피소'일 때만 대피소를 로드합니다.
    if (currentViewport && selectedTab === '대피소') {
      loadShelters(currentViewport);
    }
  }, [currentViewport, selectedTab]); // currentViewport나 selectedTab이 변경될 때마다 실행됩니다.
  
  // 뉴스는 컴포넌트 마운트 시 한 번만 로드합니다.
  useEffect(() => {
    loadNews();
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행되도록 합니다.
  
  // 테마 변경 핸들러 함수를 정의합니다.
  const handleThemeChange = (newTheme) => {
    // 로컬 테마 상태를 업데이트합니다.
    setTheme(newTheme);
    
    // mapRef를 통해 MapContainer 컴포넌트의 applyTheme 함수를 호출하여 테마를 적용합니다.
    if (mapRef.current && mapRef.current.applyTheme) {
      mapRef.current.applyTheme(newTheme);
    }
  };
  
  // 대피소 데이터를 로드하는 비동기 함수를 정의합니다.
  const loadShelters = async (viewport) => {
    try {
      // 로딩 상태를 'shelters'에 대해 true로 설정합니다.
      dispatch(actions.setLoading('shelters', true));
      
      // viewport 객체에서 API 요청에 필요한 경계(bounds) 정보를 추출합니다.
      const bounds = {
        startLat: viewport.startLat,
        endLat: viewport.endLat,
        startLot: viewport.startLot,
        endLot: viewport.endLot
      };
      
      // apiService를 통해 대피소 데이터를 가져옵니다.
      const data = await apiService.getShelters(bounds, currentLocation);
      // 가져온 데이터를 전역 상태에 저장합니다.
      dispatch(actions.setShelters(data));
      
    } catch (error) {
      // 에러 발생 시 콘솔에 로그를 남깁니다.
      console.error('대피소 로드 실패:', error);
      // 사용자에게 보여줄 에러 메시지를 전역 상태에 설정합니다.
      dispatch(actions.setError('대피소 정보를 불러올 수 없습니다'));
      // 대피소 목록을 빈 배열로 초기화합니다.
      dispatch(actions.setShelters([]));
    } finally {
      // 로딩 상태를 'shelters'에 대해 false로 설정합니다. (성공/실패와 관계없이 실행)
      dispatch(actions.setLoading('shelters', false));
    }
  };
  
  // 뉴스 데이터를 로드하는 비동기 함수를 정의합니다.
  const loadNews = async () => {
    try {
      // 로딩 상태를 'news'에 대해 true로 설정합니다.
      dispatch(actions.setLoading('news', true));
      
      // apiService를 통해 뉴스 데이터를 가져옵니다.
      const data = await apiService.getNews();
      // 가져온 데이터를 전역 상태에 저장합니다.
      dispatch(actions.setNews(data));
      
    } catch (error) {
      // 에러 발생 시 콘솔에 로그를 남깁니다.
      console.error('뉴스 로드 실패:', error);
      // 사용자에게 보여줄 에러 메시지를 전역 상태에 설정합니다.
      dispatch(actions.setError('뉴스를 불러올 수 없습니다'));
      // 뉴스 목록을 빈 배열로 초기화합니다.
      dispatch(actions.setNews([]));
    } finally {
      // 로딩 상태를 'news'에 대해 false로 설정합니다.
      dispatch(actions.setLoading('news', false));
    }
  };
  
  // 맵의 뷰포트 변경을 처리하는 핸들러 함수를 정의합니다.
  const handleViewportChange = (viewport) => {
    // 변경된 viewport 정보를 전역 상태에 저장합니다.
    dispatch(actions.setViewport(viewport));
  };

  // 에러 토스트를 닫는 핸들러 함수를 정의합니다.
  const handleErrorDismiss = () => {
    // 전역 상태의 에러를 초기화합니다.
    dispatch(actions.clearError());
  };

  // 컴포넌트 렌더링 부분을 정의합니다.
  return (
    <View style={styles.container}>

      {/* 지도 및 하단 시트 영역을 포함하는 섹션입니다. flex: 1로 남은 공간을 채웁니다. */}
      <View style={styles.mapSection}>
        {/* 지도 컴포넌트를 렌더링하고 ref, 위치, 뷰포트 변경 핸들러, 테마 등을 전달합니다. */}
        <MapContainer 
          ref={mapRef}
          currentLocation={currentLocation}
          onViewportChange={handleViewportChange}
          theme={theme}
        />
        
        {/* 하단 시트 컴포넌트를 렌더링합니다. (지도 위에 오버레이될 수 있음) */}
        <BottomSheet />
      </View>
      
      {/* 헤더 컴포넌트를 렌더링하고 테마 관련 props를 전달합니다. */}
      <Header 
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* 하단 내비게이션 바 컴포넌트를 렌더링합니다. */}
      <BottomNavigation />
      
      {/* 에러 상태가 있을 경우에만 에러 토스트를 렌더링합니다. */}
      {error && (
        <ErrorToast 
          message={error}
          onDismiss={handleErrorDismiss}
        />
      )}
    </View>
  );
}

// 스타일 시트를 정의합니다.
const styles = StyleSheet.create({
  // 전체 화면 컨테이너 스타일입니다.
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // 지도와 바텀 시트가 들어가는 섹션 스타일입니다.
  mapSection: {
    flex: 1,
    position: 'relative', // BottomSheet 등의 절대 위치 요소의 기준이 됩니다.
  },
});