// ============================================
// 📝 src/components/Header/LoginSignupModal.js (터치 및 자동완성 완벽 수정)
// ============================================
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
  Pressable, // ✅ 박스 전체 터치를 위해 추가
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

  // ✅ 입력창 포커스 제어를 위한 Ref 생성
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);
  const nicknameRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setIsLogin(initialMode === 'login');
      if (initialMode !== (isLogin ? 'login' : 'signup')) {
        setPassword('');
      }
    }
  }, [visible, initialMode]);

  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlePasswordChange = useCallback((value) => setPassword(value), []);
  const handleUsernameChange = useCallback((value) => setUsername(value), []);
  const handleNicknameChange = useCallback((value) => setNickname(value), []);
  const handlePhoneChange = useCallback((value) => setPhone(value), []);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setUsername('');
    setNickname('');
    setPhone('');
    setFocusedField(null);
  }, []);

  const switchMode = useCallback(() => {
    setIsLogin(!isLogin);
    setPassword('');
    setFocusedField(null);
    Keyboard.dismiss();
  }, [isLogin]);

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
      console.log("로그인 에러 상세:", error);
      Alert.alert('로그인 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !username) {
      Alert.alert('오류', '이메일, 비밀번호, 사용자명은 필수 입력사항입니다.');
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

    try {
      setLoading(true);
      const response = await userService.register({
        email,
        password,
        username,
        nickname: nickname || null,
        phone: phone || null
      });
      
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
    } catch (error) {
      Alert.alert('회원가입 실패', error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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
              {isLogin ? '재난안전 서비스에 로그인하세요' : '재난안전 서비스에 가입하세요'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 폼 */}
        <ScrollView 
          style={styles.form} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* 이메일 */}
          <View style={styles.inputGroup}>
            {/* ✅ Pressable로 감싸서 박스 전체 터치 가능하게 변경 */}
            <Pressable 
              style={[
                styles.inputContainer,
                focusedField === 'email' && styles.inputContainerFocused
              ]}
              onPress={() => emailRef.current?.focus()}
            >
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={emailRef} // ✅ ref 연결
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
                onSubmitEditing={() => isLogin ? passwordRef.current?.focus() : usernameRef.current?.focus()}
                
                // ✅ 자동완성 방지 속성 (두 개 같이 눌리는 현상 해결)
                autoComplete="off"
                importantForAutofill="no" 
                textContentType="none"
              />
            </Pressable>
          </View>

          {/* 회원가입 추가 필드 */}
          {!isLogin && (
            <View style={styles.signupSection}>
              <View style={styles.signupHeader}>
                <Ionicons name="person-add" size={20} color={COLORS.primary} />
                <Text style={styles.signupHeaderText}>추가 정보 입력</Text>
              </View>

              <View style={styles.requiredSection}>
                <Text style={styles.sectionLabel}>필수 정보</Text>
                <View style={styles.compactInputGroup}>
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
                      placeholder="사용자명"
                      placeholderTextColor={COLORS.textSecondary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => nicknameRef.current?.focus()}
                      autoComplete="off"
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.optionalSection}>
                <Text style={styles.sectionLabel}>선택 정보</Text>
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
                      placeholder="전화번호 (010-0000-0000)"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      autoComplete="off"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* 비밀번호 */}
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
                returnKeyType="done"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={isLogin ? handleLogin : handleSignup}
                blurOnSubmit={true}
                
                // ✅ 자동완성 및 강력한 비밀번호 추천 끄기
                autoComplete="off"
                importantForAutofill="no"
                textContentType="none"
              />
            </Pressable>
          </View>

          {/* 제출 버튼 */}
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
  // ✅ Pressable로 바뀌어도 스타일은 동일하게 유지
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
    height: '100%', // ✅ 높이 100% 필수 유지
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
  signupSection: {
    marginTop: 8,
  },
  signupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  signupHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  requiredSection: {
    marginBottom: 16,
  },
  optionalSection: {
    backgroundColor: `${COLORS.primary}05`,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default LoginSignupModal;