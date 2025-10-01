// src/components/common/RegionFilter.js
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function RegionFilter({ 
  regions = [], 
  selectedRegion = '전체', 
  onRegionChange,
  getRegionNewsCount 
}) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {regions.map((region, index) => {
          // 구분자인 경우 다르게 렌더링
          if (region.startsWith('---') && region.endsWith('---')) {
            return (
              <View key={`separator-${index}`} style={styles.separator}>
                <Text style={styles.separatorText}>
                  {region.replace(/---/g, '')}
                </Text>
              </View>
            );
          }
          
          const newsCount = getRegionNewsCount ? getRegionNewsCount(region) : 0;
          const isEmpty = newsCount === 0 && region !== '전체';
          
          return (
            <TouchableOpacity
              key={region}
              style={[
                styles.regionButton,
                selectedRegion === region && styles.selectedRegionButton,
                isEmpty && styles.emptyRegionButton
              ]}
              onPress={() => !isEmpty && onRegionChange && onRegionChange(region)}
              disabled={isEmpty}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.regionButtonText,
                selectedRegion === region && styles.selectedRegionButtonText,
                isEmpty && styles.emptyRegionButtonText
              ]}>
                {region} {newsCount > 0 && `(${newsCount})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  separator: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  separatorText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  regionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 50,
    alignItems: 'center',
  },
  selectedRegionButton: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  emptyRegionButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    opacity: 0.6,
  },
  regionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedRegionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyRegionButtonText: {
    color: '#999',
  },
});