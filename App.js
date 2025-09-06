// App.js
import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './src/components/Header';
import MapContainer from './src/components/MapContainer';
import BottomSheet from './src/components/BottomSheet';
import BottomNavigation from './src/components/BottomNavigation';

export default function App() {
  const [selectedTab, setSelectedTab] = useState('재난문자'); // 기본값 유지
  const [searchText, setSearchText] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentViewport, setCurrentViewport] = useState(null);
  
  // MapContainer에 대한 ref
  const mapRef = useRef(null);

  // 지도의 viewport가 변경될 때 호출되는 함수
  const handleViewportChange = (viewport) => {
    setCurrentViewport(viewport);
    console.log('📱 지도 화면 범위 변경:', viewport);
    console.log('🏠 해당 범위의 대피소들이 지도에 자동으로 표시됩니다');
  };

  // 현재 위치가 업데이트될 때 호출되는 함수
  const handleLocationChange = (location) => {
    setCurrentLocation(location);
    console.log('📍 현재 위치 변경:', location);
  };

  // 검색 기능 (향후 확장 가능)
  const handleSearch = () => {
    console.log('검색어:', searchText);
    // 검색 기능 구현 예정
  };

  return (
    <View style={styles.container}>
      {/* 상단 패딩 추가 - StatusBar 공간 확보 */}
      <View style={styles.statusBarSpace} />
      
      {/* Header 영역 */}
      <Header 
        searchText={searchText} 
        setSearchText={setSearchText}
        onSearch={handleSearch}
      />

      {/* 지도 + BottomSheet 영역 */}
      <View style={styles.mapSection}>
        <MapContainer 
          ref={mapRef}
          currentLocation={currentLocation}
          onViewportChange={handleViewportChange}
        />
        <BottomSheet 
          selectedTab={selectedTab}
          currentLocation={currentLocation}
          currentViewport={currentViewport}
          mapRef={mapRef}
        />
      </View>

      {/* 하단 네비게이션 */}
      <BottomNavigation 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statusBarSpace: {
    height: 44, // iPhone의 일반적인 StatusBar 높이
    backgroundColor: '#1a1a1a', // Header와 동일한 배경색
  },
  mapSection: {
    flex: 1,
    position: 'relative',
  },
});
