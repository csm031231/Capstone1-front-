// ============================================
// 📁 src/components/Header/LoginSignupModal.js
// ============================================
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform, Keyboard, Pressable, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import userService from '../../services/userService';

const LoginSignupModal = ({ visible, initialMode = 'login', onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  const [availableRegions, setAvailableRegions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(false);

  // 스크롤 제어용 Ref
  const scrollViewRef = useRef(null);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);
  const nicknameRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setIsLogin(initialMode === 'login');
      if (initialMode !== (isLogin ? 'login' : 'signup')) setPassword('');
    }
  }, [visible, initialMode]);

  useEffect(() => {
    if (!isLogin && visible && availableRegions.length === 0) loadRegions();
  }, [isLogin, visible]);

  const loadRegions = async () => {
    try {
      setRegionsLoading(true);
      const regions = await userService.getProvinces();
      setAvailableRegions(regions || []);
    } catch (error) {
      setAvailableRegions([]);
    } finally {
      setRegionsLoading(false);
    }
  };

  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlePasswordChange = useCallback((value) => setPassword(value), []);
  const handleUsernameChange = useCallback((value) => setUsername(value), []);
  const handleNicknameChange = useCallback((value) => setNickname(value), []);
  const handlePhoneChange = useCallback((value) => setPhone(value), []);

  const handleToggleRegionList = useCallback(() => setIsRegionsExpanded(prev => !prev), []);

  const resetForm = useCallback(() => {
    setEmail(''); setPassword(''); setUsername(''); setNickname(''); setPhone('');
    setSelectedRegions([]); setFocusedField(null); setIsRegionsExpanded(false);
  }, []);

  const switchMode = useCallback(() => {
    setIsLogin(!isLogin); setPassword(''); setFocusedField(null); setIsRegionsExpanded(false);
    Keyboard.dismiss();
  }, [isLogin]);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.'); return; }
    try {
      setLoading(true);
      const response = await userService.login(email, password);
      resetForm();
      if (onLoginSuccess) onLoginSuccess(response);
    } catch (error) {
      Alert.alert('로그인 실패', error.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !username) { Alert.alert('오류', '필수 정보를 입력해주세요.'); return; }
    if (selectedRegions.length === 0) {
      Alert.alert('관심지역 미설정', '계속 진행하시겠습니까?', [{ text: '취소', style: 'cancel' }, { text: '계속', onPress: () => performSignup() }]);
      return;
    }
    await performSignup();
  };

  const performSignup = async () => {
    try {
      setLoading(true);
      await userService.register({ email, password, username, nickname: nickname || null, phone: phone || null });
      if (selectedRegions.length > 0) {
         try {
            await userService.login(email, password);
            await userService.bulkAddInterestRegions(selectedRegions);
            await userService.logout();
         } catch (e) {}
      }
      Alert.alert('회원가입 성공', '계정이 생성되었습니다. 로그인해주세요.', [{ 
          text: '확인', onPress: () => { setIsLogin(true); const cur = email; resetForm(); setEmail(cur); }
      }]);
    } catch (error) {
      Alert.alert('회원가입 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegion = (regionId) => {
    setSelectedRegions(prev => prev.includes(regionId) ? prev.filter(id => id !== regionId) : [...prev, regionId]);
  };

  const handleClose = () => { Keyboard.dismiss(); resetForm(); onClose(); };

  // 화면 스크롤 이동 함수
  const scrollToInput = (yPosition) => {
    if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
            y: yPosition,
            animated: true
        });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{isLogin ? '로그인' : '회원가입'}</Text>
            <Text style={styles.subtitle}>{isLogin ? '재난안전 서비스에 로그인하세요' : '새 계정을 생성하세요'}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.form} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Pressable style={[styles.inputContainer, focusedField === 'username' && styles.inputContainerFocused]} onPress={() => usernameRef.current?.focus()}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput 
                    ref={usernameRef} 
                    style={styles.input} 
                    value={username} 
                    onChangeText={handleUsernameChange} 
                    placeholder="사용자명 (필수)" 
                    placeholderTextColor={COLORS.textSecondary} 
                    autoCapitalize="none" 
                    returnKeyType="next" 
                    // ✅ 사용자명: 맨 위로 (0)
                    onFocus={() => { setFocusedField('username'); scrollToInput(0); }} 
                    onBlur={() => setFocusedField(null)} 
                    onSubmitEditing={() => emailRef.current?.focus()} 
                />
              </Pressable>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Pressable style={[styles.inputContainer, focusedField === 'email' && styles.inputContainerFocused]} onPress={() => emailRef.current?.focus()}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput 
                  ref={emailRef} 
                  style={styles.input} 
                  value={email} 
                  onChangeText={handleEmailChange} 
                  placeholder="이메일 주소" 
                  placeholderTextColor={COLORS.textSecondary} 
                  keyboardType="email-address" 
                  autoCapitalize="none" 
                  returnKeyType="next" 
                  // ✅ 이메일: 로그인 화면의 맨 위이므로 스크롤 안 함 (0)
                  onFocus={() => { setFocusedField('email'); scrollToInput(0); }} 
                  onBlur={() => setFocusedField(null)} 
                  onSubmitEditing={() => passwordRef.current?.focus()} 
               />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Pressable style={[styles.inputContainer, focusedField === 'password' && styles.inputContainerFocused]} onPress={() => passwordRef.current?.focus()}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput 
                  ref={passwordRef} 
                  style={styles.input} 
                  value={password} 
                  onChangeText={handlePasswordChange} 
                  placeholder={isLogin ? "비밀번호" : "비밀번호 (최소 6자)"} 
                  placeholderTextColor={COLORS.textSecondary} 
                  secureTextEntry 
                  autoCapitalize="none" 
                  returnKeyType={isLogin ? "done" : "next"} 
                  // ✅ 비밀번호: 역시 위쪽이므로 스크롤 거의 안 함 (0) - 그래야 안 잘림
                  onFocus={() => { setFocusedField('password'); scrollToInput(0); }} 
                  onBlur={() => setFocusedField(null)} 
                  onSubmitEditing={isLogin ? handleLogin : () => nicknameRef.current?.focus()} 
              />
            </Pressable>
          </View>

          {!isLogin && (
            <View style={styles.signupSection}>
              <View style={styles.signupHeader}>
                <Ionicons name="options-outline" size={18} color={COLORS.primary} />
                <Text style={styles.signupHeaderText}>선택 추가 정보</Text>
              </View>
              <View style={styles.optionalSection}>
                <View style={styles.compactInputGroup}>
                  <Pressable style={[styles.inputContainer, focusedField === 'nickname' && styles.inputContainerFocused]} onPress={() => nicknameRef.current?.focus()}>
                    <Ionicons name="happy-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput 
                        ref={nicknameRef} 
                        style={styles.input} 
                        value={nickname} 
                        onChangeText={handleNicknameChange} 
                        placeholder="닉네임 (선택사항)" 
                        placeholderTextColor={COLORS.textSecondary} 
                        returnKeyType="next" 
                        // ✅ 닉네임: 여기서부터는 아래쪽이라 스크롤 올림 (150)
                        onFocus={() => { setFocusedField('nickname'); scrollToInput(150); }} 
                        onBlur={() => setFocusedField(null)} 
                        onSubmitEditing={() => phoneRef.current?.focus()} 
                    />
                  </Pressable>
                </View>
                <View style={[styles.compactInputGroup, { marginBottom: 0 }]}>
                  <Pressable style={[styles.inputContainer, focusedField === 'phone' && styles.inputContainerFocused]} onPress={() => phoneRef.current?.focus()}>
                    <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput 
                        ref={phoneRef} 
                        style={styles.input} 
                        value={phone} 
                        onChangeText={handlePhoneChange} 
                        placeholder="전화번호 (선택사항)" 
                        placeholderTextColor={COLORS.textSecondary} 
                        keyboardType="phone-pad" 
                        returnKeyType="done" 
                        // ✅ 전화번호: 맨 아래이므로 많이 올림 (300)
                        onFocus={() => { setFocusedField('phone'); scrollToInput(300); }} 
                        onBlur={() => setFocusedField(null)} 
                        onSubmitEditing={() => Keyboard.dismiss()} 
                    />
                  </Pressable>
                </View>
              </View>
              <View style={styles.regionSelectionContainer}>
                <TouchableOpacity style={styles.regionToggleHeader} onPress={handleToggleRegionList} activeOpacity={0.7}>
                  <View style={styles.regionToggleLeft}>
                    <Ionicons name="location-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.regionToggleText}>관심지역 선택 (선택사항)</Text>
                  </View>
                  <View style={styles.regionToggleRight}>
                    {selectedRegions.length > 0 && <View style={styles.selectedRegionsBadge}><Text style={styles.selectedRegionsText}>{selectedRegions.length}개</Text></View>}
                    <Ionicons name={isRegionsExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} style={{ marginLeft: 8 }} />
                  </View>
                </TouchableOpacity>
                {isRegionsExpanded && (
                  <View style={styles.regionListContainer}>
                    {regionsLoading ? <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 12 }} /> : (
                      <ScrollView nestedScrollEnabled={true} style={styles.regionScrollView} contentContainerStyle={styles.regionScrollContent} persistentScrollbar={true} showsVerticalScrollIndicator={true}>
                        <View style={styles.regionList}>
                          {availableRegions.map((region) => {
                            const isSelected = selectedRegions.includes(region.id);
                            return (
                              <TouchableOpacity key={region.id} style={[styles.regionItem, isSelected && styles.regionItemSelected]} onPress={() => handleToggleRegion(region.id)} activeOpacity={0.7}>
                                <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={20} color={isSelected ? COLORS.primary : COLORS.textSecondary} style={styles.regionCheckbox} />
                                <Text style={[styles.regionName, isSelected && styles.regionNameSelected]}>{region.name}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </ScrollView>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={isLogin ? handleLogin : handleSignup} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : (
              <>
                <Ionicons name={isLogin ? "log-in-outline" : "person-add-outline"} size={20} color="#fff" style={styles.submitBtnIcon} />
                <Text style={styles.submitBtnText}>{isLogin ? '로그인' : '회원가입'}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleDesc}>{isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}</Text>
            <TouchableOpacity onPress={switchMode} disabled={loading} activeOpacity={0.7} style={styles.toggleBtnContainer}>
              <Text style={styles.toggleBtn}>{isLogin ? '회원가입하기' : '로그인하기'}</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerContent: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.overlayLight, justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
  form: { flex: 1 },
  formContent: { padding: 24, paddingTop: 32, paddingBottom: 250 }, // 키보드 여백 충분히 확보
  inputGroup: { marginBottom: 20 },
  compactInputGroup: { marginBottom: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, height: 52 },
  inputContainerFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.surface, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary, fontWeight: '500', paddingVertical: 0, paddingHorizontal: 0, height: '100%' },
  submitBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnIcon: { marginRight: 8 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  toggleContainer: { marginTop: 32, alignItems: 'center' },
  toggleDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  toggleBtnContainer: { flexDirection: 'row', alignItems: 'center' },
  toggleBtn: { fontSize: 16, color: COLORS.primary, fontWeight: '600', marginRight: 6 },
  signupSection: { marginTop: 8, marginBottom: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  signupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  signupHeaderText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  optionalSection: { backgroundColor: `${COLORS.primary}05`, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: `${COLORS.primary}10`, marginBottom: 16 },
  regionSelectionContainer: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  regionToggleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.surface },
  regionToggleLeft: { flexDirection: 'row', alignItems: 'center' },
  regionToggleText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  regionToggleRight: { flexDirection: 'row', alignItems: 'center' },
  selectedRegionsBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  selectedRegionsText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  regionListContainer: { borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background },
  regionScrollView: { maxHeight: 300 },
  regionScrollContent: { flexGrow: 1 },
  regionList: { padding: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  regionItem: { flexDirection: 'row', alignItems: 'center', width: '48%', backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  regionItemSelected: { backgroundColor: `${COLORS.primary}10`, borderColor: COLORS.primary },
  regionCheckbox: { marginRight: 8 },
  regionName: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  regionNameSelected: { color: COLORS.primary, fontWeight: '700' },
});

export default LoginSignupModal;