// src/services/disasterActionService.js
import { apiRequest, API_ENDPOINTS } from './apiConfig';

class DisasterActionService {

  getMockActions() {
    return {
      success: true,
      items: [
        {
          id: 1,
          content: "지진이 발생하면 즉시 튼튼한 테이블 아래로 몸을 피하고, 문과 창문을 열어 출구를 확보하세요. 가스와 전기를 차단하고, 엘리베이터 사용을 금지하고 계단을 이용하세요.",
          url: "https://www.safetykorea.go.kr",
          category: "지진",
          detail_category: "실내 대피",
          title: "지진 발생시 기본 행동요령",
          category_code: "01011",
          category_name: "지진"
        },
        {
          id: 2,
          content: "화재 발생시 119에 즉시 신고하고, 낮은 자세로 연기를 피해 대피하세요. 젖은 수건으로 코와 입을 막고, 엘리베이터 사용을 금지하고 계단을 이용하세요.",
          url: "https://www.safetykorea.go.kr",
          category: "화재",
          detail_category: "초기 대응",
          title: "화재 발생시 대피 요령",
          category_code: "01014",
          category_name: "화재"
        },
        {
          id: 3,
          content: "태풍 발생시 저지대와 상습침수지역을 피하고, 실외 간판과 현수막 등을 점검하세요. 하천 근처 접근을 금지하고, 지하공간 이용을 자제하세요.",
          url: "https://www.safetykorea.go.kr",
          category: "태풍",
          detail_category: "사전 준비",
          title: "태풍 대비 행동요령",
          category_code: "01012",
          category_name: "태풍"
        },
        {
          id: 4,
          content: "폭염 발생시 오전 10시부터 오후 5시까지 야외활동을 자제하고, 충분한 수분을 섭취하세요. 시원한 장소에 머물고, 가벼운 옷을 착용하세요.",
          url: "https://www.safetykorea.go.kr",
          category: "폭염",
          detail_category: "일상 대비",
          title: "폭염 대비 행동요령",
          category_code: "01016",
          category_name: "폭염"
        },
        {
          id: 5,
          content: "홍수 발생시 라디오나 TV를 통해 기상정보를 확인하고, 저지대나 상습침수지역을 피하세요. 지하공간이나 반지하 건물에서 즉시 대피하세요.",
          url: "https://www.safetykorea.go.kr",
          category: "홍수",
          detail_category: "대피 요령",
          title: "홍수 발생시 대피 요령",
          category_code: "01013",
          category_name: "홍수"
        }
      ],
      total: 5
    };
  }

  async getDisasterActions(params = {}) {
    try {
      const page = params.page_no || params.page || 1;
      const limit = params.num_of_rows || params.per_page || 10;
      const search = params.keyword || '';
      const category = params.category_code || '';

      return await this.getAllActions(page, limit, search, category);
    } catch (error) {
      console.error('getDisasterActions 실패:', error);
      return this.getMockActions();
    }
  }

  async getAllActions(page = 1, limit = 10, search = '', category = '') {
    try {
      const queryParams = new URLSearchParams({
        page_no: page.toString(),
        num_of_rows: limit.toString(),
        ...(search && { keyword: search }),
        ...(category && { category_code: category })
      });
      
      const endpoint = `${API_ENDPOINTS.ACTION.ACTIONS}?${queryParams}`;
      console.log('행동요령 API 요청:', endpoint);
      
      const response = await apiRequest(endpoint, {
        method: 'GET',
        skipAuth: true
      });
      
      return {
        success: true,
        items: response.items || response.actions || response.data || [],
        total: response.total || response.count || 0,
        page,
        limit
      };
      
    } catch (error) {
      console.error('행동요령 조회 실패:', error);
      
      const mockData = this.getMockActions();
      
      // ✅ 모의 데이터 필터링 로직 추가 (categoryCode에 따라 필터링)
      const filteredItems = mockData.items.filter(item => {
        const matchesCategory = !category || item.category_code === category;
        const matchesSearch = !search || 
                              item.title.includes(search) || 
                              item.content.includes(search);
        return matchesCategory && matchesSearch;
      });
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        success: true,
        items: filteredItems.slice(startIndex, endIndex),
        total: filteredItems.length,
        page,
        limit,
        isFromMock: true
      };
    }
  }

  async getActionsByCategory(categoryCode, page = 1, limit = 10) {
    return this.getAllActions(page, limit, '', categoryCode);
  }

  async getActionDetail(actionId) {
    try {
      const endpoint = `${API_ENDPOINTS.ACTION.ACTIONS}/${actionId}`;
      console.log('행동요령 상세 API 요청:', endpoint);
      
      const response = await apiRequest(endpoint, {
        method: 'GET',
        skipAuth: true
      });
      
      return {
        success: true,
        action: response
      };
      
    } catch (error) {
      console.error('행동요령 상세 조회 실패:', error);
      
      const mockData = this.getMockActions();
      const action = mockData.items.find(item => item.id == actionId) || mockData.items[0];
      
      return {
        success: true,
        action: action,
        isFromMock: true
      };
    }
  }

  async searchActions(keyword, page = 1, limit = 10) {
    return this.getAllActions(page, limit, keyword, '');
  }

  async getCategories() {
    try {
      console.log('카테고리 API 요청:', API_ENDPOINTS.ACTION.CATEGORIES);
      
      const response = await apiRequest(API_ENDPOINTS.ACTION.CATEGORIES, {
        method: 'GET',
        skipAuth: true
      });
      
      return response.categories || this.getDefaultCategories();
      
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      return this.getDefaultCategories();
    }
  }

  getDefaultCategories() {
    return {
      "01011": "지진",
      "01012": "태풍", 
      "01013": "홍수",
      "01014": "화재",
      "01015": "산사태",
      "01016": "폭염",
      "01017": "한파",
      "01018": "대설",
      "01019": "황사"
    };
  }

  async getCategoryStats() {
    try {
      console.log('통계 API 요청:', API_ENDPOINTS.ACTION.STATS);
      
      const response = await apiRequest(API_ENDPOINTS.ACTION.STATS, {
        method: 'GET',
        skipAuth: true
      });
      
      return {
        success: true,
        categories: response.categories || response.stats || {}
      };
      
    } catch (error) {
      console.error('카테고리 통계 조회 실패:', error);
      return {
        success: false,
        categories: {}
      };
    }
  }

  async getActionForDisaster(disasterType) {
    try {
      const categories = await this.getCategories();
      let categoryCode = null;
      
      for (const [code, name] of Object.entries(categories)) {
        if (name.includes(disasterType) || disasterType.includes(name)) {
          categoryCode = code;
          break;
        }
      }
      
      if (categoryCode) {
        const response = await this.getActionsByCategory(categoryCode, 1, 3);
        return response.items;
      }
      
      return [];
    } catch (error) {
      console.error('재난별 행동요령 조회 실패:', error);
      return [];
    }
  }

  async getPopularActions(limit = 5) {
    try {
      const response = await this.getAllActions(1, limit);
      
      return {
        success: true,
        items: response.items
      };
      
    } catch (error) {
      console.error('인기 행동요령 조회 실패:', error);
      
      const mockData = this.getMockActions();
      return {
        success: true,
        items: mockData.items.slice(0, limit),
        isFromMock: true
      };
    }
  }
}

const disasterActionServiceInstance = new DisasterActionService();

export default disasterActionServiceInstance;
export { disasterActionServiceInstance as disasterActionService };