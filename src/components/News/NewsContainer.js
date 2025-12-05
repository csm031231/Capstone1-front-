// src/components/News/NewsContainer.js - 백엔드 완전 연동 버전
import React, { useState, useEffect } from 'react';
import { useAppState } from '../../store/AppContext';
import NewsPresentation from './NewsPresentation';
import { apiService, utils } from '../../services/ApiService';

export default function NewsContainer() {
  const { currentLocation } = useAppState();
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);


  // 1. 위치가 잡히면 자동으로 해당 지역 선택
  useEffect(() => {
    if (currentLocation) {
      const myRegion = utils.detectRegionFromLocation(currentLocation);
      if (myRegion && myRegion !== '전체') {
        console.log(`📍 위치 기반 지역 자동 선택: ${myRegion}`);
        setSelectedRegion(myRegion);
        // 지역이 바뀌면 아래 useEffect가 자동으로 데이터를 가져옵니다.
      }
    }
  }, [currentLocation]);

  // 2. 지역이 변경될 때마다 DB에서 뉴스 가져오기
  useEffect(() => {
    loadNews(selectedRegion);
  }, [selectedRegion]);

  const loadNews = async (region) => {
    if (!region || region === '전체') {
        // "전체"일 때는 DB 조회를 안 하거나, 해도 결과가 없을 것임 (사용자 요청 반영)
        setNews([]); 
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getNewsByRegion(region);
      // ApiService에서 에러가 나도 []를 반환하도록 고쳤으므로
      // 여기서는 data가 무조건 배열입니다.
      setNews(data);
    } catch (e) {
      console.error("News Load Error:", e);
      // 🔥 혹시라도 에러가 나면, 화면을 멈추지 말고 '빈 목록'으로 처리
      setNews([]); 
      // 필요하다면 setError('뉴스를 불러올 수 없습니다'); 를 써도 됨
    } finally {
      // 🔥 성공하든 실패하든 로딩은 무조건 끈다 (그래야 화면이 보임)
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // 현재 선택된 지역으로 다시 조회
      await loadNews(selectedRegion);
    } finally {
      setRefreshing(false);
    }
  };


  const handleRegionChange = async (region) => {
    setSelectedRegion(region);
  };

  const getRegionNewsCount = (region) => {
    if (region === selectedRegion) {
      return news.length;
    }

    return null;
  };

  const availableRegions = ['서울', '경기', '인천', '부산', '울산', '경남','대구', '경북', '광주', '전남', '전북','대전', '충남', '세종','충북','강원','제주', '분류 미지정'];

  return (
    <NewsPresentation
      news={news}
      loading={loading}
      error={error}
      selectedRegion={selectedRegion}
      availableRegions={availableRegions}
      currentLocation={currentLocation}
      onRegionChange={handleRegionChange}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      getRegionNewsCount={getRegionNewsCount}
    />
  );
}