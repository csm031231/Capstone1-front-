// src/components/News/NewsPresentation.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import NewsHeader from './NewsHeader';
import RegionFilter from '../common/RegionFilter';
import NewsList from './NewsList';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';

export default function NewsPresentation({
  news,
  loading,
  error,
  selectedRegion,
  availableRegions,
  currentLocation,
  onRegionChange,
  onRefresh,
  getRegionNewsCount
}) {
  if (error && news.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RegionFilter
        regions={availableRegions}
        selectedRegion={selectedRegion}
        onRegionChange={onRegionChange}
        getRegionNewsCount={getRegionNewsCount}
      />

      <NewsHeader
        selectedRegion={selectedRegion}
        newsCount={news.length}
        currentLocation={currentLocation}
      />

      {loading && news.length === 0 ? (
        <LoadingSpinner message="뉴스를 불러오는 중..." />
      ) : news.length === 0 ? (
        <EmptyState
          icon="newspaper-outline"
          title={`${selectedRegion} 지역의 뉴스가 없습니다`}
          message={selectedRegion === '전체' ? 
            '새로고침하여 최신 뉴스를 확인해보세요' : 
            '다른 지역을 선택하거나 새로고침해보세요'
          }
        />
      ) : (
        <NewsList
          news={news}
          onRefresh={onRefresh}
          refreshing={loading}
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