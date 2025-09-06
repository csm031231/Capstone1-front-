import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';

const LocationSelector = ({ onLocationSelect, initialLocation = null, placeholder = "위치를 선택해주세요" }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // 미리 정의된 주요 위치들 (김해시 기준)
  const predefinedLocations = [
    { name: '김해시청', lat: '35.228557', lng: '128.889036' },
    { name: '김해국제공항', lat: '35.179554', lng: '128.938253' },
    { name: '김해롯데워터파크', lat: '35.208842', lng: '128.881195' },
    { name: '김해시 체육관', lat: '35.233596', lng: '128.889544' },
    { name: '장유역', lat: '35.190156', lng: '128.807892' },
    { name: '김해대학교', lat: '35.205147', lng: '128.912772' },
    { name: '김해문화의전당', lat: '35.235489', lng: '128.888901' },
    { name: '김해중앙시장', lat: '35.228901', lng: '128.888234' },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('알림', '위치 권한이 필요합니다.');
        setIsGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const currentPos = {
        name: '현재 위치',
        lat: location.coords.latitude.toString(),
        lng: location.coords.longitude.toString(),
      };

      setCurrentLocation(currentPos);
      setIsGettingLocation(false);
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      setIsGettingLocation(false);
      Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setModalVisible(false);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleManualInput = () => {
    if (searchText.trim()) {
      // 간단한 좌표 형식 검증 (위도,경도 형태)
      const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
      const match = searchText.match(coordPattern);
      
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // 위도 경도 범위 검증
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          const manualLocation = {
            name: `직접입력 (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
            lat: lat.toString(),
            lng: lng.toString(),
          };
          handleLocationSelect(manualLocation);
        } else {
          Alert.alert('오류', '올바른 좌표 범위를 입력해주세요.\n위도: -90 ~ 90, 경도: -180 ~ 180');
        }
      } else {
        Alert.alert('오류', '좌표 형식이 올바르지 않습니다.\n예시: 35.233596, 128.889544');
      }
    }
  };

  const filteredLocations = predefinedLocations.filter(location =>
    location.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectorButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {selectedLocation ? selectedLocation.name : placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {selectedLocation && (
        <View style={styles.coordinatesDisplay}>
          <Text style={styles.coordinatesText}>
            위도: {parseFloat(selectedLocation.lat).toFixed(6)}, 경도: {parseFloat(selectedLocation.lng).toFixed(6)}
          </Text>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>위치 선택</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="위치명 또는 좌표 입력 (예: 35.233596, 128.889544)"
                value={searchText}
                onChangeText={setSearchText}
              />
              <TouchableOpacity 
                style={styles.manualInputButton}
                onPress={handleManualInput}
              >
                <Text style={styles.manualInputButtonText}>입력</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.locationList}>
              {/* 현재 위치 */}
              {currentLocation && (
                <TouchableOpacity 
                  style={[styles.locationItem, styles.currentLocationItem]}
                  onPress={() => handleLocationSelect(currentLocation)}
                >
                  <Text style={styles.locationIcon}>📍</Text>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{currentLocation.name}</Text>
                    <Text style={styles.locationCoords}>
                      {parseFloat(currentLocation.lat).toFixed(6)}, {parseFloat(currentLocation.lng).toFixed(6)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* 현재 위치 가져오기 버튼 */}
              <TouchableOpacity 
                style={styles.getCurrentLocationButton}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <Text style={styles.getCurrentLocationIcon}>🎯</Text>
                <Text style={styles.getCurrentLocationText}>
                  {isGettingLocation ? '위치 가져오는 중...' : '현재 위치 가져오기'}
                </Text>
              </TouchableOpacity>

              {/* 미리 정의된 위치들 */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>주요 위치</Text>
              </View>

              {filteredLocations.map((location, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.locationItem}
                  onPress={() => handleLocationSelect(location)}
                >
                  <Text style={styles.locationIcon}>📍</Text>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationCoords}>
                      {parseFloat(location.lat).toFixed(6)}, {parseFloat(location.lng).toFixed(6)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {filteredLocations.length === 0 && searchText && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
                  <Text style={styles.noResultsSubText}>
                    직접 좌표를 입력하거나 다른 키워드로 검색해보세요.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  coordinatesDisplay: {
    marginTop: 4,
    paddingHorizontal: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    fontSize: 18,
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  manualInputButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  manualInputButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  locationList: {
    maxHeight: 400,
  },
  getCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  getCurrentLocationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  getCurrentLocationText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentLocationItem: {
    backgroundColor: '#fff3e0',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 12,
    color: '#666',
  },
  noResultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default LocationSelector;