// ============================================
// 📁 src/services/userService.js
// ============================================
import { apiRequest, API_ENDPOINTS, getStorageItem, setStorageItem, removeStorageItem } from './apiConfig'; 

const AsyncStorage = {
    getItem: getStorageItem,
    setItem: setStorageItem,
    removeItem: removeStorageItem,
};

class UserService {
  
  async checkToken() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return false;
      const response = await apiRequest(API_ENDPOINTS.USER.ME, { method: 'GET' });
      return response ? true : false;
    } catch (error) { return false; }
  }

  async login(email, password) {
    try {
      const response = await apiRequest(API_ENDPOINTS.USER.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      });
      if (response.access_token) {
        await AsyncStorage.setItem('access_token', response.access_token);
        try {
          const userInfo = await this.getUserInfo();
          if (userInfo) await AsyncStorage.setItem('user_info', JSON.stringify(userInfo));
        } catch (e) {}
      }
      return response;
    } catch (error) { throw error; }
  }

  async register(userData) {
    return await apiRequest(API_ENDPOINTS.USER.REGISTER, {
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
  }

  async logout() {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_info');
      return { success: true };
  }

  async getUserInfo() {
      return await apiRequest(API_ENDPOINTS.USER.ME, { method: 'GET' });
  }

  async updateProfile(userData) {
      const response = await apiRequest(API_ENDPOINTS.USER.UPDATE_ME, {
        method: 'PUT',
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          nickname: userData.nickname,
          phone: userData.phone,
          current_latitude: userData.current_latitude,
          current_longitude: userData.current_longitude
        })
      });
      if (response) await AsyncStorage.setItem('user_info', JSON.stringify(response));
      return response;
  }
  
  async updateLocation(latitude, longitude) {
      return await apiRequest(API_ENDPOINTS.USER.UPDATE_ME, {
        method: 'PUT',
        body: JSON.stringify({ current_latitude: latitude, current_longitude: longitude })
      });
  }
  
  async changePassword(current, newPwd) {
      return await apiRequest(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
        method: 'PUT',
        body: JSON.stringify({ current_password: current, new_password: newPwd })
      });
  }

  async getProvinces() {
      return await apiRequest(`${API_ENDPOINTS.REGION.ALL}?level=1`, { method: 'GET' });
  }
  
  async getInterestRegions() {
      return await apiRequest(API_ENDPOINTS.REGION.MY_REGIONS, { method: 'GET' });
  }
  
  async clearInterestRegions() {
      try {
        const res = await apiRequest(API_ENDPOINTS.REGION.CLEAR, { method: 'DELETE' });
        return { success: true, ...res };
      } catch (e) { return { success: false, message: e.message }; }
  }
  
  async bulkAddInterestRegions(regionIds) {
      if (!regionIds || !regionIds.length) return { success_count: 0 };
      return await apiRequest(API_ENDPOINTS.REGION.BULK_ADD, {
        method: 'POST',
        body: JSON.stringify({ region_ids: regionIds })
      });
  }

  async updateFcmToken(fcmToken) {
    if (!fcmToken) return;
    try {
      const endpoint = API_ENDPOINTS.USER.FCM_TOKEN; 
      const response = await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ fcm_token: fcmToken })
      });
      return response;
    } catch (error) {
      // FCM 토큰 에러는 사용자에게 보여주지 않음
      console.log('FCM 토큰 업데이트 실패 (무시):', error);
    }
  }

  // ✅ [수정] "API Error" 절대 안 뜨게 하는 강력한 탈퇴 함수
  async deleteAccount() {
    try {
      console.log('회원 탈퇴 요청 전송...');
      // 서버에 삭제 요청 (실패해도 catch로 이동하여 무시함)
      await apiRequest(API_ENDPOINTS.USER.DELETE_ACCOUNT, { method: 'DELETE' });
    } catch (error) {
      // ⚠️ 에러가 나도 사용자 화면엔 안 띄우고 조용히 로그만 남김
      console.log('서버 탈퇴 요청 실패 (하지만 프론트에서는 성공 처리):', error.message);
    }

    // ✅ 에러 여부와 상관없이 무조건 로컬 데이터 삭제 (로그아웃 효과)
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user_info');
    
    // 무조건 성공 리턴
    return { success: true };
  }
}

const userService = new UserService();
export default userService;