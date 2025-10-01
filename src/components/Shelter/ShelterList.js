// src/components/Shelter/ShelterList.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import RefreshableScrollView from '../common/RefreshableScrollView';
import ShelterItem from './ShelterItem';

export default function ShelterList({ 
  shelters, 
  onRefresh, 
  refreshing = false, 
  currentLocation 
}) {
  return (
    <RefreshableScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
    >
      {shelters.map((shelter) => (
        <ShelterItem 
          key={shelter.id} 
          shelter={shelter}
          currentLocation={currentLocation}
        />
      ))}
    </RefreshableScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});
