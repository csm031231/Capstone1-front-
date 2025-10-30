// src/components/BottomSheet/MessageContent.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
// import AIChatbotModal from '../common/AIChatbotModal'; // ❌ AI 챗봇 모달 임포트 제거
import emergencyMessageService from '../../services/emergencyMessageService';
import { useAppState } from '../../store/AppContext';

const MessageContent = () => {
  const { currentLocation, selectedTab } = useAppState();
  const [messages, setMessages] = useState([]);
  // const [showAiChat, setShowAiChat] = useState(false); // ❌ 챗봇 상태 제거
  const [loading, setLoading] = useState(false);

  const getRegionName = () => {
    if (currentLocation && currentLocation.favoriteRegion) {
        return currentLocation.favoriteRegion;
    }
    return '김해시';
  }

  useEffect(() => {
    if (selectedTab === '재난문자') {
      loadMessages();
    }
  }, [selectedTab, currentLocation]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const regionName = getRegionName();
      const response = await emergencyMessageService.getEmergencyMessages(regionName);
      
      if (response.success && response.messages) {
        setMessages(response.messages.slice(0, 3));
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

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🚨 재난문자</Text>
          <Text style={styles.text}>
            {loading 
                ? "재난문자를 불러오는 중..." 
                : `현재 ${getRegionName()} 지역의 최근 재난문자`}
          </Text>
          
          {/* ❌ AI 챗봇 버튼 제거 */}
          {/* <TouchableOpacity 
            style={styles.aiChatButton}
            onPress={() => setShowAiChat(true)}
          >
            <Text style={styles.aiChatButtonText}>AI 도우미에게 물어보기</Text>
          </TouchableOpacity>
          */}
          
          <View style={styles.itemList}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4285f4" />
                </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>표시할 재난문자가 없습니다</Text>
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

      {/* ❌ AI 챗봇 모달 제거 */}
      {/*
      <AIChatbotModal
        visible={showAiChat}
        onClose={() => setShowAiChat(false)}
        initialMessage="재난문자에 대해 궁금한 점이 있어요"
      />
      */}
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 600,
  },
  content: {
    padding: 16,
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
  // ❌ aiChatButton 스타일 제거 (사용하지 않으므로)
  // aiChatButton: {
  //   backgroundColor: '#4285f4',
  //   paddingHorizontal: 20,
  //   paddingVertical: 12,
  //   borderRadius: 25,
  //   alignItems: 'center',
  //   marginBottom: 16,
  // },
  // aiChatButtonText: {
  //   fontSize: 16,
  //   color: '#ffffff',
  //   fontWeight: '600',
  // },
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
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  }
});

export default MessageContent;