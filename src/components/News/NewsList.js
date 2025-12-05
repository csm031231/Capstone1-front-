// src/components/News/NewsList.js
import React, { useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import NewsItem from './NewsItem';
import COLORS from '../../constants/colors';

export default function NewsList({ 
  news, 
  onRefresh, 
  refreshing = false 
}) {
  const flatListRef = useRef(null); // 2. 리스트 제어용 Ref 생성

  // 3. 특정 위치로 스크롤 이동시키는 함수
  const handleScrollToIndex = (index) => {
    // 약간의 딜레이(레이아웃이 줄어들 시간)를 주고 이동
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: index,
        animated: false,
        viewPosition: 0 // 0: 화면 맨 위, 0.5: 화면 중간, 1: 화면 맨 아래
      });
    }, 100);
  };

  const renderItem = ({ item, index }) => ( // index 받아오기
    <NewsItem 
      news={item}
      index={index} // 4. index 전달
      onToggle={() => handleScrollToIndex(index)} // 5. 이동 함수 전달
    />
  );

  const keyExtractor = (item, index) => 
    item.YNA_NO ? `news-${item.YNA_NO}` : `news-${index}`;

  const onScrollToIndexFailed = (info) => {
    flatListRef.current?.scrollToOffset({
      offset: info.averageItemLength * info.index,
      animated: true,
    });
  };

  return (
    <FlatList
      ref={flatListRef}
      data={news}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      removeClippedSubviews={true}
      onScrollToIndexFailed={onScrollToIndexFailed}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={8}
      bounces={false}
      overScrollMode="never"
      scrollEventThrottle={16}
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