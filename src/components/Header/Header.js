import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import SideMenu from './SideMenu';
import SettingsModal from './SettingsModal';
import LoginSignupModal from './LoginSignupModal';
import MyPageScreen from './UserProfile';
import userService from '../../services/userService';

// 🔧 TEST_MODE 설정
const TEST_MODE = false;

const Header = ({ searchText, setSearchText, onSearch, theme = 'white', onThemeChange }) => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [modalMode, setModalMode] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(TEST_MODE);
  const [userInfo, setUserInfo] = useState(TEST_MODE ? {
    id: 'test_user_001',
    username: 'testuser',
    nickname: '김해시민',
    email: 'test@kimhae.go.kr',
    phone: '010-1234-5678',
    created_at: '2024-01-15T09:30:00Z',
  } : null);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  const isDarkTheme = theme === 'black';

  const searchBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
  const searchBorder = isDarkTheme ? COLORS.primaryDark : COLORS.primary;
  const primaryTextColor = isDarkTheme ? COLORS.textWhite : COLORS.textPrimary;
  const secondaryTextColor = isDarkTheme ? COLORS.textLight : COLORS.textSecondary;
  const menuButtonBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
  const menuButtonIconColor = isDarkTheme ? COLORS.textWhite : COLORS.primary;

  useEffect(() => {
    if (!TEST_MODE) {
      loadUserInfo();
    } else {
      console.log('✅ TEST_MODE 활성화 - 백엔드 없이 UI 테스트 가능');
    }
  }, []);

  const loadUserInfo = async () => {
    if (TEST_MODE) return;
    
    try {
      setLoading(true);
      const isTokenValid = await userService.checkToken();
      
      if (isTokenValid) {
        const userData = await userService.getUserInfo();
        setUserInfo(userData);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패 (Header):', error);
      setIsLoggedIn(false);
      setUserInfo(null);
    } finally {
      // API 실패/성공과 관계없이 로딩 상태 해제
      setLoading(false); 
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      if (!TEST_MODE) {
        await userService.logout();
      }
      setIsLoggedIn(false);
      setUserInfo(null);
      setShowSideMenu(false);
      setShowMyPage(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (loginData) => {
    try {
      setShowLoginModal(false);
      
      if (!TEST_MODE) {
        setLoading(true);
        // 로그인 성공 후 정보 로드 시, 이미 토큰이 저장되어 있으므로 실패 위험 적음
        await loadUserInfo(); 
      } else {
        setIsLoggedIn(true);
        setUserInfo({
          id: 'test_user_001',
          username: loginData.username || 'testuser',
          nickname: '김해시민',
          email: loginData.email || 'test@kimhae.go.kr',
          phone: '010-1234-5678',
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('로그인 후 처리 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemPress = (itemId) => {
    switch (itemId) {
      case 'login':
        setShowSideMenu(false);
        setTimeout(() => {
          setModalMode('login');
          setShowLoginModal(true);
        }, 300);
        break;
        
      case 'signup':
        setShowSideMenu(false);
        setTimeout(() => {
          setModalMode('signup');
          setShowLoginModal(true);
        }, 300);
        break;
        
      case 'mypage':
        setShowSideMenu(false);
        setTimeout(() => setShowMyPage(true), 300);
        break;
        
      case 'logout':
        setShowSideMenu(false);
        handleLogout();
        break;
        
      case 'settings':
        handleOpenSettings();
        break;
        
      default:
        setShowSideMenu(false);
    }
  };

  const handleOpenSettings = () => {
    setShowSideMenu(false);
    setShowSettingsModal(true);
  };

  const handleThemeChange = (newTheme) => {
    onThemeChange && onThemeChange(newTheme);
    setShowSettingsModal(false);
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    onSearch && onSearch();
  };

  const handleSearchFocus = () => {
    if (window.closeBottomSheetOnly) {
      window.closeBottomSheetOnly();
    }
  };

  const handleSearchButtonPress = () => {
    if (searchText.trim()) {
      handleSearchSubmit();
    } else {
      searchInputRef.current?.focus();
    }
  };

  const handleSearchContainerPress = () => {
    searchInputRef.current?.focus();
  };

  // 전역 함수로 등록 (BottomSheet에서 검색창을 닫을 때 사용)
  useEffect(() => {
    window.blurSearchInput = () => {
      searchInputRef.current?.blur();
    };
    return () => {
      delete window.blurSearchInput;
    };
  }, []);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[
            styles.searchContainer,
            { backgroundColor: searchBg, borderColor: searchBorder }
          ]}
          onPress={handleSearchContainerPress}
          activeOpacity={0.9}
        >
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: primaryTextColor }]}
            placeholder="지역명 또는 대피소 검색"
            placeholderTextColor={secondaryTextColor}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            onFocus={handleSearchFocus}
            returnKeyType="search"
            blurOnSubmit={true}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={handleSearchButtonPress} 
            style={styles.searchButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="search" size={24} color={primaryTextColor} />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: menuButtonBg }]}
          onPress={() => setShowSideMenu(true)}
        >
          <Ionicons name="menu" size={28} color={menuButtonIconColor} />
        </TouchableOpacity>
      </View>

      <SideMenu
        visible={showSideMenu}
        onClose={() => setShowSideMenu(false)}
        onMenuItemPress={handleMenuItemPress}
        theme={theme}
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      <LoginSignupModal
        visible={showLoginModal}
        initialMode={modalMode}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <MyPageScreen
        visible={showMyPage}
        onClose={() => {
          setShowMyPage(false);
          if (!TEST_MODE) loadUserInfo();
        }}
        onLogout={handleLogout}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 100,
    elevation: 100,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 2,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  searchButton: {
    marginLeft: 8,
    padding: 4,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default Header;