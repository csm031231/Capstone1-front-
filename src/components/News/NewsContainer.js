// src/components/News/NewsContainer.js
import React, { useState, useMemo } from 'react';
import { useAppState } from '../../store/AppContext';
import NewsPresentation from './NewsPresentation';

export default function NewsContainer() {
  const { news, loading, error, currentLocation } = useAppState();
  const [selectedRegion, setSelectedRegion] = useState('전체');

  // 지역 필터링만 (클라이언트 사이드)
  const filteredNews = useMemo(() => {
    if (selectedRegion === '전체') return news;
    return news.filter(item => item.region === selectedRegion);
  }, [news, selectedRegion]);

  // 사용 가능한 지역 목록
  const availableRegions = useMemo(() => {
    const regions = new Set(['전체']);
    news.forEach(item => {
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
  }, [news]);

  const getRegionNewsCount = (region) => {
    if (region === '전체') return news.length;
    return news.filter(item => item.region === region).length;
  };

  return (
    <NewsPresentation
      news={filteredNews}
      loading={loading.news}
      error={error}
      selectedRegion={selectedRegion}
      availableRegions={availableRegions}
      currentLocation={currentLocation}
      onRegionChange={setSelectedRegion}
      getRegionNewsCount={getRegionNewsCount}
    />
  );
}