// src/components/Shelter/ShelterItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { utils } from '../../services/ApiService';

export default function ShelterItem({ shelter, currentLocation, onPress }) {
  const getTypeIcon = (type) => {
    if (type?.includes('학교') || type?.includes('교육')) return '🏫';
    if (type?.includes('체육관') || type?.includes('운동') || type?.includes('체육')) return '🏟️';
    if (type?.includes('문화') || type?.includes('공연')) return '🎭';
    if (type?.includes('종교') || type?.includes('교회') || type?.includes('성당')) return '⛪';
    if (type?.includes('공공') || type?.includes('청사')) return '🏢';
    return '🏠';
  };

  const makeCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => {
      console.error('전화걸기 오류:', err);
      Alert.alert('오류', '전화를 걸 수 없습니다.');
    });
  };

  const openNavigation = () => {
    if (!currentLocation) {
      Alert.alert('알림', '현재 위치를 확인할 수 없습니다.');
      return;
    }

    const url = `http://map.naver.com/index.nhn?slng=${currentLocation.longitude}&slat=${currentLocation.latitude}&stext=현재위치&elng=${shelter.longitude}&elat=${shelter.latitude}&etext=${encodeURIComponent(shelter.REARE_NM)}&menu=route&pathType=1`;
    
    Linking.openURL(url).catch(err => {
      console.error('길찾기 오류:', err);
      Alert.alert('오류', '길찾기를 열 수 없습니다.');
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress && onPress(shelter)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{getTypeIcon(shelter.SHLT_SE_NM)}</Text>
        <View style={styles.titleContent}>
          <Text style={styles.name} numberOfLines={1}>
            {shelter.REARE_NM}
          </Text>
          <Text style={styles.type}>{shelter.SHLT_SE_NM}</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Text style={styles.distance}>
            {utils.formatDistance(shelter.distance)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.address} numberOfLines={2}>
        {shelter.RONA_DADDR}
      </Text>
      
      <View style={styles.info}>
        <Text style={styles.capacity}>
          수용인원: {shelter.capacity?.toLocaleString() || '정보없음'}명
        </Text>
        <Text style={styles.contact}>
          연락처: {shelter.contact || '정보없음'}
        </Text>
      </View>

      {shelter.facilities && shelter.facilities.length > 0 && (
        <View style={styles.facilitiesContainer}>
          <Text style={styles.facilitiesTitle}>편의시설:</Text>
          <View style={styles.facilitiesList}>
            {shelter.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityTag}>
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => makeCall(shelter.contact)}
        >
          <Text style={styles.callButtonText}>📞 전화</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navigationButton}
          onPress={openNavigation}
        >
          <Text style={styles.navigationButtonText}>🗺️ 길찾기</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  type: {
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
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  info: {
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
    flexWrap: 'wrap',
  },
  facilityTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  navigationButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
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
});