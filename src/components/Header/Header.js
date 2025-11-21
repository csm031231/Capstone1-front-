// ============================================
// 📁 src/components/Header/Header.js (TEST_MODE 제거 버전)
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    Keyboard, 
    Alert, // Alert가 사용되지 않았으나, 메뉴 핸들러에서 사용될 가능성 고려하여 유지
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
    relatedSearches = [], 
    onRelatedSearchClick, 
    showRelatedSearches = false, 
    onSearchTextChange 
}) => {
    // ⚠️ TEST_MODE 조건부 초기값 제거
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false); // 로그인 관련 state 추가
    const [showMyPage, setShowMyPage] = useState(false); // 마이페이지 관련 state 추가
    const [modalMode, setModalMode] = useState('login'); // 로그인 모달 모드 state 추가
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 초기값 false
    const [userInfo, setUserInfo] = useState(null); // 초기값 null
    const [loading, setLoading] = useState(false); // 로딩 state 추가
    
    const searchInputRef = useRef(null); 

    const isDarkTheme = theme === 'black';

    const searchBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
    const searchBorder = isDarkTheme ? COLORS.primaryDark : COLORS.primary;
    const primaryTextColor = isDarkTheme ? COLORS.textWhite : COLORS.textPrimary;
    const secondaryTextColor = isDarkTheme ? COLORS.textLight : COLORS.textSecondary;
    const menuButtonBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
    const menuButtonIconColor = isDarkTheme ? COLORS.textWhite : COLORS.primary;

    // 🔄 초기 사용자 정보 로드 (TEST_MODE 제거)
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

    const handleLogout = async () => {
        try {
            setLoading(true);
            await userService.logout(); // ⚠️ TEST_MODE 조건 제거
            setIsLoggedIn(false);
            setUserInfo(null);
            setShowSideMenu(false);
            setShowMyPage(false);
            // Alert는 필요에 따라 추가
        } catch (error) {
            console.error('로그아웃 실패:', error);
            // Alert.alert('오류', '로그아웃 처리 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = async (loginData) => {
        try {
            setShowLoginModal(false);
            setLoading(true); // ⚠️ TEST_MODE 조건 제거
            await loadUserInfo(); 
            // Alert.alert('성공', '로그인되었습니다.');
        } catch (error) {
            console.error('로그인 후 처리 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuItemPress = (itemId) => {
        // 설정 버튼을 제외하고는 메뉴를 닫음
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
            case 'profile-edit': // 마이페이지/프로필 수정은 MyPageScreen으로 통합
                setTimeout(() => setShowMyPage(true), 300);
                break;
            
            case 'interest-location':
                // Alert.alert('관심지역', '관심지역 설정 화면으로 이동합니다.');
                break;

            case 'logout':
                // 로그아웃 알림은 필요에 따라 Alert.alert로 대체 가능
                handleLogout();
                break;
                
            case 'settings':
                handleOpenSettings();
                break;
            
            case 'help':
                // Alert.alert('도움말', '도움말 및 문의 화면으로 이동합니다.');
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
    
    // ⭐ 검색어 변경 핸들러
    const handleTextChange = (text) => {
        setSearchText(text);
        onSearchTextChange && onSearchTextChange(text);
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

    // ⭐ 전역 함수로 등록 (외부에서 blur 가능)
    useEffect(() => {
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
                        onChangeText={handleTextChange} // ⭐ 변경: 자동완성 트리거
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
                    loadUserInfo(); // ⚠️ TEST_MODE 조건 제거
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
    relatedSearchesContainer: {
        position: 'absolute',
        top: 76, 
        left: 16,
        right: 72, 
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