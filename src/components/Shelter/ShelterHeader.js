// src/components/Shelter/ShelterHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ShelterHeader({ shelterCount, currentLocation }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>주변 대피소</Text>
      <Text style={styles.subtitle}>총 {shelterCount}곳의 대피소</Text>      
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 5,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    left: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    left: 15,
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