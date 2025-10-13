// src/components/News/NewsContainer.js
import React, { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../../store/AppContext';
import NewsPresentation from './NewsPresentation';
import { FIXED_DUMMY_NEWS, generateRandomNews, mockFetchNews } from '../../utils/dummyNews';

export default function NewsContainer() {
  const { news: apiNews, loading, error, currentLocation } = useAppState();
  const [selectedRegion, setSelectedRegion] = useState('전체');
  
  // 🎯 더미 데이터 사용 모드 설정
  const USE_DUMMY_DATA = true; // false로 변경하면 실제 API 사용
  const USE_RANDOM_DATA = false; // true면 랜덤 생성, false면 고정 데이터
  
  // 더미 데이터 선택
  const dummyNews = USE_RANDOM_DATA ? generateRandomNews(15) : FIXED_DUMMY_NEWS;
  
  // 실제 데이터 또는 더미 데이터 선택
  const newsData = USE_DUMMY_DATA ? dummyNews : apiNews;

  // 지역 필터링
  const filteredNews = useMemo(() => {
    if (selectedRegion === '전체') return newsData;
    return newsData.filter(item => item.region === selectedRegion);
  }, [newsData, selectedRegion]);

  // 사용 가능한 지역 목록
  const availableRegions = useMemo(() => {
    const regions = new Set(['전체']);
    newsData.forEach(item => {
      if (item.region && item.region !== '분류 미지정') {
        regions.add(item.region);
      }
    });
    
    const priorityRegions = ['전체', '김해', '부산', '창원', '경남'];
    const sorted = priorityRegions.filter(r => regions.has(r));
    const remaining = Array.from(regions)
      .filter(r => !priorityRegions.includes(r))
      .sort();
    
    return [...sorted, ...remaining];
  }, [newsData]);

  const getRegionNewsCount = (region) => {
    if (region === '전체') return newsData.length;
    return newsData.filter(item => item.region === region).length;
  };

  // 새로고침 (더미 데이터 모드에서는 시뮬레이션만)
  const handleRefresh = async () => {
    if (USE_DUMMY_DATA) {
      console.log('🔄 더미 데이터 새로고침 시뮬레이션');
      // 실제로는 아무것도 하지 않음 (또는 데이터 재생성)
    } else {
      // 실제 API 호출 로직
      console.log('🔄 실제 뉴스 새로고침');
    }
  };

  return (
    <NewsPresentation
      news={filteredNews}
      loading={USE_DUMMY_DATA ? false : loading.news}
      error={USE_DUMMY_DATA ? null : error}
      selectedRegion={selectedRegion}
      availableRegions={availableRegions}
      currentLocation={currentLocation}
      onRegionChange={setSelectedRegion}
      onRefresh={handleRefresh}
      getRegionNewsCount={getRegionNewsCount}
    />
  );
}