import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import userService from '../../services/userService';

const LoginSignupModal = ({ visible, initialMode = 'login', onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // 입력 필드 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  // 관심지역 관련 상태
  const [availableRegions, setAvailableRegions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(false);

  // 입력창 포커스 제어를 위한 Ref
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);
  const nicknameRef = useRef(null);
  const phoneRef = useRef(null);

  // 초기 모드 설정
  useEffect(() => {
    if (visible) {
      setIsLogin(initialMode === 'login');
      if (initialMode !== (isLogin ? 'login' : 'signup')) {
        setPassword('');
      }
    }
  }, [visible, initialMode]);

  // 회원가입 모드일 때 지역 목록 로드
  useEffect(() => {
    if (!isLogin && visible && availableRegions.length === 0) {
      loadRegions();
    }
  }, [isLogin, visible]);

  const loadRegions = async () => {
    try {
      setRegionsLoading(true);
      const regions = await userService.getProvinces();
      setAvailableRegions(regions || []);
    } catch (error) {
      console.error('지역 목록 로드 실패:', error);
      setAvailableRegions([]);
    } finally {
      setRegionsLoading(false);
    }
  };

  // 입력 핸들러
  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlePasswordChange = useCallback((value) => setPassword(value), []);
  const handleUsernameChange = useCallback((value) => setUsername(value), []);
  const handleNicknameChange = useCallback((value) => setNickname(value), []);
  const handlePhoneChange = useCallback((value) => setPhone(value), []);

  const handleToggleRegionList = useCallback(() => {
    setIsRegionsExpanded(prev => !prev);
  }, []);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setUsername('');
    setNickname('');
    setPhone('');
    setSelectedRegions([]);
    setFocusedField(null);
    setIsRegionsExpanded(false);
  }, []);

  const switchMode = useCallback(() => {
    setIsLogin(!isLogin);
    setPassword('');
    setFocusedField(null);
    setIsRegionsExpanded(false);
    Keyboard.dismiss();
  }, [isLogin]);

  // 로그인 로직
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.login(email, password);
      resetForm();
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
    } catch (error) {
      console.log("로그인 에러:", error);
      Alert.alert('로그인 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 로직
  const handleSignup = async () => {
    // 필수값 체크
    if (!email || !password || !username) {
      Alert.alert('오류', '사용자명, 이메일, 비밀번호는 필수 입력사항입니다.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    // 관심지역 미선택 시 확인창
    if (selectedRegions.length === 0) {
      Alert.alert(
        '관심지역 미설정',
        '관심지역을 설정하지 않으셨습니다.\n나중에 마이페이지에서 설정하실 수 있습니다.\n\n계속 진행하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '계속', onPress: () => performSignup() }
        ]
      );
      return;
    }

    await performSignup();
  };

  // 실제 회원가입 실행 (가입 -> 로그인 -> 지역설정)
  const performSignup = async () => {
    try {
      setLoading(true);
      
      // 1. 회원가입
      await userService.register({
        email,
        password,
        username,
        nickname: nickname || null,
        phone: phone || null
      });
      
      // 2. 관심지역 설정이 있는 경우: 자동 로그인 후 지역 설정
      if (selectedRegions.length > 0) {
        try {
          const loginResponse = await userService.login(email, password);
          const regionResult = await userService.bulkAddInterestRegions(selectedRegions);
          
          Alert.alert(
            '회원가입 완료!', 
            `계정이 생성되었고 ${regionResult.success_count}개의 관심지역이 설정되었습니다!`,
            [{
              text: '시작하기',
              onPress: () => {
                resetForm();
                if (onLoginSuccess) onLoginSuccess(loginResponse);
              }
            }]
          );
        } catch (regionError) {
          console.error('관심지역 설정 실패:', regionError);
          Alert.alert(
            '회원가입 완료', 
            '계정은 생성되었으나 관심지역 설정에 실패했습니다.\n로그인 후 마이페이지에서 다시 설정해주세요.',
            [{
              text: '로그인하기',
              onPress: () => {
                setIsLogin(true);
                setPassword('');
              }
            }]
          );
        }
      } else {
        Alert.alert(
          '회원가입 성공', 
          '계정이 성공적으로 생성되었습니다!\n이제 로그인해주세요.', 
          [{
            text: '로그인하기',
            onPress: () => {
              setIsLogin(true);
              setPassword('');
            }
          }]
        );
      }
    } catch (error) {
      Alert.alert('회원가입 실패', error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegion = (regionId) => {
    setSelectedRegions(prev => {
      if (prev.includes(regionId)) {
        return prev.filter(id => id !== regionId);
      } else {
        return [...prev, regionId];
      }
    });
  };

  const handleClose = () => {
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{isLogin ? '로그인' : '회원가입'}</Text>
            <Text style={styles.subtitle}>
              {isLogin ? '재난안전 서비스에 로그인하세요' : '새 계정을 생성하세요'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 폼 영역 */}
        <ScrollView 
          style={styles.form} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* ✅ 1. 사용자명 (회원가입 시 가장 먼저 표시) */}
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Pressable 
                style={[
                  styles.inputContainer,
                  focusedField === 'username' && styles.inputContainerFocused
                ]}
                onPress={() => usernameRef.current?.focus()}
              >
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={usernameRef}
                  style={styles.input}
                  value={username}
                  onChangeText={handleUsernameChange}
                  placeholder="사용자명 (필수)"
                  placeholderTextColor={COLORS.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  // 다음: 이메일로 이동
                  onSubmitEditing={() => emailRef.current?.focus()}
                  autoComplete="off"
                />
              </Pressable>
            </View>
          )}

          {/* ✅ 2. 이메일 (공통) */}
          <View style={styles.inputGroup}>
            <Pressable 
              style={[
                styles.inputContainer,
                focusedField === 'email' && styles.inputContainerFocused
              ]}
              onPress={() => emailRef.current?.focus()}
            >
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
                autoCorrect={false}
                returnKeyType="next"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                // 다음: 비밀번호로 이동
                onSubmitEditing={() => passwordRef.current?.focus()}
                autoComplete="off"
                importantForAutofill="no" 
                textContentType="none"
              />
            </Pressable>
          </View>

          {/* ✅ 3. 비밀번호 (공통) */}
          <View style={styles.inputGroup}>
            <Pressable 
              style={[
                styles.inputContainer,
                focusedField === 'password' && styles.inputContainerFocused
              ]}
              onPress={() => passwordRef.current?.focus()}
            >
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
                autoCorrect={false}
                returnKeyType={isLogin ? "done" : "next"}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                // 로그인: 제출 / 회원가입: 닉네임으로 이동
                onSubmitEditing={isLogin ? handleLogin : () => nicknameRef.current?.focus()}
                blurOnSubmit={isLogin}
                autoComplete="off"
                importantForAutofill="no"
                textContentType="none"
              />
            </Pressable>
          </View>

          {/* ✅ 4. 선택 정보 섹션 (회원가입 전용) */}
          {!isLogin && (
            <View style={styles.signupSection}>
              <View style={styles.signupHeader}>
                <Ionicons name="options-outline" size={18} color={COLORS.primary} />
                <Text style={styles.signupHeaderText}>선택 추가 정보</Text>
              </View>

              <View style={styles.optionalSection}>
                {/* 닉네임 */}
                <View style={styles.compactInputGroup}>
                  <Pressable 
                    style={[
                      styles.inputContainer,
                      focusedField === 'nickname' && styles.inputContainerFocused
                    ]}
                    onPress={() => nicknameRef.current?.focus()}
                  >
                    <Ionicons name="happy-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      ref={nicknameRef}
                      style={styles.input}
                      value={nickname}
                      onChangeText={handleNicknameChange}
                      placeholder="닉네임 (선택사항)"
                      placeholderTextColor={COLORS.textSecondary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onFocus={() => setFocusedField('nickname')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => phoneRef.current?.focus()}
                      autoComplete="off"
                    />
                  </Pressable>
                </View>

                {/* 전화번호 */}
                <View style={[styles.compactInputGroup, { marginBottom: 0 }]}>
                  <Pressable 
                    style={[
                      styles.inputContainer,
                      focusedField === 'phone' && styles.inputContainerFocused
                    ]}
                    onPress={() => phoneRef.current?.focus()}
                  >
                    <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      ref={phoneRef}
                      style={styles.input}
                      value={phone}
                      onChangeText={handlePhoneChange}
                      placeholder="전화번호 (선택사항)"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => Keyboard.dismiss()} 
                      autoComplete="off"
                    />
                  </Pressable>
                </View>
              </View>

              {/* ✅ 5. 관심지역 선택 (아코디언 형태) */}
              <View style={styles.regionSelectionContainer}>
                {/* 토글 버튼 */}
                <TouchableOpacity 
                  style={styles.regionToggleHeader} 
                  onPress={handleToggleRegionList}
                  activeOpacity={0.7}
                >
                  <View style={styles.regionToggleLeft}>
                    <Ionicons name="location-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.regionToggleText}>관심지역 선택 (선택사항)</Text>
                  </View>
                  <View style={styles.regionToggleRight}>
                    {selectedRegions.length > 0 && (
                      <View style={styles.selectedRegionsBadge}>
                        <Text style={styles.selectedRegionsText}>
                          {selectedRegions.length}개
                        </Text>
                      </View>
                    )}
                    <Ionicons 
                      name={isRegionsExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={COLORS.textSecondary} 
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </TouchableOpacity>

                {/* 지역 목록 */}
                {isRegionsExpanded && (
                  <View style={styles.regionListContainer}>
                    {regionsLoading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 12 }} />
                    ) : (
                      <View style={styles.regionList}>
                        {availableRegions.map((region) => {
                          const isSelected = selectedRegions.includes(region.id);
                          return (
                            <TouchableOpacity
                              key={region.id}
                              style={[
                                styles.regionItem,
                                isSelected && styles.regionItemSelected
                              ]}
                              onPress={() => handleToggleRegion(region.id)}
                              activeOpacity={0.7}
                            >
                              <Ionicons 
                                name={isSelected ? "checkbox" : "square-outline"} 
                                size={20} 
                                color={isSelected ? COLORS.primary : COLORS.textSecondary} 
                                style={styles.regionCheckbox}
                              />
                              <Text style={[
                                styles.regionName,
                                isSelected && styles.regionNameSelected
                              ]}>
                                {region.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 버튼 영역 */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={isLogin ? handleLogin : handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons 
                  name={isLogin ? "log-in-outline" : "person-add-outline"} 
                  size={20} 
                  color="#fff" 
                  style={styles.submitBtnIcon} 
                />
                <Text style={styles.submitBtnText}>
                  {isLogin ? '로그인' : '회원가입'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleDesc}>
              {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            </Text>
            <TouchableOpacity
              onPress={switchMode}
              disabled={loading}
              activeOpacity={0.7}
              style={styles.toggleBtnContainer}
            >
              <Text style={styles.toggleBtn}>
                {isLogin ? '회원가입하기' : '로그인하기'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  compactInputGroup: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: '100%',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnIcon: {
    marginRight: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  toggleContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  toggleDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  toggleBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 6,
  },
  
  // --- 회원가입 추가 섹션 스타일 ---
  signupSection: {
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  signupHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionalSection: {
    backgroundColor: `${COLORS.primary}05`, 
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
    marginBottom: 16,
  },
  
  // --- 관심지역 토글 스타일 ---
  regionSelectionContainer: {
    backgroundColor: COLORS.surface, 
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden', 
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  regionToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  regionToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  regionToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedRegionsBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  selectedRegionsText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  regionListContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: 250, 
  },
  regionList: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', 
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  regionItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  regionCheckbox: {
    marginRight: 8,
  },
  regionName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  regionNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LoginSignupModal;