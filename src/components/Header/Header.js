// ============================================
// 📁 src/components/Header/Header.js (최종 병합본)
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    Keyboard, 
    Text, 
    FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import SideMenu from './SideMenu';
import SettingsModal from './SettingsModal';
import LoginSignupModal from './LoginSignupModal';
import MyPageScreen from './UserProfile';
import userService from '../../services/userService';

const Header = ({ 
    searchText, 
    setSearchText, 
    onSearch, 
    theme = 'white', 
    onThemeChange,
    relatedSearches = [], // ⭐ 관련 검색어 목록 (자동완성 기능)
    onRelatedSearchClick, // ⭐ 관련 검색어 클릭 핸들러 (자동완성 기능)
    showRelatedSearches = false, // ⭐ 관련 검색어 표시 여부 (자동완성 기능)
    onSearchTextChange // ⭐ 검색어 입력 시 호출되는 함수 (자동완성 기능)
}) => {
    // 1. 메뉴 및 모달 상태
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMyPage, setShowMyPage] = useState(false);
    const [modalMode, setModalMode] = useState('login');
    
    // 2. 사용자 인증 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false); // 로딩 상태
    
    const searchInputRef = useRef(null); 

    const isDarkTheme = theme === 'black';

    // 🎨 테마에 따른 색상 정의
    const searchBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
    const searchBorder = isDarkTheme ? COLORS.primaryDark : COLORS.primary;
    const primaryTextColor = isDarkTheme ? COLORS.textWhite : COLORS.textPrimary;
    const secondaryTextColor = isDarkTheme ? COLORS.textLight : COLORS.textSecondary;
    const menuButtonBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
    const menuButtonIconColor = isDarkTheme ? COLORS.textWhite : COLORS.primary;

    // 🔄 초기 사용자 정보 로드 (마운트 시)
    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
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
            setLoading(false); 
        }
    };

    // 🚪 로그아웃 처리
    const handleLogout = async () => {
        try {
            setLoading(true);
            await userService.logout();
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

    // ✅ 로그인 성공 처리 (모달 닫고 사용자 정보 다시 로드)
    const handleLoginSuccess = async (loginData) => {
        try {
            setShowLoginModal(false);
            setLoading(true);
            await loadUserInfo(); 
        } catch (error) {
            console.error('로그인 후 처리 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🛠️ 사이드 메뉴 항목 클릭 처리
    const handleMenuItemPress = (itemId) => {
        if (itemId !== 'settings') {
            setShowSideMenu(false);
        }

        switch (itemId) {
            case 'login':
                setTimeout(() => {
                    setModalMode('login');
                    setShowLoginModal(true);
                }, 300);
                break;
                
            case 'signup':
                setTimeout(() => {
                    setModalMode('signup');
                    setShowLoginModal(true);
                }, 300);
                break;
                
            case 'mypage':
            case 'profile-edit':
                setTimeout(() => setShowMyPage(true), 300);
                break;
            
            case 'interest-location':
                // 관심 지역 관련 로직 추가
                break;

            case 'logout':
                handleLogout();
                break;
                
            case 'settings':
                handleOpenSettings();
                break;
            
            case 'help':
                // 도움말 관련 로직 추가
                break;
                
            default:
                console.log('Unknown menu item:', itemId);
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
    
    // 🔎 검색어 입력 변경 처리 (자동완성 트리거)
    const handleTextChange = (text) => {
        setSearchText(text);
        onSearchTextChange && onSearchTextChange(text); // 외부에서 관련 검색어 로드
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

    // 윈도우 객체에 검색 입력 필드 blur 함수 등록 (외부 제어를 위함)
    useEffect(() => {
        window.blurSearchInput = () => {
            searchInputRef.current?.blur();
        };
        return () => {
            delete window.blurSearchInput;
        };
    }, []);

    // 💡 관련 검색어 항목 렌더링 함수
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
            {/* 🔍 헤더 메인 UI */}
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
                        onChangeText={handleTextChange} // 자동완성 트리거
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

            {/* ⭐ 관련 검색어 리스트 (자동완성 드롭다운) */}
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

            {/* 🚪 사이드 메뉴 및 모달 */}
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
                    loadUserInfo(); // 마이페이지에서 정보 변경 후 새로고침
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
    // 관련 검색어 컨테이너 스타일
    relatedSearchesContainer: {
        position: 'absolute',
        top: 76, // header 바로 아래 위치
        left: 16,
        right: 72, // 메뉴 버튼 공간 제외
        maxHeight: 300, 
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