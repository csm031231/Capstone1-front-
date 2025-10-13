// src/components/News/NewsItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { utils } from '../../services/ApiService';
import COLORS from '../../constants/colors';

export default function NewsItem({ news, onPress }) {
  const getRegionColor = (region) => {
    const colors = {
      '김해': '#4caf50',
      '부산': '#ff9800', 
      '창원': '#00bcd4',
      '경남': '#2196f3',
      '서울': '#e91e63',
      '경기': '#f44336',
      '전국': '#607d8b',
      '분류 미지정': '#999'
    };
    return colors[region] || '#999';
  };

  // 썸네일 설정
  const thumbnailColor = getRegionColor(news.region);
  const hasImage = news.image_url; // API에서 이미지 URL 제공시

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress && onPress(news)}
      activeOpacity={0.7}
    >
      <View style={styles.contentArea}>
        {/* 왼쪽: 텍스트 영역 */}
        <View style={styles.textArea}>
          <View style={styles.metaRow}>
            <View style={[styles.regionBadge, { backgroundColor: thumbnailColor }]}>
              <Text style={styles.regionText}>{news.region}</Text>
            </View>
            <Text style={styles.date}>{utils.formatDate(news.YNA_YMD)}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {news.YNA_TTL}
          </Text>

          <Text style={styles.content} numberOfLines={2}>
            {news.YNA_CN}
          </Text>

          {news.YNA_WRTR_NM && (
            <View style={styles.authorContainer}>
              <Text style={styles.author}>{news.YNA_WRTR_NM}</Text>
            </View>
          )}
        </View>

        {/* 오른쪽: 썸네일 이미지 */}
        <View style={[styles.thumbnail, { backgroundColor: thumbnailColor }]}>
          {hasImage ? (
            <Image 
              source={{ uri: news.image_url }} 
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.thumbnailIcon}>📰</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  contentArea: {
    flexDirection: 'row',
    padding: 16,
  },
  textArea: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  regionText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailIcon: {
    fontSize: 32,
    opacity: 0.7,
  },
});