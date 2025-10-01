// src/components/News/NewsHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { utils } from '../../services/ApiService';

export default function NewsHeader({ selectedRegion, newsCount, currentLocation }) {
  const getCurrentLocationText = () => {
    if (!currentLocation) return '위치 정보 없음';
    const detectedRegion = utils.detectRegionFromLocation(currentLocation);
    return detectedRegion === '전체' ? '알 수 없는 지역' : `${detectedRegion} 지역`;
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>📰 재난 뉴스</Text>
      <Text style={styles.subtitle}>
        {selectedRegion === '전체' ? 
          `총 ${newsCount}건의 뉴스` : 
          `${selectedRegion} 지역 ${newsCount}건의 뉴스`
        }
      </Text>
      
      <View style={styles.locationInfo}>
        <Text style={styles.locationText}>
          현재 위치: {getCurrentLocationText()}
        </Text>
        {currentLocation && (
          <Text style={styles.coordinatesText}>
            {currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#1976d2',
    opacity: 0.8,
  },
});