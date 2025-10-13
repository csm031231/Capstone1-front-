// src/components/Shelter/ShelterHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ShelterHeader({ shelterCount, currentLocation }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>주변 대피소</Text>
      <Text style={styles.subtitle}>총 {shelterCount}곳의 대피소</Text>
      
      {currentLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 현재 위치 기준으로 가까운 순서로 정렬됨
          </Text>
          <Text style={styles.coordinatesText}>
            {currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)}
          </Text>
        </View>
      )}
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
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#2e7d32',
    opacity: 0.8,
  },
});