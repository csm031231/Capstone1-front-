// ============================================
// 📁 src/components/Header/Header.js (수정된 버전)
// ============================================
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import SideMenu from './SideMenu';
import SettingsModal from './SettingsModal';

const Header = ({ searchText, setSearchText, onSearch, theme = 'white', onThemeChange }) => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const searchInputRef = useRef(null);  // ⭐ ref 추가

  const isDarkTheme = theme === 'black';

  // 테마에 따른 색상
  const searchBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
  const searchBorder = isDarkTheme ? COLORS.primaryDark : COLORS.primary;
  const primaryTextColor = isDarkTheme ? COLORS.textWhite : COLORS.textPrimary;
  const secondaryTextColor = isDarkTheme ? COLORS.textLight : COLORS.textSecondary;
  const menuButtonBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
  const menuButtonIconColor = isDarkTheme ? COLORS.textWhite : COLORS.primary;

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
    // ⭐ BottomSheet만 닫고 키보드는 유지
    if (window.closeBottomSheetOnly) {
      window.closeBottomSheetOnly();
    }
  };

  // ⭐ 검색 버튼 클릭 시 포커스 처리
  const handleSearchButtonPress = () => {
    if (searchText.trim()) {
      // 검색어가 있으면 검색 실행
      handleSearchSubmit();
    } else {
      // 검색어가 없으면 입력창에 포커스
      searchInputRef.current?.focus();
    }
  };

  // ⭐ 검색창 컨테이너 클릭 시 포커스
  const handleSearchContainerPress = () => {
    searchInputRef.current?.focus();
  };

  // ⭐ 전역 함수로 등록 (외부에서 blur 가능)
  React.useEffect(() => {
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
            ref={searchInputRef}  // ⭐ ref 연결
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
        onOpenSettings={handleOpenSettings}
        theme={theme}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
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
    zIndex: 100,        // ⭐ 10 → 100으로 상향 (BottomNav보다 높게)
    elevation: 100,     // ⭐ elevation도 추가
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
    padding: 0,  // ⭐ padding 제거로 터치 영역 최대화
    margin: 0,
  },
  searchButton: {
    marginLeft: 8,
    padding: 4,  // ⭐ 터치 영역 확대
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