
const API_BASE_URL = 'http://192.168.0.3:8000';

const cache = {
  news: null,
  newsTimestamp: null,
  CACHE_DURATION: 5 * 60 * 1000
};

const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('요청 시간 초과')), timeout)
    )
  ]);
};

// 🆕 길찾기 API 호출 - 개선된 버전
export const getDirections = async (startLng, startLat, goalLng, goalLat, option = 'trafast') => {
  try {
    // ✅ 좌표 유효성 검사
    const coords = [
      { name: 'startLng', value: startLng },
      { name: 'startLat', value: startLat },
      { name: 'goalLng', value: goalLng },
      { name: 'goalLat', value: goalLat }
    ];
    
    for (const coord of coords) {
      if (coord.value === null || coord.value === undefined) {
        throw new Error(`${coord.name}이(가) 없습니다`);
      }
      const num = parseFloat(coord.value);
      if (isNaN(num)) {
        throw new Error(`${coord.name}이(가) 유효하지 않습니다: ${coord.value}`);
      }
    }
    
    const url = `${API_BASE_URL}/directions/directions?start=${startLng},${startLat}&goal=${goalLng},${goalLat}`;
    
    console.log('🔍 길찾기 API 호출:', url);
    console.log('📍 출발:', { lng: startLng, lat: startLat });
    console.log('📍 도착:', { lng: goalLng, lat: goalLat });
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 15000);

    console.log('📥 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 오류 응답:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ 길찾기 데이터 수신 완료');
    
    // 🔍 응답 데이터 구조 검증
    if (!data) {
      throw new Error('응답 데이터가 비어있습니다');
    }
    
    if (data.code && data.code !== 0) {
      console.error('❌ 네이버 API 오류 코드:', data.code);
      console.error('❌ 오류 메시지:', data.message);
      throw new Error(`네이버 API 오류: ${data.message || 'Unknown error'}`);
    }
    
    if (!data.route) {
      console.error('❌ route 객체가 없습니다. 응답 구조:', Object.keys(data));
      throw new Error('경로 데이터가 없습니다');
    }
    
    const availableOptions = Object.keys(data.route);
    console.log('📊 사용 가능한 경로 옵션:', availableOptions);
    
    const selectedOption = 'trafast';
    if (!data.route[selectedOption] || data.route[selectedOption].length === 0) {
      console.error('❌ 백엔드로부터 받은 "trafast" 경로가 없거나 비어있습니다.');
      console.warn('ℹ️ (참고) 현재 백엔드는 "trafast" 옵션만 요청하도록 설정되어 있습니다.');
      throw new Error('경로를 찾을 수 없습니다');
    }
    
    // 'trafast'가 유효하므로, 이 데이터를 사용합니다.
    const route = data.route[selectedOption][0];
    
    if (!route.summary || !route.path) {
      console.error('❌ 경로 데이터 구조 오류:', route);
      throw new Error('경로 데이터가 올바르지 않습니다');
    }
    
    console.log('📊 경로 정보:', {
      option: selectedOption,
      distance: route.summary.distance,
      duration: route.summary.duration,
      tollFare: route.summary.tollFare,
      pathLength: route.path?.length || 0
    });
    
    return {
      ...data,
      selectedOption,
      route: {
        ...data.route,
        trafast: data.route[selectedOption]
      }
    };
    
  } catch (error) {
    console.error('❌ 길찾기 API 오류:', error);
    console.error('❌ 오류 스택:', error.stack);
    throw error;
  }
};

export const apiService = {
  // ✅ 좌표 정규화 및 거리 계산 추가
  async getShelters(bounds, currentLocation) {
    try {
      console.log('📄 대피소 API 호출 시작');
      console.log('📍 요청 좌표:', bounds);
      
      const params = new URLSearchParams({
        startLot: bounds.startLot,
        endLot: bounds.endLot,
        startLat: bounds.startLat,
        endLat: bounds.endLat
      });

      const url = `${API_BASE_URL}/shelter_router/get_shelter?${params}`;
      console.log('📡 API URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📥 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 서버 에러 응답:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const text = await response.text();
      console.log('📄 응답 길이:', text.length);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        console.error('받은 텍스트:', text.substring(0, 200));
        return [];
      }

      if (!Array.isArray(data)) {
        console.warn('⚠️ 응답이 배열이 아님:', typeof data);
        console.warn('데이터 내용:', data);
        return [];
      }

      console.log(`✅ ${data.length}개 대피소 수신`);
      
      // ✅ 좌표 정규화 및 변환
      data = data.map((shelter, index) => {
        // 여러 필드명 시도 (latitude, lat, LAT, y 등)
        const latValue = shelter.latitude || shelter.lat || shelter.LAT || shelter.y;
        const lngValue = shelter.longitude || shelter.lng || shelter.LOT || shelter.lon || shelter.x;
        
        // 문자열을 숫자로 변환
        const latitude = parseFloat(latValue);
        const longitude = parseFloat(lngValue);
        
        // 디버그 로그 (처음 3개만)
        if (index < 3) {
          console.log(`  대피소[${index}] "${shelter.REARE_NM}":`, {
            원본: { latValue, lngValue },
            변환: { latitude, longitude },
            유효: !isNaN(latitude) && !isNaN(longitude)
          });
        }
        
        return {
          ...shelter,
          // 표준 필드명으로 통일
          latitude,
          longitude
        };
      });
      
      // 유효하지 않은 좌표 필터링
      const beforeCount = data.length;
      const validData = data.filter(shelter => {
        const isValid = !isNaN(shelter.latitude) && 
                       !isNaN(shelter.longitude) &&
                       shelter.latitude !== 0 &&
                       shelter.longitude !== 0 &&
                       shelter.latitude >= 33 &&  // 대한민국 남단
                       shelter.latitude <= 39 &&  // 대한민국 북단
                       shelter.longitude >= 124 && // 대한민국 서단
                       shelter.longitude <= 132;   // 대한민국 동단
        
        if (!isValid) {
          console.warn(`⚠️ 유효하지 않은 좌표 필터링: ${shelter.REARE_NM}`, {
            lat: shelter.latitude,
            lng: shelter.longitude
          });
        }
        
        return isValid;
      });
      
      console.log(`✅ 좌표 검증 완료: ${validData.length}/${beforeCount}개 유효`);
      
      const uniqueShelters = [];
      const seenNames = new Set();

      validData.forEach(item => {
        // 중복 판단 기준: "대피소 이름" (REARE_NM)
        // 만약 이름이 없으면 주소(RONA_DADDR)를 기준으로 함
        const uniqueKey = (item.REARE_NM || item.RONA_DADDR || '').trim();

        if (uniqueKey && !seenNames.has(uniqueKey)) {
          seenNames.add(uniqueKey);
          uniqueShelters.push(item);
        } else {
          // 중복된 데이터 로그 확인 (필요시 주석 해제)
          // console.log('🧹 중복 제거됨:', item.REARE_NM);
        }
      });

      console.log(`📉 중복 제거 후 데이터: ${validData.length}개 -> ${uniqueShelters.length}개`);
      
      // 이제 validData 대신 uniqueShelters를 사용합니다.
      const finalData = uniqueShelters;

      if (finalData.length === 0) {
        console.warn('⚠️ 유효한 대피소가 없습니다!');
        return [];
      }
      
      // ✅ 현재 위치가 있으면 거리 계산 (finalData 사용)
      if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
        // ... (거리 계산 로직 동일, 대상만 validData -> finalData로 변경)
        finalData.forEach((shelter, index) => {
             // ... 거리 계산 코드 ...
             const distance = utils.calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                shelter.latitude,
                shelter.longitude
              );
              shelter.distance = distance;
        });
        
        // 거리순 정렬
        finalData.sort((a, b) => a.distance - b.distance);
      }
      
      return finalData;
      
    } catch (error) {
      console.error('❌ 대피소 API 오류:', error);
      throw error;
    }
  },

  async searchAddress(query) {
    try {
      if (!query || !query.trim()) {
        throw new Error('검색어를 입력해주세요');
      }

      console.log(`🔍 주소 검색 요청: ${query}`);
      const encodedQuery = encodeURIComponent(query);

      // 방법 1: apiRequest 헬퍼 사용 (추천)
      // const data = await apiRequest(`${API_ENDPOINTS.MAP.COORDINATES}?address=${encodedQuery}`);

      // 방법 2: 직접 fetch 사용 (현재 파일 스타일 유지)
      const url = `${API_BASE_URL}/map/coordinates?address=${encodedQuery}`;
      const response = await fetchWithTimeout(url);
      const data = await response.json();

      // 백엔드 응답 구조(naver_map_router.py)에 따른 처리
      // 성공 시: { success: true, latitude: ..., longitude: ..., address: ... }
      if (data.success) {
        console.log('✅ 검색 성공:', data.address);
        
        // 여러 결과가 있는 경우 (백엔드 로직에 따라 다름)
        if (data.multiple_results) {
             return {
                 isSuccess: true,
                 data: data.results, // 결과 리스트
                 recommended: data.recommended, // 추천 결과
                 type: 'multiple'
             };
        }

        // 단일 결과
        return {
          isSuccess: true,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          address: data.address,
          title: data.title || query,
          type: 'single'
        };
      } else {
        // 실패 시
        console.warn('❌ 검색 결과 없음:', data.error);
        return {
          isSuccess: false,
          message: data.error || '검색 결과가 없습니다.'
        };
      }

    } catch (error) {
      console.error('❌ 주소 검색 API 오류:', error);
      // 에러를 던지지 않고 실패 객체를 반환하여 UI에서 처리
      return {
        isSuccess: false,
        message: '검색 중 오류가 발생했습니다.'
      };
    }
  },

  // ============================================
  // 🆕 뉴스 API - 지역별 조회 전용
  // ============================================

  /**
   * 🔹 지역별 뉴스 조회 (DB 연동)
   * 백엔드의 /return_news_by_region 라우터와 1:1 연결됩니다.
   * @param {string} region - 조회할 지역명 (예: '서울', '부산')
   */
  async getNewsByRegion(region) {
    try {
      if (!region || region === '전체') return [];

      console.log(`📰 DB 지역 뉴스 요청: ${region}`);
      const encodedRegion = encodeURIComponent(region);
      
      // 1. 1차 시도: 해당 지역명으로 조회
      const url = `${API_BASE_URL}/news_router/return_news_by_region?region=${encodedRegion}`;
      
      const response = await fetchWithTimeout(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      // 🚨 [수정 포인트] 여기서 const로 선언된 변수는 값을 못 바꿉니다.
      // 일단 1차 결과를 받습니다.
      const initialNews = data.news || [];

      // 데이터가 있으면 바로 반환!
      if (initialNews.length > 0) {
        console.log(`✅ ${region} 뉴스 조회 성공: ${initialNews.length}개`);
        return initialNews;
      }

      // 2. 데이터가 0개면 비상 대책 실행 (Fallback)
      console.log(`⚠️ '${region}' 데이터 없음 -> '분류 미지정' 데이터에서 검색 시도`);
      
      const fallbackUrl = `${API_BASE_URL}/news_router/return_news_by_region?region=${encodeURIComponent('분류 미지정')}`;
      const fallbackRes = await fetchWithTimeout(fallbackUrl);
      
      if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const unclassifiedNews = fallbackData.news || [];
          
          // 🚨 [수정 포인트] newsList에 덮어쓰지 않고 새로운 변수(filteredNews)에 담습니다.
          const filteredNews = unclassifiedNews.filter(item => {
              const title = item.YNA_TTL || '';
              const content = item.YNA_CN || '';
              return title.includes(region) || content.includes(region);
          });
          
          console.log(`✅ 비상 검색 결과: ${filteredNews.length}개 발견`);
          return filteredNews;
      }

      return [];

    } catch (error) {
      console.error(`❌ ${region} 뉴스 조회 실패:`, error);
      return [];
    }
  },

  /**
   * 📍 [메인용] 내 위치 기반 뉴스 조회
   */
  async getNewsMyLocation(location) {
    try {
      // 1. 내 좌표 -> 지역명 변환 (예: '경남')
      const regionName = utils.detectRegionFromLocation(location);
      console.log(`📍 내 위치 지역 감지: ${regionName}`);
      
      // 2. 변환된 지역명으로 DB 조회
      return await this.getNewsByRegion(regionName);
    } catch (error) {
      console.error('❌ 내 위치 뉴스 오류:', error);
      return [];
    }
  },

  async getNews(region) {
    return await this.getNewsByRegion(region);
  },

  async getDisasterMap() {
    try {
      console.log('🗺️ 재난 지도 현황 데이터 조회 시작');
      
      // apiConfig에 추가한 경로와 일치시킵니다.
      const url = `${API_BASE_URL}/message_router/disasters/filter`;
      console.log('📡 API URL:', url);

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 재난 지도 API 오류:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ 재난 지도 데이터 수신 완료 (총 ${data.total_count}건)`);
      
      return data; // { regions: [...], total_count: N, ... }

    } catch (error) {
      console.error('❌ 재난 지도 데이터 조회 실패:', error);
      // 실패 시 빈 데이터 구조 반환하여 앱이 죽지 않도록 함
      return { regions: [], total_count: 0 };
    }
  },

  clearCache() {
    cache.news = null;
    cache.newsTimestamp = null;
    console.log('🗑️ 뉴스 캐시 초기화');
  }
};

export const utils = {
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

  formatDistance: (distance) => {
    if (!distance && distance !== 0) return '거리 정보 없음';
    
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  },

  formatDuration: (duration) => {
    if (!duration) return '시간 정보 없음';
    
    const minutes = Math.round(duration / 60000);
    
    if (minutes < 60) {
      return `${minutes}분`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
  },

  detectRegionFromLocation(location) {
    if (!location) return '전체';
    
    const { latitude, longitude } = location;
    
    if (latitude >= 37.4 && latitude <= 37.7 && longitude >= 126.7 && longitude <= 127.2) return '서울';
    if (latitude >= 35.0 && latitude <= 35.4 && longitude >= 128.8 && longitude <= 129.3) return '부산';
    if (latitude >= 35.7 && latitude <= 36.0 && longitude >= 128.4 && longitude <= 128.8) return '대구';
    if (latitude >= 37.3 && latitude <= 37.6 && longitude >= 126.3 && longitude <= 126.9) return '인천';
    if (latitude >= 35.0 && latitude <= 35.3 && longitude >= 126.7 && longitude <= 127.0) return '광주';
    if (latitude >= 36.2 && latitude <= 36.5 && longitude >= 127.2 && longitude <= 127.6) return '대전';
    if (latitude >= 35.4 && latitude <= 35.7 && longitude >= 129.1 && longitude <= 129.5) return '울산';
    if (latitude >= 36.4 && latitude <= 36.7 && longitude >= 127.2 && longitude <= 127.4) return '세종';
    if (latitude >= 37.0 && latitude <= 38.0 && longitude >= 126.5 && longitude <= 127.5) return '경기';
    if (latitude >= 37.0 && latitude <= 38.5 && longitude >= 127.5 && longitude <= 129.5) return '강원';
    if (latitude >= 36.3 && latitude <= 37.2 && longitude >= 127.3 && longitude <= 128.5) return '충북';
    if (latitude >= 36.0 && latitude <= 36.9 && longitude >= 126.2 && longitude <= 127.5) return '충남';
    if (latitude >= 35.5 && latitude <= 36.2 && longitude >= 126.5 && longitude <= 127.7) return '전북';
    if (latitude >= 34.2 && latitude <= 35.5 && longitude >= 126.0 && longitude <= 127.8) return '전남';
    if (latitude >= 35.8 && latitude <= 37.2 && longitude >= 128.2 && longitude <= 129.6) return '경북';
    if (latitude >= 34.7 && latitude <= 35.9 && longitude >= 127.5 && longitude <= 129.5) return '경남';
    if (latitude >= 33.0 && latitude <= 33.7 && longitude >= 126.0 && longitude <= 127.0) return '제주';
    
    return '전체';
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c * 1000;
    
    return Math.round(distance);
  }
};

export default {
  apiService,
  getDirections,
  utils
};