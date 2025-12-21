// ============================================
// 📁 src/components/Header/HelpModal.js
// ============================================
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const HelpModal = ({ visible, onClose }) => {
  
  const HelpItem = ({ icon, title, description }) => (
    <View style={styles.helpItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
    </View>
  );

  const handleContact = () => {
    Linking.openURL('mailto:support@disasterapp.com');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" 
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>도움말 및 지원</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>앱 사용 가이드</Text>
            
            <HelpItem 
              icon="search-outline"
              title="대피소 및 지역 검색"
              description="상단 검색창을 통해 원하는 지역명이나 대피소 이름을 검색하여 위치와 정보를 확인할 수 있습니다."
            />
            
            <HelpItem 
              icon="location-outline"
              title="관심 지역 설정"
              description="[마이페이지 > 관심 지역 설정]에서 자주 가는 지역을 등록하면 해당 지역의 재난 문자를 빠르게 확인할 수 있습니다."
            />
            
            <HelpItem 
              icon="notifications-outline"
              title="재난 알림 수신"
              description="설정한 관심 지역의 긴급 재난 문자가 발생하면 푸시 알림으로 받아볼 수 있습니다."
            />

            <HelpItem 
                icon="shield-checkmark-outline"
                title="행동 요령 확인"
                description="지진, 화재, 태풍 등 재난 상황 발생 시 대처해야 할 행동 요령을 메뉴를 통해 확인할 수 있습니다."
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>문의 및 제보</Text>
            <View style={styles.contactCard}>
              <Text style={styles.contactText}>
                앱 사용 중 불편한 점이나 제안하고 싶은 내용이 있다면 언제든지 문의해주세요.
              </Text>
              <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                <Ionicons name="mail-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.contactButtonText}>이메일로 문의하기</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>현재 버전 1.0.0</Text>
            <Text style={styles.copyrightText}>© 2025 Disaster Safety App. All rights reserved.</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, paddingTop: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  closeButton: { padding: 4 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16, marginLeft: 4 },
  helpItem: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 2,
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  textContainer: { flex: 1, justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  itemDescription: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  contactCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  contactText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  contactButton: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center' },
  contactButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  footer: { alignItems: 'center', marginTop: 20, marginBottom: 60 },
  versionText: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  copyrightText: { fontSize: 12, color: COLORS.textLight },
});

export default HelpModal;