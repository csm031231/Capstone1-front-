// src/components/News/NewsHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { utils } from '../../services/ApiService';
import COLORS from '../../constants/colors';

export default function NewsHeader({ selectedRegion, newsCount, currentLocation }) {
  const getCurrentLocationText = () => {
    if (!currentLocation) return '위치 정보 없음';
    const detectedRegion = utils.detectRegionFromLocation(currentLocation);
    return detectedRegion === '전체' ? '알 수 없는 지역' : detectedRegion;
  };

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleContent}>
          <Text style={styles.title}>재난 뉴스</Text>
          <Text style={styles.subtitle}>
            {selectedRegion === '전체' ? 
              `전국 ${newsCount}건` : 
              `${selectedRegion} ${newsCount}건`
            }
          </Text>
        </View>
      </View>       
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    left: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    left: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overlayLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
});