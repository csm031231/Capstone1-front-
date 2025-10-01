import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { utils } from '../../services/ApiService';

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
      '분류 미지정': '#666'
    };
    return colors[region] || '#666';
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress && onPress(news)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.regionTag, { backgroundColor: getRegionColor(news.region) }]}>
          <Text style={styles.regionText}>{news.region}</Text>
        </View>
        <Text style={styles.date}>{utils.formatDate(news.YNA_YMD)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {news.YNA_TTL}
      </Text>

      <Text style={styles.content} numberOfLines={3}>
        {news.YNA_CN}
      </Text>

      {news.YNA_WRTR_NM && (
        <Text style={styles.author}>✏️ {news.YNA_WRTR_NM}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  regionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  regionText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  author: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});