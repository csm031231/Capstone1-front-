// src/components/News/NewsList.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import RefreshableScrollView from '../common/RefreshableScrollView';
import NewsItem from './NewsItem';

export default function NewsList({ 
  news, 
  onRefresh, 
  refreshing = false 
}) {
  return (
    <RefreshableScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
    >
      {news.map((newsItem) => (
        <NewsItem 
          key={newsItem.YNA_NO || Math.random()} 
          news={newsItem}
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