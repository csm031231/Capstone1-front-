import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  // KeyboardAvoidingView, (사용하지 않음)
  // Platform, (사용하지 않음)
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import userService from '../../services/userService';
import emergencyMessageService from '../../services/emergencyMessageService';

const TEST_MODE = false;

const UserProflile = ({ visible, onClose, onLogout }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [regionLoading, setRegionLoading] = useState(true); // 지역 목록 로딩 상태
  const [availableRegions, setAvailableRegions] = useState([]); // API에서 가져올 지역 목록
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const mockUserData = {
    id: 'test_user_001',
    username: 'testuser',
    nickname: '김해시민',
    email: 'test@kimhae.go.kr',
    phone: '010-1234-5678',
    created_at: '2024-01-15T09:30:00Z',
    current_latitude: 35.2281,
    current_longitude: 128.8890,
    favoriteRegion: '경상남도'
  };

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      let userData = null;
      
      if (TEST_MODE) {
        userData = mockUserData;
      } else {
        // 비동기 호출
        userData = await userService.getUserInfo();
      }
      
      // 사용자 정보 설정
      setUserInfo(userData);
      
      // editData는 userInfo가 확정된 후에 설정
      setEditData({
        username: userData?.username || '',
        nickname: userData?.nickname || '',
        phone: userData?.phone || '',
        email: userData?.email || '',
        favoriteRegion: userData?.favoriteRegion || '',
      });
      
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      if (!TEST_MODE) {
        Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
      }
      setUserInfo(null);
      setEditData({});
    } finally {
      // ✅ 로딩 상태는 모든 상태 업데이트가 완료된 후 가장 마지막에 해제합니다.
      setLoading(false);
    }
  };

  const loadRegions = async () => {
    setRegionLoading(true);
    try {
      const response = await emergencyMessageService.getRegions();
      setAvailableRegions(response.regions || []);
    } catch (error) {
      console.error('지역 목록 로드 실패:', error);
      // Alert.alert('오류', '지역 목록을 불러올 수 없습니다.');
    } finally {
      setRegionLoading(false);
    }
  };
useEffect(() => {
    if (visible) {
      // 모달이 열릴 때만 사용자 정보를 로드하고 로딩 상태를 관리
      loadUserInfo();
      setEditing(false); // 모달이 열릴 때 편집 모드 초기화
    }
    // 'visible'이 의존성 배열에 있으므로, 모달이 열릴 때마다 실행됨
  }, [visible]);
  
  useEffect(() => {
    if (showRegionModal) {
      loadRegions();
    }
  }, [showRegionModal]);
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (TEST_MODE) {
        const updatedUser = { ...mockUserData, ...editData };
        setUserInfo(updatedUser);
        setEditing(false);
        Alert.alert('저장 완료', '정보가 업데이트되었습니다.');
      } else {
        const updatedUser = await userService.updateProfile(editData);
        setUserInfo(updatedUser);
        setEditing(false);
        Alert.alert('성공', '정보가 성공적으로 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('정보 수정 실패:', error);
      if (!TEST_MODE) {
        Alert.alert('오류', '정보 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      TEST_MODE ? 'TEST MODE에서 로그아웃하시겠습니까?' : '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!TEST_MODE) {
                await userService.logout();
              }
              Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
              onClose();
              if (onLogout) onLogout();
            } catch (error) {
              console.error('로그아웃 실패:', error);
              if (!TEST_MODE) {
                Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
              }
            }
          }
        }
      ]
    );
  };

  const handleCancelEdit = () => {
    setEditData({
      username: userInfo?.username || '',
      nickname: userInfo?.nickname || '',
      phone: userInfo?.phone || '',
      email: userInfo?.email || '',
      favoriteRegion: userInfo?.favoriteRegion || '',
    });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('오류', '새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      
      if (TEST_MODE) {
        Alert.alert('성공', '비밀번호가 변경되었습니다.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      } else {
        await userService.changePassword(currentPassword, newPassword);
        Alert.alert('성공', '비밀번호가 성공적으로 변경되었습니다.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      }
    } catch (error) {
      Alert.alert('오류', error.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRegion = async (region) => {
    try {
      setRegionLoading(true);
      
      const newEditData = { ...editData, favoriteRegion: region };
      
      if (TEST_MODE) {
        const updatedUserInfo = { ...userInfo, favoriteRegion: region };
        setUserInfo(updatedUserInfo);
        setEditData(newEditData);
        Alert.alert('성공', `관심지역이 ${region}(으)로 설정되었습니다.`);
        setShowRegionModal(false);
      } else {
        const updatedUser = await userService.updateProfile(newEditData);
        setUserInfo(updatedUser);
        setEditData(newEditData);
        Alert.alert('성공', `관심지역이 ${region}(으)로 설정되었습니다.`);
        setShowRegionModal(false);
      }
    } catch (error) {
      Alert.alert('오류', '관심지역 설정 중 오류가 발생했습니다.');
    } finally {
      setRegionLoading(false);
    }
  };

  const MenuButton = ({ icon, title, description, onPress, color = COLORS.primary }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuButtonIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuButtonContent}>
        <Text style={styles.menuButtonTitle}>{title}</Text>
        <Text style={styles.menuButtonDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const EditField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', icon, secureTextEntry = false }) => (
    <View style={styles.editField}>
      <Text style={styles.editFieldLabel}>{label}</Text>
      <View style={styles.editFieldInputContainer}>
        <Ionicons name={icon} size={20} color={COLORS.textSecondary} style={styles.editFieldIcon} />
        <TextInput
          style={styles.editFieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <TouchableOpacity 
            onPress={() => editing ? handleCancelEdit() : setEditing(true)} 
            style={styles.editButton}
            disabled={loading}
          >
            <Ionicons 
              name={editing ? "close" : "create-outline"} 
              size={24} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>불러오는 중...</Text>
            </View>
          ) : (
            <>
              {/* 프로필 카드 */}
              <View style={styles.section}>
                <View style={styles.profileCard}>
                  <View style={styles.profileHeader}>
                    <View style={styles.profileIconContainer}>
                      <Ionicons name="person" size={40} color={COLORS.primary} />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>
                        {userInfo?.nickname || userInfo?.username || '사용자'}
                      </Text>
                      <Text style={styles.profileEmail}>{userInfo?.email}</Text>
                      {TEST_MODE && (
                        <View style={styles.testModeBadge}>
                          <Ionicons name="construct-outline" size={12} color={COLORS.warning} />
                          <Text style={styles.testModeLabel}>TEST MODE</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {editing ? (
                    <View style={styles.editForm}>
                      <EditField
                        label="사용자명"
                        value={editData.username}
                        onChangeText={(text) => setEditData(prev => ({ ...prev, username: text }))}
                        placeholder="사용자명을 입력하세요"
                        icon="person-outline"
                      />
                      <EditField
                        label="닉네임"
                        value={editData.nickname}
                        onChangeText={(text) => setEditData(prev => ({ ...prev, nickname: text }))}
                        placeholder="닉네임을 입력하세요"
                        icon="happy-outline"
                      />
                      <EditField
                        label="이메일"
                        value={editData.email}
                        onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))}
                        placeholder="이메일을 입력하세요"
                        keyboardType="email-address"
                        icon="mail-outline"
                      />
                      <EditField
                        label="전화번호"
                        value={editData.phone}
                        onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))}
                        placeholder="전화번호를 입력하세요"
                        keyboardType="phone-pad"
                        icon="call-outline"
                      />

                      <View style={styles.editActions}>
                        <TouchableOpacity 
                          style={[styles.editActionButton, styles.cancelButton]} 
                          onPress={handleCancelEdit}
                        >
                          <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.editActionButton, styles.saveButton]} 
                          onPress={handleSave}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 6 }} />
                              <Text style={styles.saveButtonText}>저장</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.profileDetails}>
                      <InfoRow icon="person-outline" label="사용자명" value={userInfo?.username || '미설정'} />
                      <InfoRow icon="happy-outline" label="닉네임" value={userInfo?.nickname || '미설정'} />
                      <InfoRow icon="call-outline" label="전화번호" value={userInfo?.phone || '미설정'} />
                      <InfoRow icon="location-outline" label="관심지역" value={userInfo?.favoriteRegion || '미설정'} />
                      <InfoRow 
                        icon="calendar-outline" 
                        label="가입일" 
                        value={userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('ko-KR') : '미설정'} 
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* 설정 및 기능 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>설정 및 기능</Text>
                </View>
                <MenuButton
                  icon="key-outline"
                  title="비밀번호 변경"
                  description="계정 비밀번호 변경"
                  onPress={() => setShowPasswordModal(true)}
                  color="#ff6b35"
                />
                <MenuButton
                  icon="location-outline"
                  title="관심지역 설정"
                  description={userInfo?.favoriteRegion ? `현재: ${userInfo.favoriteRegion}` : "관심 지역을 설정하세요"}
                  onPress={() => setShowRegionModal(true)}
                  color="#28a745"
                />
                <MenuButton
                  icon="notifications-outline"
                  title="알림 설정"
                  description="재난문자 및 알림 설정"
                  onPress={() => Alert.alert('알림 설정', '알림 설정 화면으로 이동합니다.')}
                  color="#9b7ac9"
                />
              </View>

              {/* 로그아웃 */}
              <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                  <Text style={styles.logoutText}>로그아웃</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSpacing} />
            </>
          )}
        </ScrollView>

        {/* 비밀번호 변경 모달 */}
        <Modal
          visible={showPasswordModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>비밀번호 변경</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <View style={styles.profileCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="key-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>새 비밀번호 입력</Text>
                  </View>

                  <View style={styles.editForm}>
                    <EditField
                      label="현재 비밀번호"
                      value={passwordData.currentPassword}
                      onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                      placeholder="현재 비밀번호를 입력하세요"
                      icon="lock-closed-outline"
                      secureTextEntry
                    />
                    <EditField
                      label="새 비밀번호"
                      value={passwordData.newPassword}
                      onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                      placeholder="새 비밀번호 (최소 6자)"
                      icon="key-outline"
                      secureTextEntry
                    />
                    <EditField
                      label="새 비밀번호 확인"
                      value={passwordData.confirmPassword}
                      onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      icon="checkmark-circle-outline"
                      secureTextEntry
                    />

                    <View style={styles.editActions}>
                      <TouchableOpacity 
                        style={[styles.editActionButton, styles.cancelButton]} 
                        onPress={() => {
                          setShowPasswordModal(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                      >
                        <Text style={styles.cancelButtonText}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.editActionButton, styles.saveButton]} 
                        onPress={handleChangePassword}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.saveButtonText}>변경</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* 관심지역 선택 모달 */}
        <Modal
          visible={showRegionModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowRegionModal(false)}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowRegionModal(false)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>관심지역 설정</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* 현재 설정된 관심지역 */}
              <View style={styles.section}>
                <View style={styles.profileCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>현재 관심지역</Text>
                  </View>
                  
                  <View style={styles.currentRegionContainer}>
                    <View style={styles.currentRegionIcon}>
                      <Ionicons name="pin" size={32} color={COLORS.primary} />
                    </View>
                    <View style={styles.currentRegionInfo}>
                      <Text style={styles.currentRegionLabel}>설정된 지역</Text>
                      <Text style={styles.currentRegionValue}>
                        {userInfo?.favoriteRegion || '설정되지 않음'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 지역 선택 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>지역 선택</Text>
                </View>

                {regionLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={styles.loadingText}>지역 목록 불러오는 중...</Text>
                    </View>
                ) : availableRegions.length === 0 ? (
                    <Text style={styles.emptyRegionText}>지역 목록을 불러올 수 없습니다.</Text>
                ) : (
                    availableRegions.map((region, index) => {
                    const isSelected = userInfo?.favoriteRegion === region;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.regionSelectItem,
                          isSelected && styles.regionSelectItemSelected
                        ]}
                        onPress={() => handleSelectRegion(region)}
                        disabled={regionLoading}
                        activeOpacity={0.7}
                      >
                        <View style={styles.regionSelectLeft}>
                          <View style={[
                            styles.regionSelectIconContainer,
                            isSelected && styles.regionSelectIconContainerSelected
                          ]}>
                            <Ionicons 
                              name={isSelected ? "checkmark-circle" : "location-outline"} 
                              size={20} 
                              color={isSelected ? COLORS.primary : COLORS.textSecondary} 
                            />
                          </View>
                          <Text style={[
                            styles.regionSelectText,
                            isSelected && styles.regionSelectTextSelected
                          ]}>
                            {region}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={styles.regionSelectBadge}>
                            <Text style={styles.regionSelectBadgeText}>선택됨</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={styles.detailIcon} />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  editButton: { padding: 8 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 16 },
  section: { marginBottom: 16 },
  profileCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  profileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  testModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  testModeLabel: { fontSize: 12, color: COLORS.warning, fontWeight: '600', marginLeft: 4 },
  profileDetails: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailIcon: { marginRight: 10 },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  detailValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  editForm: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 },
  editField: { marginBottom: 16 },
  editFieldLabel: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 8, fontWeight: '600' },
  editFieldInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  editFieldIcon: { marginRight: 10 },
  editFieldInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  editActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  editActionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cancelButton: { backgroundColor: COLORS.overlayLight },
  saveButton: { backgroundColor: COLORS.primary },
  cancelButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 8 },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuButtonContent: { flex: 1 },
  menuButtonTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  menuButtonDescription: { fontSize: 13, color: COLORS.textSecondary },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.error}10`,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '600', marginLeft: 8 },
  bottomSpacing: { height: 40 },
  currentRegionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${COLORS.primary}05`,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  currentRegionIcon: {
    marginRight: 12,
  },
  currentRegionInfo: {
    flex: 1,
  },
  currentRegionLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  currentRegionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  regionSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  regionSelectItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  regionSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionSelectIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: COLORS.background,
  },
  regionSelectIconContainerSelected: {
    backgroundColor: '#fff',
  },
  regionSelectText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  regionSelectTextSelected: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  regionSelectBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  regionSelectBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  emptyRegionText: {
    textAlign: 'center',
    padding: 30,
    color: COLORS.textSecondary,
  }
});

export default UserProflile;