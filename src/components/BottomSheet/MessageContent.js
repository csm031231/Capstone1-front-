// src/components/BottomSheet/MessageContent.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import emergencyMessageService from '../../services/emergencyMessageService';
import { useAppState } from '../../store/AppContext';
import userService from '../../services/userService'; 
import RegionFilter from '../common/RegionFilter';     
import { utils } from '../../services/ApiService'; // ✅ utils 임포트 (위치 변환용)

const MessageContent = () => {
  const { selectedTab, currentLocation } = useAppState(); // user 의존성 제거 (토큰 기반 확인)
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 관심지역 목록
  const [interestRegions, setInterestRegions] = useState([]);
  // 현재 선택된 지역 (초기값 '전체')
  const [selectedRegionName, setSelectedRegionName] = useState('전체'); 

  // 📍 현재 위치를 지역명으로 변환하는 함수
  const getCurrentRegion = () => {
    if (currentLocation) {
      return utils.detectRegionFromLocation(currentLocation);
    }
    return '서울'; // 위치 정보가 없을 경우 기본값
  };

  // ✅ [핵심 수정] 관심지역 로드 및 폴백(Fallback) 로직
  const loadInterestRegions = async () => {
    let fetchedRegions = [];
    
    try {
      // 1. 서버에서 관심지역 목록 조회 시도 (로그인 여부와 상관없이 토큰이 있으면 조회됨)
      const regionData = await userService.getInterestRegions();
      fetchedRegions = (regionData.regions || []).map(r => r.region_name);
    } catch (error) {
      // 로그인이 안 되어 있거나 오류 발생 시 무시하고 위치 기반으로 넘어감
      console.log('관심지역 로드 실패 또는 비로그인 상태:', error.message);
    }

    if (fetchedRegions.length > 0) {
      // [Case A] 관심지역이 있는 경우
      setInterestRegions(fetchedRegions);
      
      // 현재 선택된 지역이 목록에 없으면 첫 번째 지역 선택
      if (selectedRegionName === '전체' || !fetchedRegions.includes(selectedRegionName)) {
        setSelectedRegionName(fetchedRegions[0]);
      }
    } else {
      // [Case B] 관심지역이 없거나 설정 안 된 경우 -> 📍 현재 위치 기반 자동 설정
      console.log('관심지역 없음 -> 현재 위치 기반 모드로 전환');
      setInterestRegions([]); // 목록 비움
      const currentRegion = getCurrentRegion();
      setSelectedRegionName(currentRegion); 
    }
  };
  
  // 메시지 로드 함수
  const loadMessages = async (regionName) => {
    if (!regionName || regionName === '전체') return;
      
    setLoading(true);
    try {
      console.log(`재난문자 로드 요청: ${regionName}`);
      const response = await emergencyMessageService.getEmergencyMessages(regionName);
      
      if (response.success && response.messages) {
        setMessages(response.messages.slice(0, 5));
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

  // 탭이 열릴 때마다 관심지역(또는 현재위치) 정보 갱신
  useEffect(() => {
    if (selectedTab === '재난문자') {
      loadInterestRegions();
    }
  }, [selectedTab]); // user 의존성 제거 (userService가 처리)
  
  // 지역이 변경되면 메시지 로드
  useEffect(() => {
      if (selectedTab === '재난문자' && selectedRegionName !== '전체') {
          loadMessages(selectedRegionName);
      }
  }, [selectedTab, selectedRegionName]);

  const getSeverityColor = (severity) => { 
    switch (severity) {
      case 'emergency': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  };
  
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'weather': return '🌦️';
      case 'earthquake': return '🏗️';
      case 'fire': return '🔥';
      case 'flood': return '🌊';
      default: return '🚨';
    }
  };
  
  const getRegionMessageCount = (region) => {
      return region === selectedRegionName ? messages.length : null;
  };

  return (
    <>
      <View style={styles.header}>
          <Text style={styles.title}>재난문자</Text>
          <Text style={styles.text}>
            {loading 
                ? "재난문자를 불러오는 중..." 
                : interestRegions.length > 0 
                    ? `설정된 관심지역: ${selectedRegionName}`
                    : `📍 현재 위치 기반: ${selectedRegionName}` // ✅ 관심지역 없을 때 멘트 변경
            }
          </Text>
      </View>
      
      {/* 관심 지역이 있을 때만 필터 버튼 표시 */}
      {interestRegions.length > 0 && (
          <RegionFilter
              regions={interestRegions} 
              selectedRegion={selectedRegionName}
              onRegionChange={setSelectedRegionName}
              getRegionNewsCount={getRegionMessageCount} 
          />
      )}
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.itemList}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4285f4" />
                    <Text style={styles.loadingText}>
                        {selectedRegionName} 재난문자 확인 중...
                    </Text>
                </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>
                    {selectedRegionName} 지역의 최근 재난문자가 없습니다.
                </Text>
              </View>
            ) : (
              messages.map((item) => (
                <TouchableOpacity key={item.id} style={styles.listItem}>
                  <View style={[styles.listItemIcon, { backgroundColor: getSeverityColor(item.severity) }]}>
                    <Text style={styles.listItemIconText}>{getCategoryIcon(item.category)}</Text>
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.listItemSubtitle}>{item.time} • {item.location}</Text>
                  </View>
                </TouchableOpacity>
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
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  itemList: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemIconText: {
    fontSize: 18,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  }
});

export default MessageContent;