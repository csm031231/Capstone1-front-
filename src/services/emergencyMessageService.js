// src/services/emergencyMessageService.js
import { apiRequest, API_ENDPOINTS } from './apiConfig';

class EmergencyMessageService {
  
  async getEmergencyMessages(regionName = '김해시') {
    try {
      const baseEndpoint = API_ENDPOINTS.EMERGENCY.MESSAGES;
      if (!baseEndpoint) {
          throw new Error("API_ENDPOINTS.EMERGENCY.MESSAGES가 정의되지 않았습니다.");
      }

      // 1. URLSearchParams를 사용하여 regionName을 쿼리 파라미터로 변환합니다.
      const queryParams = new URLSearchParams({
          rgnNm: regionName 
      }).toString();

      // 2. 쿼리 파라미터가 포함된 최종 엔드포인트를 생성합니다. (백엔드 요구사항: POST + Query)
      const endpoint = `${baseEndpoint}?${queryParams}`;
      
      console.log('재난문자 API 요청 (POST - Query Parameter ONLY):', endpoint);
      
      // 3. POST 요청을 유지하되, body 옵션과 Content-Type 헤더를 완전히 제거합니다.
      // (FastAPI가 빈 본문 때문에 422 오류를 발생시키는 것을 방지합니다.)
      const response = await apiRequest(endpoint, {
        method: 'POST', 
        skipAuth: true
      });
      
      let messages = [];
      
      // 응답 구조 파싱 (정부 API 응답 형식)
      if (response && response.body && Array.isArray(response.body)) {
        messages = response.body.map((item, index) => ({
          id: index + 1,
          title: `[재난문자] ${item.MSG_CN ? item.MSG_CN.substring(0, 50) + '...' : '재난문자'}`,
          content: item.MSG_CN || '내용 없음',
          category: this.categorizeMessage(item.MSG_CN),
          severity: this.getSeverity(item.MSG_CN),
          location: item.RGN_NM || item.RCPTN_RGN_NM || regionName,
          time: this.formatTime(item.CRT_DT),
          timestamp: item.CRT_DT,
          isRead: false,
          messageId: item.SN || `msg_${index}`,
          sendDate: item.REG_YMD || item.DSSTR_SE_NM || '',
          disasterType: item.EMRG_STEP_NM || item.EMRGNCY_STEP_NM || item.DST_SE_NM || ''
        }));
      } 
      // 배열 형식의 응답 (이전 버전 대응)
      else if (response && Array.isArray(response)) {
        messages = response.map((item, index) => ({
          id: index + 1,
          title: `[재난문자] ${item.MSG_CN ? item.MSG_CN.substring(0, 50) + '...' : '재난문자'}`,
          content: item.MSG_CN || '내용 없음',
          category: this.categorizeMessage(item.MSG_CN),
          severity: this.getSeverity(item.MSG_CN),
          location: item.RGN_NM || item.RCPTN_RGN_NM || regionName,
          time: this.formatTime(item.CRT_DT),
          timestamp: item.CRT_DT,
          isRead: false,
          messageId: item.SN || `msg_${index}`,
          sendDate: item.REG_YMD || item.DSSTR_SE_NM || '',
          disasterType: item.EMRG_STEP_NM || item.EMRGNCY_STEP_NM || item.DST_SE_NM || ''
        }));
      } 
      // 데이터가 없는 경우 (❌ 목업 메시지 호출 대신 빈 배열 반환)
      else {
        console.log('재난문자 데이터 없음. 빈 목록을 반환합니다.');
        return {
          success: true,
          totalCount: 0,
          messages: [] // 빈 배열 반환
        };
      }
      
      return {
        success: true,
        totalCount: messages.length,
        messages: messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      };
      
    } catch (error) {
      console.error('재난문자 조회 실패:', error);
      // ❌ 오류 발생 시에도 목업 대신 빈 배열 반환
      return {
        success: false,
        totalCount: 0,
        messages: []
      };
    }
  }

  // getRandomEmergencyMessage 함수 제거됨

  categorizeMessage(content) {
    if (!content) return 'other';
    
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('호우') || contentLower.includes('비') || contentLower.includes('강우') || contentLower.includes('태풍') || contentLower.includes('바람')) {
      return 'weather';
    } else if (contentLower.includes('지진')) {
      return 'earthquake';
    } else if (contentLower.includes('화재') || contentLower.includes('불')) {
      return 'fire';
    } else if (contentLower.includes('홍수') || contentLower.includes('침수')) {
      return 'flood';
    } else {
      return 'other';
    }
  }

  getSeverity(content) {
    if (!content) return 'info';
    
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('긴급') || contentLower.includes('즉시') || contentLower.includes('위험')) {
      return 'emergency';
    } else if (contentLower.includes('경보') || contentLower.includes('주의') || contentLower.includes('대피')) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  formatTime(timestamp) {
    if (!timestamp) return '시간 정보 없음';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 60) {
        return `${diffMins}분 전`;
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
      } else {
        return `${diffDays}일 전`;
      }
    } catch (error) {
      return '시간 정보 없음';
    }
  }
  
  // 💡 getMockMessages 함수는 더 이상 사용되지 않으므로 삭제하거나 유지할 수 있습니다.
  // 여기서는 안전하게 유지하되, 호출되지 않도록 했습니다.
  getMockMessages() {
    return {
      success: true,
      totalCount: 3,
      messages: [
        {
          id: 1,
          title: '[긴급재난문자] 호우 경보 발령 (목업)',
          content: '김해시에 호우경보가 발령되었습니다. 저지대 및 상습침수지역 주민들은 안전한 곳으로 대피하시기 바랍니다.',
          category: 'weather',
          severity: 'warning',
          location: '경남 김해시',
          time: '2시간 전',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          messageId: 'mock_1'
        },
        {
          id: 2,
          title: '[재난문자] 정전 안내 (목업)',
          content: '김해시 장유면 일대에 정전이 발생했습니다. 복구 예상시간은 오후 6시경입니다.',
          category: 'other',
          severity: 'info',
          location: '김해시 장유면',
          time: '5시간 전',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          messageId: 'mock_2'
        },
        {
          id: 3,
          title: '[재난문자] 강풍 주의보 (목업)',
          content: '경남 전 지역에 강풍주의보가 발령되었습니다. 외출을 자제하시고 낙하물에 주의하시기 바랍니다.',
          category: 'weather',
          severity: 'warning',
          location: '경남 전체',
          time: '1일 전',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          messageId: 'mock_3'
        }
      ]
    };
  }

  async getMessageDetail(messageId) {
    try {
      const response = await apiRequest(`${API_ENDPOINTS.EMERGENCY.DETAIL}/${messageId}`, {
        method: 'GET',
        skipAuth: true
      });
      
      return {
        success: true,
        message: response
      };
    } catch (error) {
      console.error('메시지 상세 조회 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRegions() {
    try {
      const baseEndpoint = API_ENDPOINTS.EMERGENCY.REGIONS;
      if (!baseEndpoint) {
          throw new Error("API_ENDPOINTS.EMERGENCY.REGIONS가 정의되지 않았습니다.");
      }

      const response = await apiRequest(baseEndpoint, {
        method: 'GET',
        skipAuth: true
      });
      
      return {
        success: true,
        regions: response.regions || []
      };
    } catch (error) {
      console.error('지역 목록 조회 실패:', error);
      return {
        success: true,
        regions: ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도']
      };
    }
  }
}

export default new EmergencyMessageService();