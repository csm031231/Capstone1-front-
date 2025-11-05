// ============================================
// 📝 src/components/Header/Header.js (자동완성 검색어 기능)
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Keyboard, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import SideMenu from './SideMenu';
import SettingsModal from './SettingsModal';

const Header = ({ 
  searchText, 
  setSearchText, 
  onSearch, 
  theme = 'white', 
  onThemeChange,
  relatedSearches = [],  // ⭐ 관련 검색어 목록
  onRelatedSearchClick,  // ⭐ 관련 검색어 클릭 핸들러
  showRelatedSearches = false,  // ⭐ 관련 검색어 표시 여부
  onSearchTextChange  // ⭐ 검색어 입력 시 호출되는 함수
}) => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const searchInputRef = useRef(null);

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
    if (window.closeBottomSheetOnly) {
      window.closeBottomSheetOnly();
    }
  };

  // ⭐ 검색어 입력 시 자동완성 트리거
  const handleTextChange = (text) => {
    setSearchText(text);
    // 검색어가 변경될 때마다 자동완성 검색
    if (onSearchTextChange) {
      onSearchTextChange(text);
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

  React.useEffect(() => {
    window.blurSearchInput = () => {
      searchInputRef.current?.blur();
    };
    return () => {
      delete window.blurSearchInput;
    };
  }, []);

  // ⭐ 관련 검색어 항목 렌더링
  const renderRelatedSearchItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.relatedSearchItem,
        { backgroundColor: searchBg }
      ]}
      onPress={() => onRelatedSearchClick && onRelatedSearchClick(item)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="search" 
        size={18} 
        color={secondaryTextColor} 
        style={styles.searchIcon}
      />
      <Text 
        style={[styles.relatedSearchText, { color: primaryTextColor }]}
        numberOfLines={1}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

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
            onChangeText={handleTextChange}  // ⭐ 변경: 자동완성 트리거
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

      {/* ⭐ 관련 검색어 리스트 (자동완성 스타일) */}
      {showRelatedSearches && relatedSearches && relatedSearches.length > 0 && (
        <View style={[
          styles.relatedSearchesContainer,
          { backgroundColor: searchBg }
        ]}>
          <FlatList
            data={relatedSearches}
            renderItem={renderRelatedSearchItem}
            keyExtractor={(item, index) => `related-${index}`}
            scrollEnabled={true}
            maxToRenderPerBatch={10}
            style={[
              styles.relatedSearchesList,
              { 
                borderColor: isDarkTheme ? COLORS.primaryDark : COLORS.primary,
              }
            ]}
          />
        </View>
      )}

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
  // ⭐ 관련 검색어 컨테이너 (자동완성 스타일)
  relatedSearchesContainer: {
    position: 'absolute',
    top: 76, // header 바로 아래
    left: 16,
    right: 72, // 메뉴 버튼 공간 제외
    maxHeight: 300, // ⭐ 최대 높이 제한
    zIndex: 99,
    borderRadius: 12,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  relatedSearchesList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  relatedSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  relatedSearchText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
  },
});

export default Header;