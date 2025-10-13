// src/components/common/RegionFilter.js
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

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
          // 구분자인 경우
          if (region.startsWith('---') && region.endsWith('---')) {
            return (
              <View key={`separator-${index}`} style={styles.separator}>
                <View style={styles.separatorLine} />
              </View>
            );
          }
          
          const newsCount = getRegionNewsCount ? getRegionNewsCount(region) : 0;
          const isEmpty = newsCount === 0 && region !== '전체';
          const isSelected = selectedRegion === region;
          
          return (
            <TouchableOpacity
              key={region}
              style={[
                styles.regionChip,
                isSelected && styles.selectedChip,
                isEmpty && styles.emptyChip
              ]}
              onPress={() => !isEmpty && onRegionChange && onRegionChange(region)}
              disabled={isEmpty}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                isSelected && styles.selectedChipText,
                isEmpty && styles.emptyChipText
              ]}>
                {region}
              </Text>
              {newsCount > 0 && (
                <View style={[
                  styles.countBadge,
                  isSelected && styles.selectedCountBadge
                ]}>
                  <Text style={[
                    styles.countText,
                    isSelected && styles.selectedCountText
                  ]}>
                    {newsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  separator: {
    width: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  separatorLine: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.divider,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: 0,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  emptyChip: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.divider,
    opacity: 0.5,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  selectedChipText: {
    color: COLORS.textWhite,
  },
  emptyChipText: {
    color: COLORS.textLight,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    fontSize: 11,
    color: COLORS.textWhite,
    fontWeight: '700',
  },
  selectedCountText: {
    color: COLORS.textWhite,
  },
});