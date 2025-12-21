// ============================================
// 📁 src/components/Header/Header.js
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Keyboard, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native'; // ✅ 추가

import COLORS from '../../constants/colors';
import SideMenu from './SideMenu';
import SettingsModal from './SettingsModal';
import LoginSignupModal from './LoginSignupModal';
import MyPageScreen from './UserProfile';
import HelpModal from './HelpModal'; 
import userService from '../../services/userService';
import { getToken } from '../../fcm/fcm'; 

const Header = ({ 
    searchText, setSearchText, onSearch, theme = 'white', onThemeChange,
    relatedSearches = [], onRelatedSearchClick, showRelatedSearches = false, onSearchTextChange 
}) => {
    const navigation = useNavigation();
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMyPage, setShowMyPage] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const [modalMode, setModalMode] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false); 
    
    const searchInputRef = useRef(null); 
    const isDarkTheme = theme === 'black';

    const searchBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
    const primaryTextColor = isDarkTheme ? COLORS.textWhite : COLORS.textPrimary;
    const secondaryTextColor = isDarkTheme ? COLORS.textLight : COLORS.textSecondary;
    const menuButtonBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
    const menuButtonIconColor = isDarkTheme ? COLORS.textWhite : COLORS.primary;

    useEffect(() => { loadUserInfo(); }, []);

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
            setIsLoggedIn(false);
            setUserInfo(null);
        } finally {
            setLoading(false); 
        }
    };

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

    const handleLoginSuccess = async (loginData) => {
        try {
            setShowLoginModal(false);
            setLoading(true);
            await loadUserInfo(); 
            try {
                if (typeof getToken === 'function') {
                    const token = await getToken(); 
                    if (token) await userService.updateFcmToken(token);
                }
            } catch (fcmError) {
                console.log("⚠️ [FCM] 오류 (비차단):", fcmError);
            }

            // ✅ 로그인 시 메인 화면으로 리셋 (초기화)
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home' }], 
                })
            );

        } catch (error) {
            console.error('로그인 후 처리 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuItemPress = (itemId) => {
        if (itemId !== 'settings') setShowSideMenu(false);

        switch (itemId) {
            case 'login':
                setTimeout(() => { setModalMode('login'); setShowLoginModal(true); }, 300);
                break;
            case 'signup':
                setTimeout(() => { setModalMode('signup'); setShowLoginModal(true); }, 300);
                break;
            case 'mypage':
            case 'profile-edit':
                setTimeout(() => setShowMyPage(true), 300);
                break;
            case 'logout':
                handleLogout();
                break;
            case 'settings':
                setShowSettingsModal(true);
                break;
            case 'help': 
                setShowHelpModal(true);
                break;
            case 'interest-location':
                setTimeout(() => setShowMyPage(true), 300);
                break;
        }
    };

    const handleSearchSubmit = () => { Keyboard.dismiss(); onSearch && onSearch(); };

    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={[styles.searchContainer, { backgroundColor: searchBg, borderColor: isDarkTheme ? COLORS.primaryDark : COLORS.primary }]}
                    onPress={() => searchInputRef.current?.focus()}
                    activeOpacity={0.9}
                >
                    <TextInput
                        ref={searchInputRef}
                        style={[styles.searchInput, { color: primaryTextColor }]}
                        placeholder="지역명 또는 대피소 검색"
                        placeholderTextColor={secondaryTextColor}
                        value={searchText}
                        onChangeText={(text) => { setSearchText(text); onSearchTextChange && onSearchTextChange(text); }}
                        onSubmitEditing={handleSearchSubmit}
                        returnKeyType="search"
                    />
                    <TouchableOpacity onPress={handleSearchSubmit} style={styles.searchButton}>
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

            {showRelatedSearches && relatedSearches.length > 0 && (
                <View style={[styles.relatedSearchesContainer, { backgroundColor: searchBg }]}>
                    <FlatList
                        data={relatedSearches}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.relatedSearchItem} onPress={() => onRelatedSearchClick && onRelatedSearchClick(item)}>
                                <Ionicons name="search" size={18} color={secondaryTextColor} style={{ marginRight: 12 }} />
                                <Text style={{ color: primaryTextColor }}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => `related-${index}`}
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
            <SettingsModal visible={showSettingsModal} onClose={() => setShowSettingsModal(false)} currentTheme={theme} onThemeChange={(t) => { onThemeChange(t); setShowSettingsModal(false); }} />
            <LoginSignupModal visible={showLoginModal} initialMode={modalMode} onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
            <MyPageScreen visible={showMyPage} onClose={() => { setShowMyPage(false); loadUserInfo(); }} onLogout={handleLogout} />
            <HelpModal visible={showHelpModal} onClose={() => setShowHelpModal(false)} />
        </>
    );
};

const styles = StyleSheet.create({
    header: { position: 'absolute', top: 20, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, zIndex: 100, elevation: 100 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 18, paddingHorizontal: 12, height: 44, borderWidth: 2, elevation: 4, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
    searchInput: { flex: 1, fontSize: 16, padding: 0, margin: 0 },
    searchButton: { marginLeft: 8, padding: 4 },
    menuButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 12, elevation: 4, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
    relatedSearchesContainer: { position: 'absolute', top: 76, left: 16, right: 72, maxHeight: 300, zIndex: 99, borderRadius: 12, elevation: 8, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    relatedSearchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.1)' },
});

export default Header;