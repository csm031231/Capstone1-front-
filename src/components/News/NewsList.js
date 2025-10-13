// src/components/News/NewsList.js
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import NewsItem from './NewsItem';
import COLORS from '../../constants/colors';

export default function NewsList({ 
  news, 
  onRefresh, 
  refreshing = false 
}) {
  const renderItem = ({ item }) => (
    <NewsItem news={item} />
  );

  const keyExtractor = (item, index) => 
    item.YNA_NO ? `news-${item.YNA_NO}` : `news-${index}`;

  return (
    <FlatList
      data={news}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={8}
      // 🎯 스크롤 바운싱 제거 (iOS)
      bounces={false}
      // 🎯 오버스크롤 제거 (Android)
      overScrollMode="never"
      // 🎯 스크롤 성능 최적화
      scrollEventThrottle={16}
      // 🎯 스크롤 끝에서 멈춤
      decelerationRate="normal"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
});