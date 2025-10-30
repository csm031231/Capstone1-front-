import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

const DisasterAlertModal = ({ visible, onClose }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'weather', name: '기상', icon: '🌦️' },
    { id: 'earthquake', name: '지진', icon: '🏗️' },
    { id: 'fire', name: '화재', icon: '🔥' },
    { id: 'flood', name: '수해', icon: '🌊' },
    { id: 'other', name: '기타', icon: '⚠️' }
  ];

  // 재난문자 데이터 가져오기
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // 실제 구현시 API 호출
      const mockAlerts = [
        {
          id: 1,
          title: '[긴급재난문자] 호우 경보 발령',
          content: '김해시에 호우경보가 발령되었습니다. 저지대 및 상습침수지역 주민들은 안전한 곳으로 대피하시기 바랍니다. 하천 근처 접근을 삼가하시고, 지하공간 이용을 자제해 주시기 바랍니다.',
          category: 'weather',
          severity: 'warning', // info, warning, emergency
          location: '경남 김해시',
          time: '2시간 전',
          timestamp: '2024-01-15 14:30',
          isRead: false
        },
        {
          id: 2,
          title: '[재난문자] 정전 안내',
          content: '김해시 장유면 일대에 정전이 발생했습니다. 복구 예상시간은 오후 6시경입니다. 엘리베이터 이용을 삼가하시고, 촛불 대신 손전등을 사용해 주시기 바랍니다.',
          category: 'other',
          severity: 'info',
          location: '김해시 장유면',
          time: '5시간 전',
          timestamp: '2024-01-15 11:30',
          isRead: true
        },
        {
          id: 3,
          title: '[긴급재난문자] 강풍 주의보',
          content: '경남 전 지역에 강풍주의보가 발령되었습니다. 시속 60km 이상의 강한 바람이 예상되니, 외출을 자제하시고 간판, 현수막 등 낙하물에 주의하시기 바랍니다.',
          category: 'weather',
          severity: 'warning',
          location: '경남 전체',
          time: '1일 전',
          timestamp: '2024-01-14 09:15',
          isRead: true
        },
        {
          id: 4,
          title: '[재난문자] 화재 발생 알림',
          content: '김해시 내외동 주택가에서 화재가 발생했습니다. 소방차 진입을 위해 해당 지역 차량 통행을 금지합니다. 주변 주민들은 연기 흡입에 주의하시기 바랍니다.',
          category: 'fire',
          severity: 'emergency',
          location: '김해시 내외동',
          time: '2일 전',
          timestamp: '2024-01-13 16:45',
          isRead: true
        },
        {
          id: 5,
          title: '[재난문자] 지진 감지 알림',
          content: '경남 창원 지역에서 규모 3.2의 지진이 감지되었습니다. 여진 가능성이 있으니 주의하시기 바랍니다. 현재까지 피해 신고는 없는 상황입니다.',
          category: 'earthquake',
          severity: 'info',
          location: '경남 창원시',
          time: '3일 전',
          timestamp: '2024-01-12 22:33',
          isRead: true
        }
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      console.error('재난문자 데이터 가져오기 실패:', error);
      Alert.alert('오류', '재난문자 정보를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAlerts();
    }
  }, [visible]);

  // 심각도별 스타일
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'emergency':
        return { backgroundColor: '#f44336', color: '#ffffff' };
      case 'warning':
        return { backgroundColor: '#ff9800', color: '#ffffff' };
      case 'info':
        return { backgroundColor: '#2196f3', color: '#ffffff' };
      default:
        return { backgroundColor: '#666', color: '#ffffff' };
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'emergency':
        return '긴급';
      case 'warning':
        return '경보';
      case 'info':
        return '정보';
      default:
        return '알림';
    }
  };

  // 카테고리별 필터링
  const filteredAlerts = alerts.filter(alert => 
    selectedCategory === 'all' || alert.category === selectedCategory
  );

  // 읽음 처리
  const markAsRead = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const renderAlertItem = (alert) => (
    <TouchableOpacity 
      key={alert.id} 
      style={[styles.alertItem, !alert.isRead && styles.unreadAlert]}
      onPress={() => markAsRead(alert.id)}
      activeOpacity={0.7}
    >
      <View style={styles.alertHeader}>
        <View style={[styles.severityBadge, getSeverityStyle(alert.severity)]}>
          <Text style={[styles.severityText, { color: getSeverityStyle(alert.severity).color }]}>
            {getSeverityText(alert.severity)}
          </Text>
        </View>
        <Text style={styles.alertTime}>{alert.time}</Text>
        {!alert.isRead && <View style={styles.unreadDot} />}
      </View>
      
      <Text style={styles.alertTitle}>{alert.title}</Text>
      <Text style={styles.alertContent} numberOfLines={3}>{alert.content}</Text>
      
      <View style={styles.alertFooter}>
        <Text style={styles.alertLocation}>📍 {alert.location}</Text>
        <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🚨 재난문자</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 카테고리 필터 */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.selectedCategory
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285f4" />
              <Text style={styles.loadingText}>재난문자를 가져오는 중...</Text>
            </View>
          ) : (
            <ScrollView style={styles.alertList} showsVerticalScrollIndicator={false}>
              {filteredAlerts.length > 0 ? (
                <>
                  <View style={styles.alertStats}>
                    <Text style={styles.alertStatsText}>
                      총 {filteredAlerts.length}건의 재난문자
                    </Text>
                  </View>
                  {filteredAlerts.map(renderAlertItem)}
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>재난문자가 없습니다</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  categoryContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#4285f4',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  alertStats: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  alertStatsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  alertList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#4285f4',
    backgroundColor: '#f8f9ff',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4285f4',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  alertContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  alertLocation: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DisasterAlertModal;