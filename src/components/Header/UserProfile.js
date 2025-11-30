// UserProfile.js (updateUser 에러 로직 제거 및 추적 강화)
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import userService from '../../services/userService';
// 💡 useAppState 임포트 (전역 상태에서 user 정보만 사용)
import { useAppState } from '../../store/AppContext'; 


const UserProflile = ({ visible, onClose, onLogout }) => {
  // ✅ 수정: updateUser를 제거하고 필요한 상태만 가져옵니다.
  const { user: globalUser, currentLocation, selectedTab } = useAppState(); 

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [regionLoading, setRegionLoading] = useState(true); 
  
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]); 
  // 💡 로컬 상태 유지: 전역 상태 업데이트가 실패할 경우를 대비하여 관심 지역 목록을 로컬에서 관리
  const [userInterestRegions, setUserInterestRegions] = useState([]); 
  
  const [selectedRegions, setSelectedRegions] = useState([]); 
  const [selectedProvinceId, setSelectedProvinceId] = useState(null); 
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 💡 사용자 관심지역 로드 함수 (selectedRegions 초기화 로직 강화)
  const loadUserInterestRegions = async () => {
    try {
      const regionData = await userService.getInterestRegions();
      const regions = regionData.regions || [];
      setUserInterestRegions(regions);
      
      console.log(`[UserProfile] 관심지역 로드 완료. 개수: ${regions.length}`);
      
      // ✅ 전역 상태 업데이트 로직 제거 (updateUser가 없기 때문)
      // 대신 MessageContent/Container가 globalUser를 참조하므로,
      // 메인 앱 로직에서 globalUser.interestRegions를 업데이트해야 합니다.
      
      if (showRegionModal) {
          setSelectedRegions(regions.map(r => r.region_id));
      }
    } catch (error) {
      console.error('사용자 관심지역 로드 실패:', error);
      setUserInterestRegions([]);
      setSelectedRegions([]);
    } finally {
        setRegionLoading(false); 
    }
  };

  const loadUserInfo = async () => {
    // ... (기존 loadUserInfo 로직 유지)
    try {
      setLoading(true);
      let userData = await userService.getUserInfo();
      
      setUserInfo(userData);
      setEditData({
        username: userData?.username || '',
        nickname: userData?.nickname || '',
        phone: userData?.phone || '',
        email: userData?.email || '',
      });
      
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
      setUserInfo(null);
      setEditData({});
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableProvinces = async () => {
    // ... (기존 loadAvailableProvinces 로직 유지)
    try {
      const provinces = await userService.getProvinces();
      setAvailableProvinces(provinces || []);
    } catch (error) {
      console.error('시/도 목록 로드 실패:', error);
      Alert.alert('오류', '지역 목록을 불러올 수 없습니다.');
      setAvailableProvinces([]);
    }
  };
  
  // 💡 모달이 열릴 때/앱 시작 시 사용자 정보 및 관심지역 로드
  useEffect(() => {
    if (visible) {
      loadUserInfo();
      loadUserInterestRegions(); 
      setEditing(false); 
    }
  }, [visible]);
  
  useEffect(() => {
    if (showRegionModal) {
      setRegionLoading(true);
      loadAvailableProvinces(); 
      loadUserInterestRegions(); 
    } else {
        setSelectedRegions([]);
        setSelectedProvinceId(null);
    }
  }, [showRegionModal]);
  
  const handleSave = async () => {
    // ... (handleSave 로직 유지)
    try {
      setLoading(true);

      const updatePayload = {
        username: editData.username,
        email: editData.email,
        nickname: editData.nickname,
        phone: editData.phone,
      };
      
      const updatedUser = await userService.updateProfile(updatePayload);
      setUserInfo(updatedUser);
      setEditing(false);
      Alert.alert('성공', '정보가 성공적으로 업데이트되었습니다.');
      
      // ✅ updateUser 함수가 없으므로 전역 상태 업데이트 로직은 제거

    } catch (error) {
      console.error('정보 수정 실패:', error);
      const errorMessage = error.message || '정보 수정 중 오류가 발생했습니다.';
      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // ... (handleLogout 로직 유지)
  };

  const handleCancelEdit = () => {
    // ... (handleCancelEdit 로직 유지)
  };

  const handleChangePassword = async () => {
    // ... (handleChangePassword 로직 유지)
  };

  const handleSelectRegion = (regionId) => {
    // ... (handleSelectRegion 로직 유지)
    setSelectedRegions(prevSelected => {
      if (prevSelected.includes(regionId)) {
        return prevSelected.filter(id => id !== regionId);
      } else {
        return [...prevSelected, regionId];
      }
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
      const updateResult = await userService.bulkAddInterestRegions(selectedRegions);

      if (updateResult.success_count > 0 || updateResult.already_exists_count > 0) {
        
        // 1. 성공적으로 업데이트된 지역 목록을 다시 불러오고 로컬 상태 업데이트
        const updatedRegionData = await userService.getInterestRegions();
        const updatedRegions = updatedRegionData.regions || [];
        
        setUserInterestRegions(updatedRegions);
        
        // ✅ 중요: 전역 상태 업데이트가 불가능하므로, 
        // 모달을 닫아 MessageContent가 다시 로컬 상태를 읽게 유도합니다.
        
        Alert.alert('성공', `관심지역 ${updatedRegions.length}개가 설정되었습니다.`);
        setShowRegionModal(false);
      } else {
        Alert.alert('오류', '관심지역 설정 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
      
    } catch (error) {
      console.error('관심지역 설정 실패:', error);
      Alert.alert('오류', '관심지역 설정 중 오류가 발생했습니다.');
    } finally {
      setRegionLoading(false);
    }
  };

  const MenuButton = ({ icon, title, description, onPress, color = COLORS.primary }) => (
    // ... (MenuButton 컴포넌트 유지)
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
    // ... (EditField 컴포넌트 유지)
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
  
  // 💡 메인 화면 표시를 위한 문자열 생성 (로컬 상태 사용)
  const getRegionDisplayText = () => {
    // ✅ 수정: 전역 상태 대신 로컬 상태(userInterestRegions)를 사용
    const regions = userInterestRegions;
    
    if (!regions || regions.length === 0) {
      return '미설정';
    }
    
    const regionNames = regions.map(r => r.region_name);
    return regionNames.join('\n');
  };
  
  // 💡 수정: 모달 내에서 현재 선택된 지역 목록의 이름 문자열을 반환 (여러 줄 나열)
  const getSelectedRegionNames = () => {
    const allAvailableRegions = availableProvinces; 
    
    const selectedNames = allAvailableRegions
        .filter(region => selectedRegions.includes(region.id))
        .map(region => region.name);
        
    if (selectedNames.length === 0) return '없음';
    
    return selectedNames.join('\n');
  };

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
                      {/* 💡 isMultiline={true}로 설정하여 여러 줄 표시 */}
                      <InfoRow 
                        icon="location-outline" 
                        label="관심지역" 
                        value={getRegionDisplayText()} 
                        isMultiline={true}
                      />
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
                  // 메뉴 버튼의 description은 한 줄로 요약하여 표시
                  description={getRegionDisplayText() !== '미설정' ? `현재: ${getRegionDisplayText().split('\n').join(', ')}` : "관심 지역을 설정하세요"}
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

        {/* 비밀번호 변경 모달 (생략) */}
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
              {/* 💡 수정: '선택 중인 관심지역' 카드를 유지하며 선택 상태 반영 */}
              <View style={styles.section}>
                <View style={styles.profileCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>선택 중인 관심지역 ({selectedRegions.length}개)</Text>
                  </View>
                  
                  <View style={[styles.currentRegionContainer, styles.currentRegionContainerMultiline]}>
                    <View style={styles.currentRegionIcon}>
                      <Ionicons name="pin" size={32} color={COLORS.primary} />
                    </View>
                    <View style={styles.currentRegionInfo}>
                      <Text style={styles.currentRegionLabel}>현재 선택</Text>
                      {/* 💡 수정: Multiline 스타일 적용 */}
                      <Text style={[styles.currentRegionValue, styles.currentRegionValueMultiline]}>
                        {getSelectedRegionNames()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 지역 선택 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>시/도 선택 (다중 선택 가능)</Text>
                </View>

                {regionLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={styles.loadingText}>지역 목록 불러오는 중...</Text>
                    </View>
                ) : availableProvinces.length === 0 ? (
                    <Text style={styles.emptyRegionText}>지역 목록을 불러올 수 없습니다.</Text>
                ) : (
                    // availableProvinces 목록을 사용
                    availableProvinces.map((region) => {
                    // isSelected 로직: selectedRegions에 포함되어 있는지 확인
                    const isSelected = selectedRegions.includes(region.id);
                    return (
                      <TouchableOpacity
                        key={region.id} // key를 region.id로 설정
                        style={[
                          styles.regionSelectItem,
                          isSelected && styles.regionSelectItemSelected
                        ]}
                        // handleSelectRegion에 region.id 전달 (다중 선택 로직)
                        onPress={() => handleSelectRegion(region.id)}
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
                            {region.name} 
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
            
            {/* 💡 하단 고정 저장 버튼 */}
            <TouchableOpacity 
                style={[
                    styles.saveRegionsButton, 
                    regionLoading || selectedRegions.length === 0 ? styles.saveRegionsButtonDisabled : null
                ]} 
                onPress={handleSaveRegions}
                disabled={regionLoading || selectedRegions.length === 0}
            >
                {regionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.saveRegionsButtonText}>
                        {selectedRegions.length}개 지역 설정 완료
                    </Text>
                )}
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

// 💡 수정된 InfoRow 컴포넌트: isMultiline prop에 따라 스타일 분기
const InfoRow = ({ icon, label, value, isMultiline = false }) => (
  <View style={[styles.detailRow, isMultiline && styles.detailRowMultiline]}>
    <View style={styles.detailLeft}>
      <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={styles.detailIcon} />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text 
      style={[styles.detailValue, isMultiline && styles.detailValueMultiline]}
    >
      {value}
    </Text>
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
  // 💡 InfoRowMultiline 스타일 추가 (메인 화면)
  detailRowMultiline: {
    alignItems: 'flex-start', // 여러 줄일 경우 상단 정렬
  },
  detailLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailIcon: { marginRight: 10 },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500', paddingVertical: 2 }, 
  detailValue: { 
    fontSize: 14, 
    color: COLORS.textPrimary, 
    fontWeight: '600',
    flex: 2, // 공간 확보
    textAlign: 'right', // 오른쪽 정렬 유지
  },
  // 💡 DetailValueMultiline 스타일 추가 (메인 화면)
  detailValueMultiline: {
    flex: 2, 
    textAlign: 'right', 
    lineHeight: 20, // 가독성 향상
  },
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
  // 💡 모달 관심지역 컨테이너 수정 (세로 확장 지원)
  currentRegionContainerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 20,
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
    marginBottom: 4,
  },
  currentRegionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // 💡 모달 관심지역 값 수정 (여러 줄 나열 지원)
  currentRegionValueMultiline: {
    lineHeight: 25,
    fontSize: 16, // 여러 줄일 때 폰트 크기 약간 줄임
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
  },
  // 💡 하단 고정 버튼 스타일
  saveRegionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  saveRegionsButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  saveRegionsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default UserProflile;