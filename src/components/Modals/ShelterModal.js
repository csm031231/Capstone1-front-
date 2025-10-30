import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';

const ShelterModal = ({ visible, onClose, currentLocation = null, mapRef = null }) => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(currentLocation);
  const [searchMode, setSearchMode] = useState('nearby'); // 'nearby' or 'viewport'

  // API 서버 URL
  const API_BASE_URL = 'http://192.168.0.16:8000';

  // 거리 계산 함수 (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // km
    return distance;
  };

  // 한국 좌표인지 확인하는 함수
  const isKoreanCoordinate = (latitude, longitude) => {
    return latitude >= 33 && latitude <= 43 && longitude >= 124 && longitude <= 132;
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림', '위치 권한이 필요합니다.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      if (!isKoreanCoordinate(latitude, longitude)) {
        console.log('🌍 현재 위치가 한국이 아닙니다. 김해시 기본 좌표를 사용합니다.');
        return {
          latitude: 35.233596,
          longitude: 128.889544,
        };
      }

      return { latitude, longitude };
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      return {
        latitude: 35.233596,
        longitude: 128.889544,
      };
    }
  };

  // 지도의 현재 viewport 범위 가져오기
  let pendingResolve = null;

const getMapViewportBounds = async () => {
  return new Promise((resolve) => {
    if (!mapRef || !mapRef.current) {
      resolve(null);
      return;
    }

    pendingResolve = resolve;

    const messageId = Date.now();
    mapRef.current.postMessage(JSON.stringify({
      type: 'get_viewport_bounds',
      messageId
    }));

    // 3초 타임아웃
    setTimeout(() => {
      if (pendingResolve) {
        console.log('⏰ 지도 범위 가져오기 시간 초과');
        pendingResolve(null);
        pendingResolve = null;
      }
    }, 3000);
  });
};
  

  // 대피소 데이터 가져오기 (개선된 버전)
  const fetchSheltersFromAPI = async (searchBounds = null) => {
    setLoading(true);
    try {
      let bounds;

      if (searchMode === 'viewport' && searchBounds) {
        // 지도 viewport 기반 검색
        bounds = searchBounds;
        console.log('🗺️ 지도 화면 범위 기반 검색:', bounds);
      } else {
        // 현재 위치 기반 검색 (기본값)
        const location = userLocation || await getCurrentLocation();
        if (!location) {
          throw new Error('위치를 가져올 수 없습니다');
        }

        const range = 0.05; // 약 5km 반경
        bounds = {
          startLat: (location.latitude - range).toFixed(6),
          endLat: (location.latitude + range).toFixed(6),
          startLot: (location.longitude - range).toFixed(6),
          endLot: (location.longitude + range).toFixed(6)
        };
        console.log('📍 현재 위치 기반 검색:', bounds);
      }

      const queryParams = new URLSearchParams(bounds).toString();
      const apiUrl = `${API_BASE_URL}/shelter_router/get_shelter?${queryParams}`;
      console.log('🚀 API 요청 URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('API 응답 데이터가 배열 형식이 아닙니다.');
      }

      if (data.length === 0) {
        Alert.alert('알림', '검색 범위에 등록된 대피소가 없습니다.\n목업 데이터를 표시합니다.');
        await fetchMockShelters(userLocation?.latitude || 35.233596, userLocation?.longitude || 128.889544);
        return;
      }

      // API 응답 데이터를 앱에서 사용할 형식으로 변환
      const formattedShelters = data.map((shelter, index) => ({
        id: index + 1,
        name: shelter.REARE_NM || '이름 없음',
        address: shelter.RONA_DADDR || '주소 정보 없음',
        latitude: parseFloat(shelter.LAT) || 0,
        longitude: parseFloat(shelter.LOT) || 0,
        type: shelter.SHLT_SE_NM || '대피소',
        capacity: 500,
        contact: '055-330-3000',
        facilities: ['화장실', '전기'],
        shltSeCode: shelter.SHLT_SE_CD,
        managementNumber: shelter.MNG_SN,
        distance: 0
      })).filter(shelter => shelter.latitude !== 0 && shelter.longitude !== 0);

      // 거리 계산 (현재 위치가 있을 때만)
      if (userLocation) {
        const sheltersWithDistance = formattedShelters.map(shelter => ({
          ...shelter,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            shelter.latitude,
            shelter.longitude
          )
        }));

        // 거리순으로 정렬
        const sortedShelters = sheltersWithDistance.sort((a, b) => a.distance - b.distance);
        setShelters(sortedShelters);
      } else {
        setShelters(formattedShelters);
      }

      console.log('✅ 최종 대피소 목록:', formattedShelters.length, '개');

    } catch (error) {
      console.error('❌ 대피소 데이터 가져오기 실패:', error);
      
      let errorMessage = '대피소 정보를 가져올 수 없습니다.';
      if (error.message.includes('Network request failed')) {
        errorMessage = '네트워크 연결을 확인해주세요.\n서버가 실행 중인지 확인하세요.';
      }
      
      Alert.alert('API 오류', errorMessage + '\n\n목업 데이터로 표시합니다.');
      await fetchMockShelters(userLocation?.latitude || 35.233596, userLocation?.longitude || 128.889544);
    } finally {
      setLoading(false);
    }
  };

  // 목업 데이터로 폴백
  const fetchMockShelters = async (latitude, longitude) => {
    console.log('🎭 목업 데이터를 로드합니다.');
    
    const mockShelters = [
      {
        id: 1,
        name: '김해시 체육관',
        type: '체육시설',
        address: '경상남도 김해시 분성로 100',
        latitude: 35.233596,
        longitude: 128.889544,
        capacity: 2000,
        contact: '055-330-3000',
        facilities: ['화장실', '전기', '난방', '급수', '주방'],
        managementNumber: 'KH-001'
      },
      {
        id: 2,
        name: '장유중학교',
        type: '교육시설',
        address: '경상남도 김해시 장유면 장유로 200',
        latitude: 35.190156,
        longitude: 128.807892,
        capacity: 800,
        contact: '055-310-1234',
        facilities: ['화장실', '전기', '급수'],
        managementNumber: 'KH-002'
      },
      {
        id: 3,
        name: '김해문화의전당',
        type: '문화시설',
        address: '경상남도 김해시 가야의길 16',
        latitude: 35.235489,
        longitude: 128.888901,
        capacity: 1500,
        contact: '055-320-1000',
        facilities: ['화장실', '전기', '난방', '급수', '주방', '의료실'],
        managementNumber: 'KH-003'
      }
    ];

    // 거리 계산 및 정렬
    const sheltersWithDistance = mockShelters.map(shelter => ({
      ...shelter,
      distance: calculateDistance(
        latitude,
        longitude,
        shelter.latitude,
        shelter.longitude
      )
    }));

    const sortedShelters = sheltersWithDistance.sort((a, b) => a.distance - b.distance);
    setShelters(sortedShelters);
  };

  // 검색 모드 변경 핸들러
  const handleSearchModeChange = async (mode) => {
    setSearchMode(mode);
    
    if (mode === 'viewport') {
      // 지도 viewport 기반 검색
      const viewportBounds = await getMapViewportBounds();
      if (viewportBounds) {
        await fetchSheltersFromAPI(viewportBounds);
      } else {
        // viewport를 가져올 수 없으면 nearby 모드로 대체
        setSearchMode('nearby');
        Alert.alert('알림', '지도 범위를 가져올 수 없어 현재 위치 기반으로 검색합니다.');
        await fetchSheltersFromAPI();
      }
    } else {
      // 현재 위치 기반 검색
      await fetchSheltersFromAPI();
    }
  };

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (!visible) return;
  
    const loadShelters = async () => {
      console.log('🚀 대피소 모달 열림 - 데이터 로딩 시작');
      
      let location = userLocation;
      if (!location) {
        location = await getCurrentLocation();
        setUserLocation(location);
      }
  
      if (searchMode === 'viewport') {
        const viewportBounds = await getMapViewportBounds();
        if (viewportBounds) {
          await fetchSheltersFromAPI(viewportBounds);
        } else {
          // viewport를 못 가져오면 현재 위치 기준
          await fetchSheltersFromAPI();
        }
      } else {
        // 기본적으로 현재 위치 기준
        await fetchSheltersFromAPI();
      }
    };
  
    loadShelters();
  
  }, [visible, searchMode]);
  

  // 전화걸기
  const makeCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('오류', '전화 기능을 사용할 수 없습니다.');
        }
      })
      .catch((err) => console.error('전화걸기 오류:', err));
  };

  // 길찾기
  const openNavigation = (latitude, longitude, name) => {
    const url = `http://map.naver.com/index.nhn?slng=${userLocation?.longitude}&slat=${userLocation?.latitude}&stext=현재위치&elng=${longitude}&elat=${latitude}&etext=${encodeURIComponent(name)}&menu=route&pathType=1`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const fallbackUrl = `maps:${latitude},${longitude}`;
          Linking.openURL(fallbackUrl);
        }
      })
      .catch((err) => {
        console.error('길찾기 오류:', err);
        Alert.alert('오류', '길찾기를 실행할 수 없습니다.');
      });
  };

  // 시설 타입별 아이콘
  const getTypeIcon = (type) => {
    if (type.includes('학교') || type.includes('교육')) return '🏫';
    if (type.includes('체육관') || type.includes('운동') || type.includes('체육')) return '🏟️';
    if (type.includes('문화') || type.includes('공연')) return '🎭';
    if (type.includes('종교') || type.includes('교회') || type.includes('성당')) return '⛪';
    if (type.includes('공공') || type.includes('청사')) return '🏢';
    if (type.includes('복지') || type.includes('센터')) return '🏛️';
    return '🏠';
  };

  // 거리 포맷팅
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  };

  const renderShelterItem = (shelter) => (
    <View key={shelter.id} style={styles.shelterItem}>
      <View style={styles.shelterHeader}>
        <View style={styles.shelterTitleRow}>
          <Text style={styles.shelterIcon}>{getTypeIcon(shelter.type)}</Text>
          <View style={styles.shelterTitleContent}>
            <Text style={styles.shelterName}>{shelter.name}</Text>
            <Text style={styles.shelterType}>{shelter.type}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Text style={styles.distance}>
              {shelter.distance ? formatDistance(shelter.distance) : '거리 정보 없음'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.shelterAddress}>{shelter.address}</Text>
      
      <View style={styles.shelterInfo}>
        <Text style={styles.capacity}>수용인원: {shelter.capacity.toLocaleString()}명 (예상)</Text>
        <Text style={styles.contact}>연락처: {shelter.contact}</Text>
        {shelter.managementNumber && (
          <Text style={styles.managementNumber}>관리번호: {shelter.managementNumber}</Text>
        )}
      </View>

      {shelter.facilities && shelter.facilities.length > 0 && (
        <View style={styles.facilitiesContainer}>
          <Text style={styles.facilitiesTitle}>편의시설:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.facilitiesList}>
              {shelter.facilities.map((facility, index) => (
                <View key={index} style={styles.facilityTag}>
                  <Text style={styles.facilityText}>{facility}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]}
          onPress={() => makeCall(shelter.contact)}
        >
          <Text style={styles.callButtonText}>📞 전화</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.navigationButton]}
          onPress={() => openNavigation(shelter.latitude, shelter.longitude, shelter.name)}
        >
          <Text style={styles.navigationButtonText}>🗺️ 길찾기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏠 내 주변 대피소</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 검색 모드 선택 */}
          <View style={styles.searchModeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, searchMode === 'nearby' && styles.activeModeButton]}
              onPress={() => handleSearchModeChange('nearby')}
            >
              <Text style={[styles.modeButtonText, searchMode === 'nearby' && styles.activeModeButtonText]}>
                📍 현재 위치 기준
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modeButton, searchMode === 'viewport' && styles.activeModeButton]}
              onPress={() => handleSearchModeChange('viewport')}
            >
              <Text style={[styles.modeButtonText, searchMode === 'viewport' && styles.activeModeButtonText]}>
                🗺️ 지도 화면 기준
              </Text>
            </TouchableOpacity>
          </View>

          {userLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                📍 위치: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                {!isKoreanCoordinate(userLocation.latitude, userLocation.longitude) && ' (기본 위치 사용)'}
              </Text>
              <Text style={styles.searchModeText}>
                검색 모드: {searchMode === 'nearby' ? '현재 위치 반경 5km' : '지도에 보이는 영역'}
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285f4" />
              <Text style={styles.loadingText}>대피소 정보를 가져오는 중...</Text>
              <Text style={styles.loadingSubText}>
                {searchMode === 'nearby' ? '현재 위치 기준으로' : '지도 화면 범위에서'} 검색하고 있습니다.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.shelterList} showsVerticalScrollIndicator={false}>
              {shelters.length > 0 ? (
                <>
                  <View style={styles.shelterStats}>
                    <Text style={styles.shelterStatsText}>
                      총 {shelters.length}개의 대피소를 찾았습니다
                    </Text>
                  </View>
                  {shelters.map(renderShelterItem)}
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>검색 범위에 대피소가 없습니다</Text>
                  <Text style={styles.noDataSubText}>
                    다른 지역을 검색하거나 잠시 후 다시 시도해주세요
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  searchModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeModeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  locationInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  searchModeText: {
    fontSize: 12,
    color: '#4285f4',
    textAlign: 'center',
    fontWeight: '500',
  },
  shelterStats: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#e3f2fd',
  },
  shelterStatsText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  shelterList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shelterItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shelterHeader: {
    marginBottom: 12,
  },
  shelterTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  shelterIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  shelterTitleContent: {
    flex: 1,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  shelterType: {
    fontSize: 14,
    color: '#666',
  },
  distanceContainer: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  shelterAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  shelterInfo: {
    marginBottom: 12,
  },
  capacity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  managementNumber: {
    fontSize: 12,
    color: '#999',
  },
  facilitiesContainer: {
    marginBottom: 16,
  },
  facilitiesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  facilitiesList: {
    flexDirection: 'row',
  },
  facilityTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  facilityText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: '#4caf50',
  },
  navigationButton: {
    backgroundColor: '#2196f3',
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ShelterModal;