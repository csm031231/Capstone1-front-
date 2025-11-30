// src/services/userService.js
import { apiRequest, API_ENDPOINTS, getStorageItem, setStorageItem, removeStorageItem } from './apiConfig'; // apiConfig에서 storage 헬퍼 함수 가져오기
// 💡 AsyncStorage 대신 apiConfig의 헬퍼 함수를 사용하도록 로직 변경 (이 파일에서 직접 AsyncStorage 사용 방지)
const AsyncStorage = {
    getItem: getStorageItem,
    setItem: setStorageItem,
    removeItem: removeStorageItem,
};

class UserService {
  
  async checkToken() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        return false;
      }

      const response = await apiRequest(API_ENDPOINTS.USER.ME, {
        method: 'GET',
      });
      
      return response ? true : false;
    } catch (error) {
      console.error('토큰 확인 실패:', error);
      return false;
    }
  }

  async login(email, password) {
    try {
      console.log('로그인 API 요청:', API_ENDPOINTS.USER.LOGIN);
      
      const response = await apiRequest(API_ENDPOINTS.USER.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        }),
        skipAuth: true
      });
      
      console.log('로그인 API 응답:', response);
      
      if (response.access_token) {
        await AsyncStorage.setItem('access_token', response.access_token);
        
        try {
          // 로그인 후 사용자 정보 바로 가져오기
          const userInfo = await this.getUserInfo();
          if (userInfo) {
            await AsyncStorage.setItem('user_info', JSON.stringify(userInfo));
          }
        } catch (userInfoError) {
          console.warn('사용자 정보 가져오기 실패:', userInfoError);
        }
      }
      
      return response;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('회원가입 API 요청:', API_ENDPOINTS.USER.REGISTER);
      
      const response = await apiRequest(API_ENDPOINTS.USER.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          nickname: userData.nickname || null,
          phone: userData.phone || null
        }),
        skipAuth: true
      });
      
      console.log('회원가입 API 응답:', response);
      return response;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_info');
      return { success: true };
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  async getUserInfo() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('로그인이 필요합니다');
      }

      console.log('사용자 정보 API 요청:', API_ENDPOINTS.USER.ME);
      
      const response = await apiRequest(API_ENDPOINTS.USER.ME, {
        method: 'GET',
      });
      
      console.log('사용자 정보 API 응답:', response);
      return response;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      console.log('프로필 업데이트 API 요청:', API_ENDPOINTS.USER.UPDATE_ME);
      
      const response = await apiRequest(API_ENDPOINTS.USER.UPDATE_ME, {
        method: 'PUT',
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          nickname: userData.nickname,
          phone: userData.phone,
          // favorite_region: userData.favoriteRegion, // 관심지역은 별도 API 사용
          current_latitude: userData.current_latitude,
          current_longitude: userData.current_longitude
        })
      });
      
      console.log('프로필 업데이트 API 응답:', response);
      
      if (response) {
        await AsyncStorage.setItem('user_info', JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    }
  }

  async updateLocation(latitude, longitude) {
    try {
      console.log('위치 업데이트 API 요청:', { latitude, longitude });
      
      const response = await apiRequest(API_ENDPOINTS.USER.UPDATE_ME, {
        method: 'PUT',
        body: JSON.stringify({
          current_latitude: latitude,
          current_longitude: longitude
        })
      });
      
      console.log('위치 업데이트 API 응답:', response);
      return response;
    } catch (error) {
      console.error('위치 업데이트 실패:', error);
      throw error;
    }
  }
  
  // 💡 추가: 비밀번호 변경
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('비밀번호 변경 API 요청:', API_ENDPOINTS.USER.CHANGE_PASSWORD);
      const response = await apiRequest(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
        method: 'PUT',
        body: JSON.stringify({
          current_password: currentPassword, 
          new_password: newPassword,         
        })
      });
      return response;
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      throw error;
    }
  }

  // 💡 추가: 모든 시/도 목록 조회 (level=1)
  async getProvinces() {
    try {
      console.log('시/도 목록 API 요청:', API_ENDPOINTS.REGION.ALL);
      const response = await apiRequest(`${API_ENDPOINTS.REGION.ALL}?level=1`, { 
        method: 'GET',
      });
      return response; // List[RegionResponse] 반환
    } catch (error) {
      console.error('시/도 목록 조회 실패:', error);
      throw error;
    }
  }
  
  // 💡 추가: 사용자 관심지역 목록 조회
  async getInterestRegions() {
    try {
      console.log('관심지역 목록 API 요청:', API_ENDPOINTS.REGION.MY_REGIONS);
      const response = await apiRequest(API_ENDPOINTS.REGION.MY_REGIONS, {
        method: 'GET'
      });
      return response; // UserInterestRegionsResponse 반환
    } catch (error) {
      console.error('관심지역 목록 조회 실패:', error);
      throw error;
    }
  }
  
  // ----------------------------------------------------
  // 💡 수정: 관심지역 다중 선택을 위해 함수 분리 및 로직 재구성
  // ----------------------------------------------------

  // 💡 신규: 모든 관심지역 제거 API 호출
  async clearInterestRegions() {
    try {
      console.log('관심지역 전체 제거 API 요청:', API_ENDPOINTS.REGION.CLEAR);
      const response = await apiRequest(API_ENDPOINTS.REGION.CLEAR, { 
        method: 'DELETE' 
      });
      // 성공 시 { success: True, message: "...", deleted_count: int } 반환
      return { success: true, ...response };
    } catch (error) {
      console.error('관심지역 전체 제거 실패:', error);
      // 실패하더라도 에러를 던지지 않고 실패 상태 반환 (UserProflile에서 에러를 처리함)
      return { success: false, message: error.message || '전체 제거 실패' };
    }
  }
  
  // 💡 신규: 관심지역 일괄 추가 API 호출
  async bulkAddInterestRegions(regionIds) {
    if (!regionIds || regionIds.length === 0) {
      // 빈 배열이면 API 호출 없이 성공적인 응답 형식 반환
      return { success_count: 0, failed_count: 0, already_exists_count: 0, details: [] };
    }
    
    try {
      console.log('관심지역 일괄 추가 API 요청:', API_ENDPOINTS.REGION.BULK_ADD);
      const response = await apiRequest(API_ENDPOINTS.REGION.BULK_ADD, {
        method: 'POST',
        body: JSON.stringify({
          region_ids: regionIds 
        })
      });
      
      return response; // BulkAddInterestRegionsResponse 반환
    } catch (error) {
      console.error('관심지역 일괄 추가 실패:', error);
      throw error;
    }
  }

  // 💡 삭제: updateInterestRegions 함수는 bulkAddInterestRegions와 clearInterestRegions로 분리되었습니다.
  /*
  async updateInterestRegions(regionIds) {
    // ... 이전 단일 선택 로직 삭제 ...
  }
  */
}

const userService = new UserService();
export default userService;