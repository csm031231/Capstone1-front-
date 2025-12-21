// src/services/chatbotService.js
import { apiRequest, API_ENDPOINTS } from './apiConfig'; // ✅ 상대 경로 수정

class ChatbotService {

  async askChatbot(message, userLocation = null) {
    try {
      console.log('기본 챗봇 API 요청:', API_ENDPOINTS.CHATBOT.ASK);
      
      const response = await apiRequest(API_ENDPOINTS.CHATBOT.ASK, {
        method: 'POST',
        body: JSON.stringify({
          message: message,
          user_location: userLocation
        }),
        skipAuth: true
      });
      
      return {
        success: true,
        response: response.response,
        sources: response.sources || [],
        category: response.category,
        is_emergency: response.is_emergency || false,
        timestamp: response.timestamp
      };
      
    } catch (error) {
      console.error('챗봇 질문 실패:', error);
      return this.generateOfflineResponse(message);
    }
  }

  // ✅ askSmartChatbot을 askChatbot을 호출하도록 변경 (백엔드 엔드포인트 통일)
  async askSmartChatbot(message, userLocation = null) {
    console.log('스마트 챗봇 API 요청을 기본 챗봇으로 리디렉션');
    // 백엔드에 /ask-smart 엔드포인트가 없으므로, 기본 /ask 엔드포인트를 사용하도록 askChatbot을 호출
    return this.askChatbot(message, userLocation);
  }

  async getHealthStatus() {
    try {
      const response = await apiRequest(API_ENDPOINTS.CHATBOT.HEALTH, { skipAuth: true });
      return response;
    } catch (error) {
      console.error('챗봇 상태 확인 실패:', error);
      return {
        status: "unhealthy",
        message: "챗봇 서비스 연결 실패",
        vector_enabled: false,
        vector_service_loaded: false
      };
    }
  }

  async getSupportedCategories() {
    try {
      const response = await apiRequest(API_ENDPOINTS.CHATBOT.CATEGORIES, { skipAuth: true });
      return response.categories || {};
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      return {
        "01001": "태풍", "01002": "호우", "01003": "홍수", "01004": "대설",
        "01005": "한파", "01006": "뇌전", "01007": "폭풍", "01008": "황사",
        "01009": "해일", "01010": "가뭄", "01011": "지진", "01012": "지진해일",
        "01013": "화산폭발", "01014": "산사태", "01015": "산불", "01016": "폭염"
      };
    }
  }

  analyzeMessageType(message) {
    const messageLower = message.toLowerCase();
    
    const emergencyKeywords = ['응급', '위급', '다쳐', '부상', '의식', '호흡', '심장', '출혈', '화재', '가스', '붕괴'];
    const disasterKeywords = ['지진', '태풍', '폭염', '호우', '홍수', '대설', '한파', '산불'];
    
    const hasEmergency = emergencyKeywords.some(keyword => messageLower.includes(keyword));
    const hasDisaster = disasterKeywords.some(keyword => messageLower.includes(keyword));
    
    return {
      isEmergency: hasEmergency,
      isDisasterRelated: hasDisaster,
      type: hasEmergency ? 'emergency' : hasDisaster ? 'disaster' : 'general'
    };
  }

  generateOfflineResponse(message) {
    const analysis = this.analyzeMessageType(message);
    
    if (analysis.isEmergency) {
      return {
        success: true,
        response: "긴급상황입니다! 즉시 119에 신고하세요.\n\n119: 화재, 구조, 응급의료\n112: 신고, 수사\n\n안전한 곳으로 대피하고 전문가의 도움을 받으시기 바랍니다.",
        sources: [],
        category: 'emergency',
        is_emergency: true,
        timestamp: new Date().toISOString()
      };
    }
    
    if (analysis.isDisasterRelated) {
      return this.getBasicDisasterAdvice(message);
    }
    
    return {
      success: true,
      response: "🤖 저는 재난안전과 관련된 질문에만 답변할 수 있습니다. 지진, 태풍, 폭염 등 재난 상황에 대한 행동요령이나 안전 정보가 필요하시면 언제든 물어보세요.",
      sources: [],
      category: null,
      is_emergency: false,
      timestamp: new Date().toISOString()
    };
  }

  getBasicDisasterAdvice(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('지진')) {
      return {
        success: true,
        response: "🏗️ 지진 발생 시 행동요령:\n\n1️⃣ 즉시 튼튼한 테이블 아래로 몸을 피하세요\n2️⃣ 문과 창문을 열어 출구를 확보하세요\n3️⃣ 가스와 전기를 차단하세요\n4️⃣ 엘리베이터 사용을 금지하고 계단을 이용하세요\n5️⃣ 야외에서는 건물과 전선에서 멀리 떨어지세요",
        sources: [],
        category: '지진',
        is_emergency: false,
        timestamp: new Date().toISOString()
      };
    } else if (messageLower.includes('화재')) {
      return {
        success: true,
        response: "🔥 화재 발생 시 행동요령:\n\n1️⃣ 119에 즉시 신고하세요\n2️⃣ 낮은 자세로 연기를 피해 대피하세요\n3️⃣ 젖은 수건으로 코와 입을 막으세요\n4️⃣ 엘리베이터 사용 금지, 계단 이용\n5️⃣ 옷에 불이 붙으면 바닥에 누워 굴러주세요",
        sources: [],
        category: '화재',
        is_emergency: false,
        timestamp: new Date().toISOString()
      };
    } else if (messageLower.includes('태풍') || messageLower.includes('홍수')) {
      return {
        success: true,
        response: "🌊 태풍/홍수 대비 행동요령:\n\n1️⃣ 저지대, 상습침수지역 피하기\n2️⃣ 실외 간판, 현수막 등 점검\n3️⃣ 하천 근처 접근 금지\n4️⃣ 지하공간 이용 자제\n5️⃣ 응급용품 사전 준비",
        sources: [],
        category: '태풍',
        is_emergency: false,
        timestamp: new Date().toISOString()
      };
    } else if (messageLower.includes('폭염')) {
      return {
        success: true,
        response: "🌡️ 폭염 대비 행동요령:\n\n1️⃣ 12~17시 사이 외출 자제\n2️⃣ 충분한 수분 섭취\n3️⃣ 시원하고 통풍이 잘 되는 곳에 머무르기\n4️⃣ 헐렁하고 밝은 색 옷 착용\n5️⃣ 온열질환 증상에 주의",
        sources: [],
        category: '폭염',
        is_emergency: false,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      response: "🤖 더 구체적인 재난 상황을 말씀해 주시면 정확한 행동요령을 안내해드릴게요!",
      sources: [],
      category: null,
      is_emergency: false,
      timestamp: new Date().toISOString()
    };
  }
}

export default new ChatbotService();