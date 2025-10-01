// src/components/Shelter/ShelterPresentation.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShelterHeader from './ShelterHeader';
import ShelterList from './ShelterList';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';

export default function ShelterPresentation({
  shelters,
  loading,
  error,
  currentLocation,
  onRefresh
}) {
  if (error && shelters.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorMessage 
          message={error} 
          onRetry={onRefresh}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ShelterHeader
        shelterCount={shelters.length}
        currentLocation={currentLocation}
      />

      {loading && shelters.length === 0 ? (
        <LoadingSpinner message="대피소를 불러오는 중..." />
      ) : shelters.length === 0 ? (
        <EmptyState
          icon="home-outline"
          title="주변에 대피소가 없습니다"
          message="지도를 이동하여 다른 지역의 대피소를 확인해보세요"
        />
      ) : (
        <ShelterList
          shelters={shelters}
          onRefresh={onRefresh}
          refreshing={loading}
          currentLocation={currentLocation}
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
});