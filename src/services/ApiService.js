// src/services/ApiService.js - 전국 서비스 버전

const API_BASE_URL = 'http://192.168.0.16:8000';

const cache = {
  news: null,
  newsTimestamp: null,
  CACHE_DURATION: 5 * 60 * 1000
};

export const apiService = {
  async getShelters(bounds) {
    try {
      console.log('🔄 대피소 API 호출 시작');
      
      const params = new URLSearchParams({
        startLot: bounds.startLot,
        endLot: bounds.endLot,
        startLat: bounds.startLat,
        endLat: bounds.endLat
      });

      const url = `${API_BASE_URL}/shelter_router/get_shelter?${params}`;
      console.log('📡 API URL:', url);

      const response = await fetch(url);
      console.log('📥 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      console.log('📄 응답 길이:', text.length);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패');
        return [];
      }

      if (!Array.isArray(data)) {
        console.warn('⚠️ 응답이 배열이 아님');
        return [];
      }

      console.log(`✅ ${data.length}개 대피소 수신`);
      return data;
      
    } catch (error) {
      console.error('❌ 대피소 API 오류:', error);
      throw error;
    }
  },

  async getNews(region = null) {
    try {
      const now = Date.now();
      if (cache.news && cache.newsTimestamp && (now - cache.newsTimestamp < cache.CACHE_DURATION)) {
        console.log('📦 캐시된 뉴스 반환');
        return cache.news;
      }

      console.log('🔄 뉴스 API 호출');
      
      const url = region && region !== '전체'
        ? `${API_BASE_URL}/news_router/get_news?region=${encodeURIComponent(region)}`
        : `${API_BASE_URL}/news_router/get_news`;

      console.log('📡 API URL:', url);

      const response = await fetch(url);
      console.log('📥 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      console.log('📄 응답 길이:', text.length);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패');
        return [];
      }

      if (!Array.isArray(data)) {
        console.warn('⚠️ 응답이 배열이 아님');
        return [];
      }
      
      cache.news = data;
      cache.newsTimestamp = now;
      
      console.log(`✅ ${data.length}개 뉴스 수신`);
      return data;
      
    } catch (error) {
      console.error('❌ 뉴스 API 오류:', error);
      throw error;
    }
  },

  clearCache() {
    cache.news = null;
    cache.newsTimestamp = null;
  }
};

export const utils = {
  // 날짜 포맷팅
  formatDate(dateString) {
    if (!dateString) return '날짜 정보 없음';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return '방금 전';
      if (minutes < 60) return `${minutes}분 전`;
      if (hours < 24) return `${hours}시간 전`;
      if (days < 7) return `${days}일 전`;
      
      return date.toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  },

  // 거리 포맷팅
  formatDistance(meters) {
    if (!meters && meters !== 0) return '거리 정보 없음';
    return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
  },

  // 뉴스 내용에서 지역 추출
  extractRegionFromNews(content) {
    if (!content) return '분류 미지정';
    
    const regions = [
      // 특별시/광역시
      { name: '서울', keywords: ['서울', '서울시', '강남', '강북', '종로', '중구', '용산', '성동', '광진', '동대문', '중랑', '성북', '강북', '도봉', '노원', '은평', '서대문', '마포', '양천', '강서', '구로', '금천', '영등포', '동작', '관악', '서초', '강남', '송파', '강동'] },
      { name: '부산', keywords: ['부산', '부산시', '해운대', '서면', '광안리', '남포동', '중구', '서구', '동구', '영도', '부산진', '동래', '남구', '북구', '강서구', '연제', '수영', '사상', '기장'] },
      { name: '대구', keywords: ['대구', '대구시', '동성로', '중구', '동구', '서구', '남구', '북구', '수성', '달서', '달성'] },
      { name: '인천', keywords: ['인천', '인천시', '송도', '영종도', '중구', '동구', '미추홀', '연수', '남동', '부평', '계양', '서구', '강화', '옹진'] },
      { name: '광주', keywords: ['광주', '광주시', '동구', '서구', '남구', '북구', '광산'] },
      { name: '대전', keywords: ['대전', '대전시', '동구', '중구', '서구', '유성', '대덕'] },
      { name: '울산', keywords: ['울산', '울산시', '중구', '남구', '동구', '북구', '울주'] },
      { name: '세종', keywords: ['세종', '세종시', '세종특별자치시'] },
      
      // 경기도
      { name: '경기', keywords: ['경기', '경기도', '수원', '성남', '고양', '용인', '부천', '안산', '안양', '남양주', '화성', '평택', '의정부', '시흥', '파주', '김포', '광명', '광주', '군포', '하남', '오산', '양주', '이천', '구리', '안성', '포천', '의왕', '여주', '양평', '동두천', '과천', '가평', '연천'] },
      
      // 강원도
      { name: '강원', keywords: ['강원', '강원도', '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양'] },
      
      // 충청북도
      { name: '충북', keywords: ['충북', '충청북도', '청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양'] },
      
      // 충청남도
      { name: '충남', keywords: ['충남', '충청남도', '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안'] },
      
      // 전라북도
      { name: '전북', keywords: ['전북', '전라북도', '전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안'] },
      
      // 전라남도
      { name: '전남', keywords: ['전남', '전라남도', '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'] },
      
      // 경상북도
      { name: '경북', keywords: ['경북', '경상북도', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉'] },
      
      // 경상남도
      { name: '경남', keywords: ['경남', '경상남도', '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천'] },
      
      // 제주도
      { name: '제주', keywords: ['제주', '제주도', '제주시', '서귀포'] },
      
      // 전국
      { name: '전국', keywords: ['전국', '전체', '대한민국', '한국', '국내'] }
    ];

    for (const region of regions) {
      for (const keyword of region.keywords) {
        if (content.includes(keyword)) {
          return region.name;
        }
      }
    }

    return '분류 미지정';
  },

  // 좌표로 지역명 감지 (대한민국 전역)
  detectRegionFromLocation(location) {
    if (!location) return '전체';
    
    const { latitude, longitude } = location;
    
    // 서울 (37.4~37.7, 126.7~127.2)
    if (latitude >= 37.4 && latitude <= 37.7 && longitude >= 126.7 && longitude <= 127.2) {
      return '서울';
    }
    
    // 부산 (35.0~35.4, 128.8~129.3)
    if (latitude >= 35.0 && latitude <= 35.4 && longitude >= 128.8 && longitude <= 129.3) {
      return '부산';
    }
    
    // 대구 (35.7~36.0, 128.4~128.8)
    if (latitude >= 35.7 && latitude <= 36.0 && longitude >= 128.4 && longitude <= 128.8) {
      return '대구';
    }
    
    // 인천 (37.3~37.6, 126.3~126.9)
    if (latitude >= 37.3 && latitude <= 37.6 && longitude >= 126.3 && longitude <= 126.9) {
      return '인천';
    }
    
    // 광주 (35.0~35.3, 126.7~127.0)
    if (latitude >= 35.0 && latitude <= 35.3 && longitude >= 126.7 && longitude <= 127.0) {
      return '광주';
    }
    
    // 대전 (36.2~36.5, 127.2~127.6)
    if (latitude >= 36.2 && latitude <= 36.5 && longitude >= 127.2 && longitude <= 127.6) {
      return '대전';
    }
    
    // 울산 (35.4~35.7, 129.1~129.5)
    if (latitude >= 35.4 && latitude <= 35.7 && longitude >= 129.1 && longitude <= 129.5) {
      return '울산';
    }
    
    // 세종 (36.4~36.7, 127.2~127.4)
    if (latitude >= 36.4 && latitude <= 36.7 && longitude >= 127.2 && longitude <= 127.4) {
      return '세종';
    }
    
    // 경기도 (37.0~38.0, 126.5~127.5)
    if (latitude >= 37.0 && latitude <= 38.0 && longitude >= 126.5 && longitude <= 127.5) {
      return '경기';
    }
    
    // 강원도 (37.0~38.5, 127.5~129.5)
    if (latitude >= 37.0 && latitude <= 38.5 && longitude >= 127.5 && longitude <= 129.5) {
      return '강원';
    }
    
    // 충청북도 (36.3~37.2, 127.3~128.5)
    if (latitude >= 36.3 && latitude <= 37.2 && longitude >= 127.3 && longitude <= 128.5) {
      return '충북';
    }
    
    // 충청남도 (36.0~36.9, 126.2~127.5)
    if (latitude >= 36.0 && latitude <= 36.9 && longitude >= 126.2 && longitude <= 127.5) {
      return '충남';
    }
    
    // 전라북도 (35.5~36.2, 126.5~127.7)
    if (latitude >= 35.5 && latitude <= 36.2 && longitude >= 126.5 && longitude <= 127.7) {
      return '전북';
    }
    
    // 전라남도 (34.2~35.5, 126.0~127.8)
    if (latitude >= 34.2 && latitude <= 35.5 && longitude >= 126.0 && longitude <= 127.8) {
      return '전남';
    }
    
    // 경상북도 (35.8~37.2, 128.2~129.6)
    if (latitude >= 35.8 && latitude <= 37.2 && longitude >= 128.2 && longitude <= 129.6) {
      return '경북';
    }
    
    // 경상남도 (34.7~35.9, 127.5~129.5)
    if (latitude >= 34.7 && latitude <= 35.9 && longitude >= 127.5 && longitude <= 129.5) {
      return '경남';
    }
    
    // 제주도 (33.0~33.7, 126.0~127.0)
    if (latitude >= 33.0 && latitude <= 33.7 && longitude >= 126.0 && longitude <= 127.0) {
      return '제주';
    }
    
    return '전체';
  },

  // 거리 계산 (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c * 1000; // 미터로 변환
    
    return Math.round(distance);
  }
};

export default {
  apiService,
  utils
};