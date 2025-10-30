// src/services/userService.js
import { apiRequest, API_ENDPOINTS } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          favorite_region: userData.favoriteRegion,
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
}

const userService = new UserService();
export default userService;