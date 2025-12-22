// ============================================
// 📁 src/components/Header/UserProfile.js
// ============================================
import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, 
    ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import userService from '../../services/userService';

// ✅ [핵심 수정] 렌더링 최적화를 위해 헬퍼 컴포넌트들을 메인 컴포넌트 밖으로 뺐습니다.
// 이렇게 해야 입력할 때 포커스가 끊기지 않습니다.

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

const InfoRow = ({ icon, label, value, isMultiline = false }) => (
    <View style={[styles.detailRow, isMultiline && styles.detailRowMultiline]}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={styles.detailIcon} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, isMultiline && styles.detailValueMultiline]}>
        {value}
      </Text>
    </View>
);

// ===== 메인 컴포넌트 =====
const UserProfile = ({ visible, onClose, onLogout }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [regionLoading, setRegionLoading] = useState(false); 
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [userInterestRegions, setUserInterestRegions] = useState([]); 
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (visible) {
      loadUserInfo();
      loadUserInterestRegions(); 
      setEditing(false); 
    }
  }, [visible]);

  useEffect(() => {
    if (showRegionModal) {
      loadAvailableProvinces(); 
      setSelectedRegions(userInterestRegions.map(r => r.region_id));
    }
  }, [showRegionModal]);

  const loadUserInfo = async () => {
    try {
        setLoading(true);
        const data = await userService.getUserInfo();
        setUserInfo(data);
        setEditData({
            username: data?.username || '',
            nickname: data?.nickname || '',
            phone: data?.phone || '',
            email: data?.email || '',
        });
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
    } finally {
        setLoading(false);
    }
  };
  
  const loadUserInterestRegions = async () => {
    try {
        const regionData = await userService.getInterestRegions();
        setUserInterestRegions(regionData.regions || []);
    } catch (error) {
        setUserInterestRegions([]);
    }
  };

  const loadAvailableProvinces = async () => {
      try {
          setRegionLoading(true);
          const provinces = await userService.getProvinces();
          setAvailableProvinces(provinces || []);
      } catch (error) {
          setAvailableProvinces([]);
      } finally {
          setRegionLoading(false);
      }
  };

  const handleLogout = () => {
      Alert.alert(
        '로그아웃',
        '정말 로그아웃 하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '로그아웃', 
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await userService.logout();
                onClose(); 
                if (onLogout) onLogout(); 
              } catch (error) {
                console.error('로그아웃 에러:', error);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            '회원 탈퇴',
            '정말 탈퇴하시겠습니까? 모든 정보가 삭제됩니다.',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '네', 
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        await userService.deleteAccount();
                        setLoading(false);
                        Alert.alert('탈퇴 완료', '회원 탈퇴가 완료되었습니다.', [
                            {
                                text: '확인',
                                onPress: () => {
                                    onClose(); 
                                    if (onLogout) onLogout(); 
                                }
                            }
                        ]);
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        try {
          setLoading(true);
          const updatePayload = {
            username: editData.username,
            email: editData.email,
            nickname: editData.nickname,
            phone: editData.phone,
          };
          const updatedUser = await userService.updateProfile(updatePayload);
          if (updatedUser) {
            setUserInfo(updatedUser);
            setEditing(false);
            Alert.alert('성공', '프로필이 업데이트되었습니다.');
          }
        } catch (error) {
          Alert.alert('오류', '정보 수정 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditData({
          username: userInfo?.username || '',
          nickname: userInfo?.nickname || '',
          phone: userInfo?.phone || '',
          email: userInfo?.email || '',
        });
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }
        try {
            setLoading(true);
            await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            Alert.alert('성공', '비밀번호가 변경되었습니다.');
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            Alert.alert('실패', '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRegion = (regionId) => {
        setSelectedRegions(prevSelected => {
            if (prevSelected.includes(regionId)) return prevSelected.filter(id => id !== regionId);
            else return [...prevSelected, regionId];
        });
    };

    const handleSaveRegions = async () => {
        if (selectedRegions.length === 0) {
            Alert.alert('알림', '하나 이상의 관심지역을 선택해주세요.');
            return;
        }
        try {
            setRegionLoading(true);
            await userService.clearInterestRegions();
            await userService.bulkAddInterestRegions(selectedRegions);
            await loadUserInterestRegions();
            Alert.alert('성공', `관심지역 ${selectedRegions.length}개가 설정되었습니다.`);
            setShowRegionModal(false);
        } catch (error) {
            Alert.alert('오류', '관심지역 설정 중 오류가 발생했습니다.');
        } finally {
            setRegionLoading(false);
        }
    };

    const getRegionDisplayText = () => {
        if (!userInterestRegions || userInterestRegions.length === 0) return '미설정';
        const names = userInterestRegions.map(r => r.region_name);
        return names.join('\n');
    };

    const getSelectedRegionNames = () => {
        const selectedNames = availableProvinces
            .filter(region => selectedRegions.includes(region.id))
            .map(region => region.name);
        if (selectedNames.length === 0) return '없음';
        return selectedNames.join('\n');
    };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <TouchableOpacity onPress={() => editing ? handleCancelEdit() : setEditing(true)} style={styles.editButton} disabled={loading}>
            <Ionicons name={editing ? "close" : "create-outline"} size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>불러오는 중...</Text>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <View style={styles.profileCard}>
                  <View style={styles.profileHeader}>
                    <View style={styles.profileIconContainer}>
                      <Ionicons name="person" size={40} color={COLORS.primary} />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{userInfo?.nickname || userInfo?.username || '사용자'}</Text>
                      <Text style={styles.profileEmail}>{userInfo?.email}</Text>
                    </View>
                  </View>
                  {editing ? (
                    <View style={styles.editForm}>
                      <EditField label="사용자명" value={editData.username} onChangeText={(text) => setEditData(prev => ({ ...prev, username: text }))} placeholder="사용자명" icon="person-outline" />
                      <EditField label="닉네임" value={editData.nickname} onChangeText={(text) => setEditData(prev => ({ ...prev, nickname: text }))} placeholder="닉네임" icon="happy-outline" />
                      <EditField label="이메일" value={editData.email} onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))} placeholder="이메일" keyboardType="email-address" icon="mail-outline" />
                      <EditField label="전화번호" value={editData.phone} onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))} placeholder="전화번호" keyboardType="phone-pad" icon="call-outline" />
                      <View style={styles.editActions}>
                        <TouchableOpacity style={[styles.editActionButton, styles.cancelButton]} onPress={handleCancelEdit}>
                          <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.editActionButton, styles.saveButton]} onPress={handleSave} disabled={loading}>
                          {loading ? <ActivityIndicator size="small" color="#fff" /> : (
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
                      <InfoRow icon="location-outline" label="관심지역" value={getRegionDisplayText()} isMultiline={true} />
                      <InfoRow icon="calendar-outline" label="가입일" value={userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('ko-KR') : '미설정'} />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>설정 및 기능</Text>
                </View>
                <MenuButton icon="key-outline" title="비밀번호 변경" description="계정 비밀번호 변경" onPress={() => setShowPasswordModal(true)} color="#ff6b35" />
                <MenuButton icon="location-outline" title="관심지역 설정" description={userInterestRegions.length > 0 ? `현재 ${userInterestRegions.length}개 지역 설정됨` : "관심 지역을 설정하세요"} onPress={() => setShowRegionModal(true)} color="#28a745" />
              </View>

              <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
                  <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                  <Text style={styles.logoutText}>로그아웃</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.logoutButton, { marginTop: 10, borderColor: COLORS.textLight, backgroundColor: 'transparent' }]} onPress={handleDeleteAccount}>
                  <Ionicons name="trash-outline" size={24} color={COLORS.textLight} />
                  <Text style={[styles.logoutText, { color: COLORS.textLight }]}>회원 탈퇴</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bottomSpacing} />
            </>
          )}
        </ScrollView>
        
        {/* 비밀번호 변경 모달 (KeyboardAvoidingView 적용) */}
        <Modal visible={showPasswordModal} animationType="slide" transparent={false} onRequestClose={() => setShowPasswordModal(false)}>
           <KeyboardAvoidingView 
             style={styles.container}
             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { setShowPasswordModal(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>비밀번호 변경</Text>
                    <View style={{ width: 40 }} />
                </View>
                <ScrollView 
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled" // 키보드 밖을 터치해도 바로 내려가지 않게 설정
                >
                    <View style={styles.section}>
                        <View style={styles.profileCard}>
                            <View style={styles.editForm}>
                                <EditField label="현재 비밀번호" value={passwordData.currentPassword} onChangeText={(t) => setPasswordData(p => ({...p, currentPassword: t}))} placeholder="현재 비밀번호" icon="lock-closed-outline" secureTextEntry />
                                <EditField label="새 비밀번호" value={passwordData.newPassword} onChangeText={(t) => setPasswordData(p => ({...p, newPassword: t}))} placeholder="새 비밀번호" icon="key-outline" secureTextEntry />
                                <EditField label="새 비밀번호 확인" value={passwordData.confirmPassword} onChangeText={(t) => setPasswordData(p => ({...p, confirmPassword: t}))} placeholder="새 비밀번호 확인" icon="checkmark-circle-outline" secureTextEntry />
                                <View style={styles.editActions}>
                                    <TouchableOpacity style={[styles.editActionButton, styles.saveButton]} onPress={handleChangePassword} disabled={loading}>
                                        <Text style={styles.saveButtonText}>변경</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
           </KeyboardAvoidingView>
        </Modal>

        {/* 관심지역 설정 모달 */}
        <Modal visible={showRegionModal} animationType="slide" transparent={false} onRequestClose={() => setShowRegionModal(false)}>
           <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowRegionModal(false)} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>관심지역 설정</Text>
                    <View style={{ width: 40 }} />
                </View>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <View style={styles.profileCard}>
                            <View style={[styles.currentRegionContainer, styles.currentRegionContainerMultiline]}>
                                <View style={styles.currentRegionInfo}>
                                    <Text style={styles.currentRegionLabel}>현재 선택</Text>
                                    <Text style={[styles.currentRegionValue, styles.currentRegionValueMultiline]}>{getSelectedRegionNames()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                         {regionLoading ? <ActivityIndicator size="large" color={COLORS.primary} /> : 
                            availableProvinces.map((region) => {
                                const isSelected = selectedRegions.includes(region.id);
                                return (
                                    <TouchableOpacity key={region.id} style={[styles.regionSelectItem, isSelected && styles.regionSelectItemSelected]} onPress={() => handleSelectRegion(region.id)}>
                                        <View style={styles.regionSelectLeft}>
                                            <View style={[styles.regionSelectIconContainer, isSelected && styles.regionSelectIconContainerSelected]}>
                                                <Ionicons name={isSelected ? "checkmark-circle" : "location-outline"} size={20} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
                                            </View>
                                            <Text style={[styles.regionSelectText, isSelected && styles.regionSelectTextSelected]}>{region.name}</Text>
                                        </View>
                                        {isSelected && <View style={styles.regionSelectBadge}><Text style={styles.regionSelectBadgeText}>선택됨</Text></View>}
                                    </TouchableOpacity>
                                )
                            })
                         }
                    </View>
                    <View style={styles.bottomSpacing} />
                </ScrollView>
                <TouchableOpacity style={[styles.saveRegionsButton, regionLoading || selectedRegions.length === 0 ? styles.saveRegionsButtonDisabled : null]} onPress={handleSaveRegions} disabled={regionLoading || selectedRegions.length === 0}>
                    <Text style={styles.saveRegionsButtonText}>{selectedRegions.length}개 지역 설정 완료</Text>
                </TouchableOpacity>
           </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 50, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  editButton: { padding: 8 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 16 },
  section: { marginBottom: 16 },
  profileCard: { backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  profileIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  profileDetails: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailRowMultiline: { alignItems: 'flex-start' },
  detailLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailIcon: { marginRight: 10 },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500', paddingVertical: 2 },
  detailValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600', flex: 2, textAlign: 'right' },
  detailValueMultiline: { flex: 2, textAlign: 'right', lineHeight: 20 },
  editForm: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 },
  editField: { marginBottom: 16 },
  editFieldLabel: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 8, fontWeight: '600' },
  editFieldInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 12 },
  editFieldIcon: { marginRight: 10 },
  editFieldInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: COLORS.textPrimary },
  editActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  editActionButton: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  cancelButton: { backgroundColor: COLORS.overlayLight },
  saveButton: { backgroundColor: COLORS.primary },
  cancelButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 8 },
  menuButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  menuButtonIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuButtonContent: { flex: 1 },
  menuButtonTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  menuButtonDescription: { fontSize: 13, color: COLORS.textSecondary },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: `${COLORS.error}10`, marginHorizontal: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.error },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '600', marginLeft: 8 },
  bottomSpacing: { height: 40 },
  currentRegionContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: `${COLORS.primary}05`, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: `${COLORS.primary}20` },
  currentRegionContainerMultiline: { alignItems: 'flex-start', paddingVertical: 20 },
  currentRegionInfo: { flex: 1 },
  currentRegionLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  currentRegionValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  currentRegionValueMultiline: { lineHeight: 25, fontSize: 16 },
  regionSelectItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  regionSelectItemSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
  regionSelectLeft: { flexDirection: 'row', alignItems: 'center' },
  regionSelectIconContainer: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: COLORS.background },
  regionSelectIconContainerSelected: { backgroundColor: '#fff' },
  regionSelectText: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  regionSelectTextSelected: { fontWeight: '700', color: COLORS.primary },
  regionSelectBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  regionSelectBadgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  emptyRegionText: { textAlign: 'center', padding: 30, color: COLORS.textSecondary },
  saveRegionsButton: { backgroundColor: COLORS.primary, paddingVertical: 18, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginBottom: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  saveRegionsButtonDisabled: { backgroundColor: COLORS.textSecondary, shadowOpacity: 0.1, elevation: 2 },
  saveRegionsButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default UserProfile;