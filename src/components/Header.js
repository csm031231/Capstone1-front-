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

const Header = ({ searchText, setSearchText, onSearch }) => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '김해시민',
    email: 'user@example.com',
    phone: '010-1234-5678',
    favoriteLocation: '김해시 장유면'
  });

  // 메뉴 아이템 클릭 핸들러
  const handleMenuItemPress = (item) => {
    setShowSideMenu(false);
    
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
    Alert.alert('설정', '앱 설정 화면으로 이동합니다.');
  };

  const handleHelp = () => {
    Alert.alert('도움말', '도움말 및 문의 화면으로 이동합니다.');
  };

  // 로그인 전 메뉴 아이템
  const guestMenuItems = [
    { id: 'login', title: '로그인', icon: 'key-outline', description: '계정에 로그인하세요' },
    { id: 'signup', title: '회원가입', icon: 'person-add-outline', description: '새 계정을 만드세요' },
    { id: 'interest-location', title: '관심지역', icon: 'location-outline', description: '관심 있는 지역을 설정하세요' },
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
      style={[styles.menuItem, item.id === 'logout' && styles.logoutMenuItem]}
      onPress={() => handleMenuItemPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuItemIconContainer}>
            <Ionicons
              name={item.icon}
              size={24}
              color={item.id === 'logout' ? '#ff6666' : '#fff'}
            />
          </View>
          <View style={styles.menuItemTextContainer}>
            <Text style={[styles.menuItemTitle, item.id === 'logout' && styles.logoutText]}>
              {item.title}
            </Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="검색"
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowSideMenu(true)}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 사이드 메뉴 모달 */}
      <Modal
        visible={showSideMenu}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSideMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowSideMenu(false)}
          />
          
          <View style={styles.sideMenuContainer}>
            <View style={styles.menuHeader}>
              <View style={styles.userSection}>
                {isLoggedIn ? (
                  <>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>👤</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{userInfo.name}</Text>
                      <Text style={styles.userEmail}>{userInfo.email}</Text>
                      <Text style={styles.userLocation}>📍 {userInfo.favoriteLocation}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.guestAvatar}>
                      <Text style={styles.guestAvatarText}>👋</Text>
                    </View>
                    <View style={styles.guestInfo}>
                      <Text style={styles.guestTitle}>안녕하세요!</Text>
                      <Text style={styles.guestSubtitle}>로그인하여 더 많은 서비스를 이용하세요</Text>
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

            <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>
                  {isLoggedIn ? '계정 관리' : '시작하기'}
                </Text>
                {currentMenuItems.map(renderMenuItem)}
              </View>

              <View style={styles.appInfo}>
                <Text style={styles.appName}>김해 재난안전 앱</Text>
                <Text style={styles.appVersion}>버전 1.0.0</Text>
                <Text style={styles.appDescription}>
                  김해시민을 위한 재난안전 정보 서비스
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a', // 진한 배경색
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333', // 어두운 버튼
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 20,
    color: '#ffffff', // 흰색 아이콘
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a', // 어두운 검색창
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#444',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff', // 흰색 텍스트
    fontWeight: '500',
  },

  searchButton: {
    marginLeft: 8,
  },
  
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  voiceIcon: {
    fontSize: 16,
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 더 진한 오버레이
  },
  sideMenuContainer: {
    width: 340, // 더 넓은 메뉴
    backgroundColor: '#1a1a1a', // 어두운 메뉴 배경
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  
  // 메뉴 헤더
  menuHeader: {
    backgroundColor: '#8088B2', // 빨간색 헤더
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

  // 메뉴 컨텐츠
  menuContent: {
    flex: 1,
  },
  menuSection: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff', // 흰색 섹션 타이틀
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  menuItem: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemIcon: {
    fontSize: 20,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff', // 흰색 메뉴 텍스트
    marginBottom: 4,
  },
  logoutText: {
    color: '#ff6666',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 18,
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },

  // 앱 정보
  appInfo: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 24,
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  appVersion: {
    fontSize: 15,
    color: '#aaa',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default Header;