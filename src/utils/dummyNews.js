// src/utils/dummyNews.js

/**
 * 🎭 더미 뉴스 데이터 생성 유틸리티
 * API 연동 전 UI 개발 및 테스트용
 */

// 고정된 더미 뉴스 데이터
export const FIXED_DUMMY_NEWS = [
    {
      YNA_NO: 1,
      YNA_TTL: '김해시, 태풍 대비 긴급 안전점검 실시',
      YNA_CN: '김해시는 다가오는 태풍에 대비하여 관내 주요 시설물과 재난 취약지역에 대한 긴급 안전점검을 실시한다고 밝혔습니다. 특히 하천변과 저지대, 노후주택 밀집지역을 중점적으로 점검할 예정입니다.',
      YNA_YMD: new Date(Date.now() - 2 * 3600000).toISOString(), // 2시간 전
      YNA_WRTR_NM: '김해시청',
      region: '김해',
      image_url: null
    },
    {
      YNA_NO: 2,
      YNA_TTL: '부산 해운대구, 집중호우 대비 배수펌프장 24시간 가동',
      YNA_CN: '부산 해운대구는 집중호우에 대비해 관내 모든 배수펌프장을 24시간 가동한다고 발표했습니다. 또한 긴급 대응팀을 편성하여 침수 우려 지역을 상시 순찰할 예정입니다.',
      YNA_YMD: new Date(Date.now() - 5 * 3600000).toISOString(), // 5시간 전
      YNA_WRTR_NM: '해운대구청',
      region: '부산',
      image_url: null
    },
    {
      YNA_NO: 3,
      YNA_TTL: '경남도, 산불 예방 특별대책 기간 운영',
      YNA_CN: '경남도는 건조한 날씨가 계속됨에 따라 대형 산불 발생을 예방하기 위해 특별대책 기간을 운영합니다. 입산 통제와 함께 산림 취약지역 집중 관리를 실시합니다.',
      YNA_YMD: new Date(Date.now() - 1 * 86400000).toISOString(), // 1일 전
      YNA_WRTR_NM: '경남도청',
      region: '경남',
      image_url: null
    },
    {
      YNA_NO: 4,
      YNA_TTL: '창원시, 지진 대피 훈련 실시... 시민 참여 당부',
      YNA_CN: '창원시는 다음 주 수요일 오후 2시 지진 대피 훈련을 실시합니다. 시민들은 훈련 방송이 나오면 책상 아래로 대피하거나 안전한 장소로 이동해주시기 바랍니다.',
      YNA_YMD: new Date(Date.now() - 1 * 86400000 - 6 * 3600000).toISOString(), // 1일 6시간 전
      YNA_WRTR_NM: '창원시청',
      region: '창원',
      image_url: null
    },
    {
      YNA_NO: 5,
      YNA_TTL: '김해 장유신도시, 정전 사고 발생... 긴급 복구 중',
      YNA_CN: '오늘 오전 10시경 김해 장유신도시 일대에 정전이 발생했습니다. 한국전력은 긴급 복구팀을 투입하여 현재 복구 작업을 진행 중이며, 오후 3시경 전력 공급이 재개될 예정입니다.',
      YNA_YMD: new Date(Date.now() - 2 * 86400000).toISOString(), // 2일 전
      YNA_WRTR_NM: '한국전력 김해지사',
      region: '김해',
      image_url: null
    },
    {
      YNA_NO: 6,
      YNA_TTL: '부산 지하철 2호선, 신호 장애로 운행 지연',
      YNA_CN: '부산 지하철 2호선에서 신호 장애가 발생하여 현재 일부 구간에서 운행이 지연되고 있습니다. 부산교통공사는 대체 교통편을 안내하고 있으며, 빠른 시일 내 정상 운행을 재개할 예정입니다.',
      YNA_YMD: new Date(Date.now() - 3 * 86400000).toISOString(), // 3일 전
      YNA_WRTR_NM: '부산교통공사',
      region: '부산',
      image_url: null
    },
    {
      YNA_NO: 7,
      YNA_TTL: '서울시, 폭염 특보... 온열질환 주의 당부',
      YNA_CN: '서울시는 내일부터 폭염 특보가 발효될 것으로 예상됨에 따라 시민들의 온열질환 예방에 각별한 주의를 당부했습니다. 무더위 쉼터를 24시간 운영합니다.',
      YNA_YMD: new Date(Date.now() - 4 * 86400000).toISOString(), // 4일 전
      YNA_WRTR_NM: '서울시청',
      region: '서울',
      image_url: null
    },
    {
      YNA_NO: 8,
      YNA_TTL: '전국 소방서, 119 구급차 긴급출동 훈련',
      YNA_CN: '전국 소방서에서 동시에 119 구급차 긴급출동 훈련을 실시합니다. 골든타임 확보를 위한 신속한 출동 체계를 점검하고 개선방안을 마련할 예정입니다.',
      YNA_YMD: new Date(Date.now() - 5 * 86400000).toISOString(), // 5일 전
      YNA_WRTR_NM: '소방청',
      region: '전국',
      image_url: null
    },
    {
      YNA_NO: 9,
      YNA_TTL: '인천 국제공항, 강풍으로 일부 항공편 결항',
      YNA_CN: '강풍의 영향으로 인천 국제공항에서 일부 항공편이 결항되었습니다. 공항공사는 여행객들에게 출발 전 항공사에 운항 여부를 확인할 것을 당부했습니다.',
      YNA_YMD: new Date(Date.now() - 6 * 86400000).toISOString(), // 6일 전
      YNA_WRTR_NM: '인천국제공항공사',
      region: '인천',
      image_url: null
    },
    {
      YNA_NO: 10,
      YNA_TTL: '대구시, 미세먼지 비상저감조치 발령',
      YNA_CN: '대구시는 고농도 미세먼지가 예상됨에 따라 비상저감조치를 발령했습니다. 차량 2부제와 공공기관 주차장 폐쇄 등의 조치가 시행되며, 시민들의 협조를 당부했습니다.',
      YNA_YMD: new Date(Date.now() - 7 * 86400000).toISOString(), // 7일 전
      YNA_WRTR_NM: '대구시청',
      region: '대구',
      image_url: null
    },
  ];
  
  // 랜덤 더미 뉴스 생성 함수
  export const generateRandomNews = (count = 20) => {
    const regions = ['김해', '부산', '창원', '경남', '서울', '인천', '대구', '광주', '대전', '전국'];
    
    const titleTemplates = [
      '{region} {event} 발생... {action}',
      '{region}, {event} 대비 {action}',
      '{region} {facility} {event}',
      '{event} 특보, {region} {action}',
      '{region} {department}, {event} {action}',
    ];
    
    const events = [
      '태풍', '집중호우', '폭염', '한파', '대설', '강풍', '지진',
      '산불', '정전', '가스누출', '화재', '교통사고', '침수'
    ];
    
    const actions = [
      '긴급 점검 실시', '특별 대책 마련', '주민 대피 완료',
      '24시간 비상 근무', '안전 교육 실시', '복구 작업 진행',
      '주의보 발령', '경보 해제', '훈련 실시'
    ];
    
    const facilities = [
      '소방서', '시청', '구청', '도청', '교통공사', '전력공사',
      '가스공사', '상수도본부', '환경관리공단'
    ];
    
    const departments = [
      '재난안전본부', '소방본부', '환경과', '안전관리과',
      '재난관리과', '도시안전과', '위기관리과'
    ];
  
    const contentTemplates = [
      '{region}는 {event}에 대비하여 관내 주요 시설물과 재난 취약지역에 대한 긴급 안전점검을 실시한다고 밝혔습니다.',
      '{region}는 {event} 발생으로 인한 피해를 최소화하기 위해 특별 대책반을 운영하고 있습니다.',
      '{region} {department}는 {event} 대응을 위해 24시간 비상근무 체제를 가동하고 있습니다.',
      '{region}에서 발생한 {event}로 인해 일부 지역에서 불편이 예상되며, 시민들의 양해를 구합니다.',
    ];
  
    return Array.from({ length: count }, (_, i) => {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const event = events[Math.floor(Math.random() * events.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const facility = facilities[Math.floor(Math.random() * facilities.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      
      const titleTemplate = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
      const contentTemplate = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
      
      const title = titleTemplate
        .replace('{region}', region)
        .replace('{event}', event)
        .replace('{action}', action)
        .replace('{facility}', facility)
        .replace('{department}', department);
      
      const content = contentTemplate
        .replace(/{region}/g, region)
        .replace(/{event}/g, event)
        .replace(/{department}/g, department);
      
      const writers = [`${region}시청`, `${region}소방서`, `${region}${department}`, `${region}${facility}`];
      
      return {
        YNA_NO: i + 1,
        YNA_TTL: title,
        YNA_CN: content,
        YNA_YMD: new Date(Date.now() - i * 3600000 * 2).toISOString(), // 2시간씩 차이
        YNA_WRTR_NM: writers[Math.floor(Math.random() * writers.length)],
        region: region,
        image_url: null
      };
    });
  };
  
  // 지역별 뉴스 필터링
  export const filterNewsByRegion = (news, region) => {
    if (region === '전체') return news;
    return news.filter(item => item.region === region);
  };
  
  // 날짜별 뉴스 필터링
  export const filterNewsByDate = (news, days) => {
    const cutoffDate = Date.now() - days * 86400000;
    return news.filter(item => new Date(item.YNA_YMD).getTime() > cutoffDate);
  };
  
  // Mock API 호출 시뮬레이션
  export const mockFetchNews = (region = null, delay = 1000) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allNews = FIXED_DUMMY_NEWS;
        const filtered = region && region !== '전체' 
          ? filterNewsByRegion(allNews, region)
          : allNews;
        
        resolve(filtered);
      }, delay);
    });
  };
  
  // 에러 시뮬레이션
  export const mockFetchNewsWithError = () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('네트워크 오류가 발생했습니다'));
      }, 1000);
    });
  };
  
  export default {
    FIXED_DUMMY_NEWS,
    generateRandomNews,
    filterNewsByRegion,
    filterNewsByDate,
    mockFetchNews,
    mockFetchNewsWithError,
  };