// src/components/News/NewsContainer.js - 백엔드 완전 연동 버전
import React, { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../../store/AppContext';
import NewsPresentation from './NewsPresentation';
import { apiService } from '../../services/ApiService';

export default function NewsContainer() {
  const { currentLocation } = useAppState();
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 초기 뉴스 데이터 로드
  useEffect(() => {
    loadInitialNews();
  }, []);

  /**
   * 🔹 초기 뉴스 로드 (앱 시작 시 한 번만)
   */
  const loadInitialNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 초기 뉴스 로드 시작');
      
      // 전략 1: DB에서 먼저 조회 (빠름)
      let newsData = await apiService.getAllNewsFromDb();
      
      // DB에 데이터가 없으면 외부 API에서 가져와서 저장
      if (newsData.length === 0) {
        console.log('⚠️ DB가 비어있음 - 외부 API에서 가져오기');
        newsData = await apiService.fetchAndStoreNews(20);
      } else {
        console.log(`✅ DB에서 ${newsData.length}개 뉴스 로드 완료`);
      }
      
      setNews(newsData);
      
    } catch (err) {
      console.error('❌ 초기 뉴스 로드 실패:', err);
      setError(err.message || '뉴스를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔹 새로고침 (Pull-to-Refresh)
   * 외부 API에서 최신 뉴스를 가져와서 DB에 저장하고 화면 업데이트
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      console.log('🔄 새로고침 시작');
      
      // 외부 API에서 최신 뉴스 가져와서 DB 저장 후 반환
      const newsData = await apiService.fetchAndStoreNews(20);
      
      setNews(newsData);
      console.log(`✅ 새로고침 완료: ${newsData.length}개 뉴스`);
      
      // 성공 피드백 (선택사항)
      // Alert.alert('새로고침 완료', `${newsData.length}개의 뉴스를 가져왔습니다.`);
      
    } catch (err) {
      console.error('❌ 새로고침 실패:', err);
      setError(err.message || '새로고침에 실패했습니다.');
      
      // 실패해도 DB에서라도 데이터 가져오기 시도
      try {
        const fallbackNews = await apiService.getAllNewsFromDb();
        setNews(fallbackNews);
        console.log('⚠️ 새로고침 실패 - DB 데이터 사용');
      } catch (fallbackErr) {
        console.error('❌ DB 조회도 실패:', fallbackErr);
      }
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * 🔹 지역 변경 핸들러
   */
  const handleRegionChange = async (region) => {
    setSelectedRegion(region);
    
    // 선택사항: 지역 변경 시 해당 지역 뉴스만 서버에서 가져오기
    // 현재는 클라이언트 필터링만 사용하지만, 필요시 활성화 가능
    /*
    if (region !== '전체') {
      try {
        const regionNews = await apiService.getNewsByRegion(region);
        setNews(regionNews);
      } catch (err) {
        console.error('지역 뉴스 조회 실패:', err);
      }
    }
    */
  };

  // 🔹 지역 필터링 (클라이언트 사이드)
  const filteredNews = useMemo(() => {
    if (selectedRegion === '전체') return news;
    return news.filter(item => item.region === selectedRegion);
  }, [news, selectedRegion]);

  // 🔹 사용 가능한 지역 목록 추출
  const availableRegions = useMemo(() => {
    const regions = new Set(['전체']);
    news.forEach(item => {
      if (item.region && item.region !== '분류 미지정') {
        regions.add(item.region);
      }
    });
    
    // 우선순위 지역 정렬
    const priorityRegions = ['전체', '김해', '부산', '창원', '경남'];
    const sorted = priorityRegions.filter(r => regions.has(r));
    const remaining = Array.from(regions)
      .filter(r => !priorityRegions.includes(r))
      .sort();
    
    return [...sorted, ...remaining];
  }, [news]);

  // 🔹 지역별 뉴스 개수
  const getRegionNewsCount = (region) => {
    if (region === '전체') return news.length;
    return news.filter(item => item.region === region).length;
  };

  return (
    <NewsPresentation
      news={filteredNews}
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