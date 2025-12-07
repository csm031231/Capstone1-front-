// src/components/News/NewsItem.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { utils } from '../../services/ApiService';
import COLORS from '../../constants/colors';

export default function NewsItem({ news, onPress, index, onToggle }) {

  const [expanded, setExpanded] = useState(false);

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

  const handlePress = () => {
    // 부드러운 애니메이션 적용
    console.log('📰 [뉴스 데이터 확인]');
    console.log('제목:', news.YNA_TTL);
    console.log('내용:', news.YNA_CN);
    const nextState = !expanded;
    setExpanded(!expanded);
    
    // 만약 부모 컴포넌트에서 별도의 onPress를 전달했다면 실행 (현재는 없음)
    if (nextState === false && onToggle) {
      onToggle(index); 
    }

    if (onPress) onPress(news);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
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

          {/* 제목: 펼쳐지면 전체 보임, 닫히면 2줄 제한 */}
          <Text 
            style={styles.title} 
            numberOfLines={expanded ? undefined : 2}
          >
            {news.YNA_TTL}
          </Text>

          {/* 본문: 펼쳐지면 전체 보임, 닫히면 2줄 제한 */}
          <Text 
            style={styles.content} 
            numberOfLines={expanded ? undefined : 2}
          >
            {news.YNA_CN}
          </Text>

          {/* 작성자 및 더보기 표시 */}
          <View style={styles.footerRow}>
              {news.YNA_WRTR_NM ? (
                <Text style={styles.author}>{news.YNA_WRTR_NM}</Text>
              ) : (
                <View /> 
              )}
              <Text style={styles.expandText}>
                  {expanded ? '접기 ▲' : '더보기 ▼'}
              </Text>
          </View>
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 작성자와 더보기 버튼 양끝 배치
    alignItems: 'center',
    marginTop: 4,
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
    color: COLORS.primary,
    opacity: 0.7,
  },
});