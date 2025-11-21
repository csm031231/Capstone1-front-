// src/services/ApiService.js - 전국 서비스 버전 (좌표 문제 자동 해결 + 뉴스 완전 연동)

const API_BASE_URL = 'http://192.168.0.16:8000';

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
      
      if (validData.length === 0) {
        console.warn('⚠️ 유효한 대피소가 없습니다!');
        return [];
      }
      
      // ✅ 현재 위치가 있으면 거리 계산
      if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
        console.log('📍 현재 위치:', currentLocation);
        
        validData.forEach((shelter, index) => {
          const distance = utils.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            shelter.latitude,
            shelter.longitude
          );
          shelter.distance = distance;
          
          // 처음 3개만 로그
          if (index < 3) {
            console.log(`  거리 계산[${index}] ${shelter.REARE_NM}: ${utils.formatDistance(distance)}`);
          }
        });
        
        // 거리순 정렬
        validData.sort((a, b) => a.distance - b.distance);
        console.log('✅ 거리순 정렬 완료');
      } else {
        console.log('⚠️ 현재 위치 없음 - 거리 계산 생략');
      }
      
      if (validData.length > 0) {
        // 1번째 데이터 로그 (항상 실행)
        console.log('✅ [1번째 대피소 샘플]:', {
          name: validData[0].REARE_NM,
          lat: validData[0].latitude,
          lng: validData[0].longitude,
          distance: validData[0].distance
        });
      
        // 2번째 데이터가 있는지 확인하고 로그
        if (validData.length > 1) {
          console.log('✅ [2번째 대피소 샘플]:', {
            name: validData[1].REARE_NM,
            lat: validData[1].latitude,
            lng: validData[1].longitude,
            distance: validData[1].distance
          });
        }
      
        // 3번째 데이터가 있는지 확인하고 로그
        if (validData.length > 2) {
          console.log('✅ [3번째 대피소 샘플]:', {
            name: validData[2].REARE_NM,
            lat: validData[2].latitude,
            lng: validData[2].longitude,
            distance: validData[2].distance
          });
        }
      } else {
        console.log('⚠️ 유효한 좌표를 가진 대피소 데이터가 없습니다.');
      }
      
      return validData;
      
    } catch (error) {
      console.error('❌ 대피소 API 오류:', error);
      throw error;
    }
  },

  // ============================================
  // 🆕 뉴스 API - 완전 연동 버전
  // ============================================

  /**
   * 🔹 외부 API에서 최신 뉴스 가져오기 (실시간 조회, DB 저장 안함)
   * @param {number} numRows - 가져올 뉴스 개수 (기본값: 10)
   * @returns {Promise<Array>} 뉴스 배열
   */
  async getNewsFromExternalApi(numRows = 10) {
    try {
      console.log('📰 외부 API에서 뉴스 조회 시작');
      
      const url = `${API_BASE_URL}/news_router/get_news?num_rows=${numRows}`;
      console.log('📡 API URL:', url);

      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📥 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 서버 에러:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // 응답 형식: { totalCount: 100, news: [...] }
      const newsList = data.news || [];
      console.log(`✅ ${newsList.length}개 뉴스 수신 (총 ${data.totalCount}개)`);
      
      return newsList;
      
    } catch (error) {
      console.error('❌ 외부 뉴스 API 오류:', error);
      throw error;
    }
  },

  /**
   * 🔹 DB에 저장된 뉴스 전체 조회
   * @returns {Promise<Array>} DB에 저장된 뉴스 배열
   */
  async getAllNewsFromDb() {
    try {
      console.log('📰 DB에서 전체 뉴스 조회');
      
      const url = `${API_BASE_URL}/news_router/return_news_by_region?region=전체`;
      console.log('📡 API URL:', url);

      const response = await fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // 응답 형식: { region: "전체", count: 10, news: [...] }
      const newsList = data.news || [];
      console.log(`✅ DB에서 ${newsList.length}개 뉴스 조회`);
      
      return newsList;
      
    } catch (error) {
      console.error('❌ DB 뉴스 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 🔹 지역별 뉴스 조회 (DB에서)
   * @param {string} region - 지역명 (예: '김해', '부산', '전체')
   * @returns {Promise<Array>} 해당 지역 뉴스 배열
   */
  async getNewsByRegion(region) {
    try {
      console.log(`📰 ${region} 지역 뉴스 조회`);
      
      const encodedRegion = encodeURIComponent(region);
      const url = `${API_BASE_URL}/news_router/return_news_by_region?region=${encodedRegion}`;
      console.log('📡 API URL:', url);

      const response = await fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const newsList = data.news || [];
      console.log(`✅ ${region} 지역 ${newsList.length}개 뉴스 조회`);
      
      return newsList;
      
    } catch (error) {
      console.error(`❌ ${region} 지역 뉴스 조회 오류:`, error);
      throw error;
    }
  },

  /**
   * 🔹 외부 API에서 뉴스 가져와서 DB에 일괄 저장
   * @returns {Promise<Object>} { message, created_count, skipped_count, results }
   */
  async bulkInsertNews() {
    try {
      console.log('💾 뉴스 일괄 저장 시작');
      
      const url = `${API_BASE_URL}/news_router/bulk_insert_news`;
      console.log('📡 API URL:', url);

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }, 30000); // 30초 타임아웃 (저장 작업이 오래 걸릴 수 있음)
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ 일괄 저장 완료: 생성 ${data.created_count}개, 스킵 ${data.skipped_count}개`);
      
      return data;
      
    } catch (error) {
      console.error('❌ 뉴스 일괄 저장 오류:', error);
      throw error;
    }
  },

  /**
   * 🔹 개별 뉴스 DB에 저장
   * @param {Object} newsData - 뉴스 데이터 객체
   * @returns {Promise<Object>} { news, created, message }
   */
  async insertNews(newsData) {
    try {
      console.log('💾 개별 뉴스 저장');
      
      const url = `${API_BASE_URL}/news_router/insert_newsdb`;
      
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ 뉴스 저장 완료: ${data.message}`);
      
      return data;
      
    } catch (error) {
      console.error('❌ 뉴스 저장 오류:', error);
      throw error;
    }
  },

  /**
   * 🔹 모든 뉴스 삭제
   * @returns {Promise<Object>} { message, deleted_count }
   */
  async deleteAllNews() {
    try {
      console.log('🗑️ 모든 뉴스 삭제');
      
      const url = `${API_BASE_URL}/news_router/delete_all_news`;
      
      const response = await fetchWithTimeout(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.deleted_count}개 뉴스 삭제 완료`);
      
      return data;
      
    } catch (error) {
      console.error('❌ 뉴스 삭제 오류:', error);
      throw error;
    }
  },

  /**
   * 🔹 외부 API에서 뉴스 가져오기 + DB 저장 + 반환 (통합 함수)
   * 가장 많이 사용될 함수 - 최신 뉴스를 가져와서 저장하고 반환
   * @param {number} numRows - 가져올 뉴스 개수
   * @returns {Promise<Array>} 저장 후 조회된 뉴스 배열
   */
  async fetchAndStoreNews(numRows = 10) {
    try {
      console.log('🔄 뉴스 가져오기 + 저장 시작');
      
      // 1. 외부 API에서 뉴스 가져와서 DB에 저장
      await this.bulkInsertNews();
      
      // 2. DB에서 저장된 뉴스 조회 (최신순)
      const news = await this.getAllNewsFromDb();
      
      console.log(`✅ 통합 작업 완료: ${news.length}개 뉴스`);
      return news;
      
    } catch (error) {
      console.error('❌ 뉴스 가져오기/저장 오류:', error);
      throw error;
    }
  },

  /**
   * 🔹 뉴스 조회 (캐시 사용, 하위 호환성 유지)
   * 기존 코드와의 호환성을 위해 유지
   * @param {string} region - 지역명 (선택사항)
   * @returns {Promise<Array>} 뉴스 배열
   */
  async getNews(region = null) {
    try {
      const now = Date.now();
      
      // 캐시 확인
      if (cache.news && cache.newsTimestamp && (now - cache.newsTimestamp < cache.CACHE_DURATION)) {
        console.log('📦 캐시된 뉴스 반환');
        
        if (region && region !== '전체') {
          return cache.news.filter(item => item.region === region);
        }
        return cache.news;
      }

      console.log('📄 뉴스 API 호출 (캐시 만료)');
      
      // 새 데이터 가져오기 (DB에서)
      let data;
      if (region && region !== '전체') {
        data = await this.getNewsByRegion(region);
      } else {
        data = await this.getAllNewsFromDb();
      }
      
      // 캐시 업데이트
      if (region === null || region === '전체') {
        cache.news = data;
        cache.newsTimestamp = now;
      }
      
      console.log(`✅ ${data.length}개 뉴스 수신`);
      return data;
      
    } catch (error) {
      console.error('❌ 뉴스 API 오류:', error);
      throw error;
    }
  },

  /**
   * 🔹 캐시 초기화
   */
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

  extractRegionFromNews(content) {
    if (!content) return '분류 미지정';
    
    const regions = [
      { name: '서울', keywords: ['서울', '서울시', '강남', '강북', '종로', '중구', '용산', '성동', '광진', '동대문', '중랑', '성북', '강북', '도봉', '노원', '은평', '서대문', '마포', '양천', '강서', '구로', '금천', '영등포', '동작', '관악', '서초', '강남', '송파', '강동'] },
      { name: '부산', keywords: ['부산', '부산시', '해운대', '서면', '광안리', '남포동', '중구', '서구', '동구', '영도', '부산진', '동래', '남구', '북구', '강서구', '연제', '수영', '사상', '기장'] },
      { name: '대구', keywords: ['대구', '대구시', '동성로', '중구', '동구', '서구', '남구', '북구', '수성', '달서', '달성'] },
      { name: '인천', keywords: ['인천', '인천시', '송도', '영종도', '중구', '동구', '미추홀', '연수', '남동', '부평', '계양', '서구', '강화', '옹진'] },
      { name: '광주', keywords: ['광주', '광주시', '동구', '서구', '남구', '북구', '광산'] },
      { name: '대전', keywords: ['대전', '대전시', '동구', '중구', '서구', '유성', '대덕'] },
      { name: '울산', keywords: ['울산', '울산시', '중구', '남구', '동구', '북구', '울주'] },
      { name: '세종', keywords: ['세종', '세종시', '세종특별자치시'] },
      { name: '경기', keywords: ['경기', '경기도', '수원', '성남', '고양', '용인', '부천', '안산', '안양', '남양주', '화성', '평택', '의정부', '시흥', '파주', '김포', '광명', '광주', '군포', '하남', '오산', '양주', '이천', '구리', '안성', '포천', '의왕', '여주', '양평', '동두천', '과천', '가평', '연천'] },
      { name: '강원', keywords: ['강원', '강원도', '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양'] },
      { name: '충북', keywords: ['충북', '충청북도', '청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양'] },
      { name: '충남', keywords: ['충남', '충청남도', '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안'] },
      { name: '전북', keywords: ['전북', '전라북도', '전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안'] },
      { name: '전남', keywords: ['전남', '전라남도', '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'] },
      { name: '경북', keywords: ['경북', '경상북도', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉'] },
      { name: '경남', keywords: ['경남', '경상남도', '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천'] },
      { name: '제주', keywords: ['제주', '제주도', '제주시', '서귀포'] },
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