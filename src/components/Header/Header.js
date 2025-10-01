import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ searchText, setSearchText, onSearch, theme = 'white', onThemeChange }) => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '김해시민',
    email: 'user@example.com',
    phone: '010-1234-5678',
    favoriteLocation: '김해시 장유면'
  });

  const isDarkTheme = theme === 'black';

  const headerBg = isDarkTheme ? '#1a1a1a' : '#f8f8f8';
  const headerShadowColor = isDarkTheme ? '#000' : '#888';
  const primaryTextColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
  const secondaryTextColor = isDarkTheme ? '#aaa' : '#666';
  const searchBg = isDarkTheme ? '#2a2a2a' : '#ffffff';
  const searchBorder = isDarkTheme ? '#444' : '#ccc';
  const menuButtonBg = isDarkTheme ? '#2a2a2a' : '#ffffff';
  const menuButtonIconColor = isDarkTheme ? '#fff' : '#1a1a1a';
  
  const sideMenuBg = isDarkTheme ? '#1a1a1a' : '#ffffff';
  const menuDivider = isDarkTheme ? '#333' : '#e0e0e0';
  const menuItemIconBg = isDarkTheme ? '#333' : '#f0f0f0';
  
  const settingsModalBg = isDarkTheme ? '#2a2a2a' : '#ffffff';
  const settingsBorder = isDarkTheme ? '#444' : '#e0e0e0';
  const settingsTitleColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
  const settingsOptionColor = isDarkTheme ? '#ddd' : '#333';
  const settingsOptionActiveBg = isDarkTheme ? 'rgba(66, 133, 244, 0.2)' : 'rgba(66, 133, 244, 0.05)';
  const settingsOptionActiveColor = '#4285f4';

  const handleMenuItemPress = (item) => {
    if (item !== 'settings') {
      setShowSideMenu(false);
    }
    
    switch (item) {
      case 'login':
        handleLogin();
        break;
      case 'signup':
        handleSignup();
        break;
      case 'logout':
        handleLogout();
        break;
      case 'interest-location':
        handleInterestLocation();
        break;
      case 'profile-edit':
        handleProfileEdit();
        break;
      case 'settings':
        handleSettings();
        break;
      case 'help':
        handleHelp();
        break;
      default:
        console.log('Unknown menu item:', item);
    }
  };

  const handleLogin = () => {
    Alert.alert(
      '로그인',
      '로그인 기능을 구현하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '데모 로그인', 
          onPress: () => {
            setIsLoggedIn(true);
            Alert.alert('성공', '로그인되었습니다.');
          }
        }
      ]
    );
  };

  const handleSignup = () => {
    Alert.alert('회원가입', '회원가입 화면으로 이동합니다.');
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          onPress: () => {
            setIsLoggedIn(false);
            Alert.alert('완료', '로그아웃되었습니다.');
          }
        }
      ]
    );
  };

  const handleInterestLocation = () => {
    Alert.alert('관심지역', '관심지역 설정 화면으로 이동합니다.');
  };

  const handleProfileEdit = () => {
    Alert.alert('회원정보수정', '회원정보 수정 화면으로 이동합니다.');
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleHelp = () => {
    Alert.alert('도움말', '도움말 및 문의 화면으로 이동합니다.');
  };

  const handleThemeOptionPress = (newTheme) => {
    onThemeChange && onThemeChange(newTheme);
    setShowSettingsModal(false);
  };

  const guestMenuItems = [
    { id: 'login', title: '로그인', icon: 'log-in-outline', description: '계정에 로그인하세요' },
    { id: 'signup', title: '회원가입', icon: 'person-add-outline', description: '새 계정을 만드세요' },
    { id: 'interest-location', title: '관심지역', icon: 'location-outline', description: '관심 있는 지역을 설정하세요' },
    { id: 'settings', title: '설정', icon: 'settings-outline', description: '앱 설정을 변경하세요' },
    { id: 'help', title: '도움말', icon: 'help-circle-outline', description: '사용법 및 문의사항' },
  ];
  
  const userMenuItems = [
    { id: 'profile-edit', title: '회원정보수정', icon: 'create-outline', description: '개인정보를 수정하세요' },
    { id: 'interest-location', title: '관심지역', icon: 'location-outline', description: '관심 있는 지역을 관리하세요' },
    { id: 'settings', title: '설정', icon: 'settings-outline', description: '앱 설정을 변경하세요' },
    { id: 'help', title: '도움말', icon: 'help-circle-outline', description: '사용법 및 문의사항' },
    { id: 'logout', title: '로그아웃', icon: 'log-out-outline', description: '계정에서 로그아웃' },
  ];

  const currentMenuItems = isLoggedIn ? userMenuItems : guestMenuItems;

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem, 
        item.id === 'logout' && styles.logoutMenuItem,
        { borderBottomColor: menuDivider }
      ]}
      onPress={() => handleMenuItemPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuItemIconContainer, { backgroundColor: menuItemIconBg }]}>
            <Ionicons
              name={item.icon}
              size={24}
              color={item.id === 'logout' ? '#ff6666' : primaryTextColor}
            />
          </View>
          <View style={styles.menuItemTextContainer}>
            <Text style={[
              styles.menuItemTitle, 
              { color: item.id === 'logout' ? '#ff6666' : primaryTextColor }
            ]}>
              {item.title}
            </Text>
            <Text style={[styles.menuItemDescription, { color: secondaryTextColor }]}>{item.description}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* 투명 헤더 - 검색바와 메뉴 버튼만 표시 */}
      <View style={styles.header}>
        <View style={[
          styles.searchContainer,
          { backgroundColor: searchBg, borderColor: searchBorder }
        ]}>
          <TextInput
            style={[styles.searchInput, { color: primaryTextColor }]}
            placeholder="검색"
            placeholderTextColor={secondaryTextColor} 
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color={primaryTextColor} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.menuButton, { backgroundColor: menuButtonBg }]}
          onPress={() => setShowSideMenu(true)}
        >
          <Ionicons name="menu" size={28} color={menuButtonIconColor} />
        </TouchableOpacity>
      </View>

      {/* 사이드 메뉴 모달 */}
      <Modal
        visible={showSideMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSideMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowSideMenu(false)}
          />
          
          <View style={[styles.sideMenuContainer, { backgroundColor: sideMenuBg }]}>
            <View style={styles.menuHeader}>
              <View style={styles.userSection}>
                {isLoggedIn ? (
                  <>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>👤</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: '#ffffff' }]}>{userInfo.name}</Text>
                      <Text style={[styles.userEmail, { color: 'rgba(255, 255, 255, 0.9)' }]}>{userInfo.email}</Text>
                      <Text style={[styles.userLocation, { color: 'rgba(255, 255, 255, 0.8)' }]}>📍 {userInfo.favoriteLocation}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.guestAvatar}>
                      <Text style={styles.guestAvatarText}>👋</Text>
                    </View>
                    <View style={styles.guestInfo}>
                      <Text style={[styles.guestTitle, { color: '#ffffff' }]}>안녕하세요!</Text>
                      <Text style={[styles.guestSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>로그인하여 더 많은 서비스를 이용하세요</Text>
                    </View>
                  </>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSideMenu(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.menuContent} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View style={styles.menuSection}>
                <Text style={[styles.sectionTitle, { color: primaryTextColor }]}>
                  {isLoggedIn ? '계정 관리' : '시작하기'}
                </Text>
                {currentMenuItems.map(renderMenuItem)}
              </View>

              <View style={[styles.appInfo, { borderTopColor: menuDivider }]}>
                <Text style={[styles.appName, { color: primaryTextColor }]}>재난안전 앱</Text>
                <Text style={[styles.appVersion, { color: secondaryTextColor }]}>버전 1.0.0</Text>
                <Text style={[styles.appDescription, { color: secondaryTextColor }]}>
                  시민을 위한 재난안전 정보 서비스
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 설정 모달 */}
      <Modal
        visible={showSettingsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.settingsModalOverlay}>
          <View style={[styles.settingsModalContainer, { backgroundColor: settingsModalBg }]}>
            <Text style={[styles.settingsModalTitle, { color: settingsTitleColor }]}>앱 설정</Text>
            
            <View style={[styles.settingsItem, { borderBottomColor: settingsBorder }]}>
              <Text style={[styles.settingsItemTitle, { color: settingsOptionColor }]}>화면 테마</Text>
              <View style={styles.themeOptionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.themeSettingOption,
                    { backgroundColor: theme === 'white' ? settingsOptionActiveBg : 'transparent' },
                    { borderColor: theme === 'white' ? settingsOptionActiveColor : settingsBorder },
                  ]}
                  onPress={() => handleThemeOptionPress('white')}
                >
                  <Text style={[
                    styles.themeSettingText,
                    { color: theme === 'white' ? settingsOptionActiveColor : settingsOptionColor }
                  ]}>화이트</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.themeSettingOption,
                    { backgroundColor: theme === 'black' ? settingsOptionActiveBg : 'transparent' },
                    { borderColor: theme === 'black' ? settingsOptionActiveColor : settingsBorder },
                  ]}
                  onPress={() => handleThemeOptionPress('black')}
                >
                  <Text style={[
                    styles.themeSettingText,
                    { color: theme === 'black' ? settingsOptionActiveColor : settingsOptionColor }
                  ]}>블랙</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.settingsCloseButton, { backgroundColor: settingsOptionActiveColor }]}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.settingsCloseButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // 🔥 핵심 변경: 헤더를 투명하게 만들고 position: absolute 사용
  header: {
    position: 'absolute',  // 절대 위치로 변경
    top: 20,  // 상태바 아래에 위치 (약간 여유 있게)
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,  // 지도 위에 표시되도록 z-index 설정
    backgroundColor: 'transparent',  // 배경 완전 투명
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    elevation: 3,  // 그림자 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  searchButton: {
    marginLeft: 8,
  },
  
  // 나머지 스타일은 기존과 동일
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
  },
  sideMenuContainer: {
    width: 340,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  menuHeader: {
    backgroundColor: '#8088B2',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userAvatarText: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  guestAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  guestAvatarText: {
    fontSize: 28,
  },
  guestInfo: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  guestSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  menuContent: {
    flex: 1,
  },
  menuSection: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  menuItem: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  logoutMenuItem: {
    borderBottomColor: '#ff4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  appInfo: {
    padding: 24,
    borderTopWidth: 1,
    marginTop: 24,
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  appVersion: {
    fontSize: 15,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModalContainer: {
    width: '85%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  settingsModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  themeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  themeSettingOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeSettingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingsCloseButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  settingsCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  }
});

export default Header;