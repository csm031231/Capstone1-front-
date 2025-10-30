// ============================================
// 📁 src/components/Header/SideMenu.js (로그인 기능 추가)
// ============================================
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const SideMenu = ({ 
  visible, 
  onClose, 
  onMenuItemPress, 
  theme = 'white',
  isLoggedIn = false,
  userInfo = null 
}) => {
  const isDarkTheme = theme === 'black';
  const sideMenuBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
  const primaryTextColor = isDarkTheme ? COLORS.textWhite : COLORS.textPrimary;
  const secondaryTextColor = isDarkTheme ? COLORS.textLight : COLORS.textSecondary;
  const menuDivider = isDarkTheme ? COLORS.divider : COLORS.border;
  const menuItemIconBg = isDarkTheme ? COLORS.primaryDark : COLORS.overlayLight;

  // 비로그인 메뉴
  const guestMenuItems = [
    { id: 'login', title: '로그인', icon: 'log-in-outline', description: '계정에 로그인하세요' },
    { id: 'signup', title: '회원가입', icon: 'person-add-outline', description: '새 계정을 만드세요' },
    { id: 'settings', title: '설정', icon: 'settings-outline', description: '앱 설정을 변경하세요' },
    { id: 'help', title: '도움말', icon: 'help-circle-outline', description: '사용법 및 문의사항' },
  ];

  // 로그인 메뉴
  const userMenuItems = [
    { id: 'mypage', title: '회원정보수정', icon: 'create-outline', description: '개인정보를 수정하세요' },
    { id: 'settings', title: '설정', icon: 'settings-outline', description: '앱 설정을 변경하세요' },
    { id: 'help', title: '도움말', icon: 'help-circle-outline', description: '사용법 및 문의사항' },
    { id: 'logout', title: '로그아웃', icon: 'log-out-outline', description: '계정에서 로그아웃' },
  ];

  const currentMenuItems = isLoggedIn ? userMenuItems : guestMenuItems;

  const handleMenuPress = (itemId) => {
    if (itemId === 'help') {
      Alert.alert('도움말', '도움말 및 문의 화면으로 이동합니다.');
      onClose();
    } else {
      onMenuItemPress(itemId);
    }
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        item.id === 'logout' && styles.logoutMenuItem,
        { borderBottomColor: menuDivider }
      ]}
      onPress={() => handleMenuPress(item.id)}
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
            <Text style={[styles.menuItemDescription, { color: secondaryTextColor }]}>
              {item.description}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.sideMenuContainer, { backgroundColor: sideMenuBg }]}>
          {/* 사용자 프로필 헤더 */}
          <View style={styles.menuHeader}>
            <View style={styles.userSection}>
              {isLoggedIn ? (
                <>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={28} color="#ffffff" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {userInfo?.nickname || userInfo?.username || '사용자'}
                    </Text>
                    <Text style={styles.userEmail}>{userInfo?.email || ''}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.guestAvatar}>
                    <Ionicons name="person-outline" size={28} color="#ffffff" />
                  </View>
                  <View style={styles.guestInfo}>
                    <Text style={styles.guestTitle}>안녕하세요!</Text>
                    <Text style={styles.guestSubtitle}>
                      로그인하여 더 많은 서비스를 이용하세요
                    </Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* 메뉴 리스트 */}
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

            {/* 앱 정보 */}
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
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: COLORS.primary,
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
});

export default SideMenu;