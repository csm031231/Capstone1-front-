// src/components/BottomSheet/MessageContent.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import emergencyMessageService from '../../services/emergencyMessageService';
import { useAppState } from '../../store/AppContext';
import userService from '../../services/userService'; 
import RegionFilter from '../common/RegionFilter';     
import { utils } from '../../services/ApiService';
import COLORS from '../../constants/colors';

// ✅ [추가] 개별 메시지 아이템 컴포넌트 (더보기 기능 구현을 위해 분리)
const MessageItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity) => { 
    switch (severity) {
      case 'emergency': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  };
  
  const getCategoryName = (category) => {
    switch (category) {
      case 'weather': return '기상특보';
      case 'earthquake': return '지진';
      case 'fire': return '화재';
      case 'flood': return '홍수';
      default: return '재난문자';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      const safeTimestamp = timestamp.replace(/\//g, '-'); 
      const date = new Date(safeTimestamp);
      const now = new Date();
      if (isNaN(date.getTime())) return timestamp; 
      const diff = (now - date) / 1000; 
      if (diff < 60) return '방금 전';
      if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
      return `${Math.floor(diff / 86400)}일 전`;
    } catch (e) {
      return timestamp; 
    }
  };

  return (
    <TouchableOpacity 
      style={styles.cardItem} 
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)} // ✅ 클릭 시 펼치기/접기 토글
    >
      {/* 1. 상단 메타 정보 */}
      <View style={styles.metaRow}>
        <View style={[styles.badge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.badgeText}>{getCategoryName(item.category)}</Text>
        </View>
        <Text style={styles.metaText}>{item.location}</Text>
        <Text style={styles.metaDivider}>•</Text>
        <Text style={styles.dateText}>
          {formatTimeAgo(item.timestamp || item.time)}
        </Text>
      </View>

      {/* 2. 제목 */}
      <Text style={styles.cardTitle} numberOfLines={expanded ? undefined : 1}>
        {item.title}
      </Text>
      
      {/* 3. 본문 (펼쳐지면 전체 표시, 아니면 2줄 제한) */}
      <Text style={styles.cardContent} numberOfLines={expanded ? undefined : 2}>
        {item.content}
      </Text>

      {/* 4. 더보기/접기 버튼 (뉴스 스타일) */}
      <View style={styles.footerRow}>
        <Text style={styles.expandText}>
            {expanded ? '접기 ▲' : '더보기 ▼'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const MessageContent = () => {
  const { selectedTab, currentLocation } = useAppState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interestRegions, setInterestRegions] = useState([]);
  const [selectedRegionName, setSelectedRegionName] = useState('전체'); 

  const getCurrentRegion = () => {
    if (currentLocation) {
      return utils.detectRegionFromLocation(currentLocation);
    }
    return '서울';
  };

  const loadInterestRegions = async () => {
    let fetchedRegions = [];
    try {
      const regionData = await userService.getInterestRegions();
      fetchedRegions = (regionData.regions || []).map(r => r.region_name);
    } catch (error) {
      console.log('관심지역 로드 실패:', error.message);
    }

    if (fetchedRegions.length > 0) {
      setInterestRegions(fetchedRegions);
      if (selectedRegionName === '전체' || !fetchedRegions.includes(selectedRegionName)) {
        setSelectedRegionName(fetchedRegions[0]);
      }
    } else {
      setInterestRegions([]);
      const currentRegion = getCurrentRegion();
      setSelectedRegionName(currentRegion); 
    }
  };
  
  const loadMessages = async (regionName) => {
    if (!regionName || regionName === '전체') return;
    setLoading(true);
    try {
      const response = await emergencyMessageService.getEmergencyMessages(regionName);
      if (response.success && response.messages) {
        setMessages(response.messages.slice(0, 10)); 
      } else {
         setMessages([]);
      }
    } catch (error) {
      console.error('재난문자 로드 실패:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === '재난문자') {
      loadInterestRegions();
    }
  }, [selectedTab]);
  
  useEffect(() => {
      if (selectedTab === '재난문자' && selectedRegionName !== '전체') {
          loadMessages(selectedRegionName);
      }
  }, [selectedTab, selectedRegionName]);
  
  const getRegionMessageCount = (region) => {
      return region === selectedRegionName ? messages.length : null;
  };

  return (
    <>
      <View style={styles.header}>
          <Text style={styles.headerTitle}>재난문자</Text>
          <Text style={styles.headerSubtitle}>
            {selectedRegionName} : {loading ? '로딩중...' : `${messages.length}건`}
          </Text>
      </View>
      
      {interestRegions.length > 0 && (
          <RegionFilter
              regions={interestRegions} 
              selectedRegion={selectedRegionName}
              onRegionChange={setSelectedRegionName}
              getRegionNewsCount={getRegionMessageCount} 
          />
      )}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.itemList}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>불러오는 중...</Text>
                </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>최근 수신된 재난문자가 없습니다.</Text>
              </View>
            ) : (
              // ✅ MessageItem 컴포넌트 사용
              messages.map((item) => (
                <MessageItem key={item.id} item={item} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 600,
    backgroundColor: COLORS.background, 
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
    left: 13,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    left: 13,
  },
  itemList: {
    marginTop: 8,
  },
  cardItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  metaDivider: {
    marginHorizontal: 6,
    color: COLORS.divider,
    fontSize: 10,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: '#444', 
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // 오른쪽 정렬
    marginTop: 8,
  },
  expandText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
  }
});

export default MessageContent;