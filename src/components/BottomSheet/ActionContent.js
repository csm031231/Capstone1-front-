// ============================================
// 📁 src/components/BottomSheet/ActionContent.js
// ============================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'; // Alert import
import AIChatbotModal from '../common/AIChatbotModal';
import disasterActionService from '../../services/disasterActionService'; // 서비스 import

const ActionContent = () => {
  const [showAiChat, setShowAiChat] = useState(false);

  // ID를 category_code와 유사하게 변경
  const mockActions = [
    {
      id: '01012', // 태풍 코드
      icon: '🌊',
      title: '태풍 대비 요령',
      subtitle: '사전준비 • 행동요령',
      color: '#9c27b0'
    },
    {
      id: '01014', // 화재 코드
      icon: '🔥',
      title: '화재 발생시 대피',
      subtitle: '초기대응 • 대피방법',
      color: '#795548'
    },
    {
      id: '01011', // 지진 코드
      icon: '⚡',
      title: '지진 발생시 행동',
      subtitle: '실내 • 실외 대응',
      color: '#607d8b'
    },
    {
      id: 'blackout', // 특수 항목 ID
      icon: '🌪️',
      title: '강풍 주의사항',
      subtitle: '외출금지 • 안전수칙',
      color: '#ff9800'
    }
  ];
  
  // ✅ onPress 핸들러 추가
  const handleActionItemPress = async (action) => {
    if (action.id === 'blackout') {
        Alert.alert(action.title, `${action.title} 상세 정보를 표시합니다.`);
        return;
    }

    try {
        const response = await disasterActionService.getActionsByCategory(action.id, 1, 1);
        
        if (response.success && response.items && response.items.length > 0) {
          const firstAction = response.items[0];
          
          let alertContent = firstAction.content;
          if (firstAction.url) {
             alertContent += `\n\n[더보기: ${firstAction.url}]`;
          }
          
          Alert.alert(
            firstAction.title || action.title, 
            alertContent
          );
        } else {
          Alert.alert(action.title, `현재 ${action.title}에 대한 상세 행동요령을 찾을 수 없습니다.`);
        }
    } catch (error) {
        console.error('행동요령 로드 실패:', error);
        Alert.alert('오류', '행동요령 데이터를 불러오는 데 실패했습니다.');
    }
  };

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🤖 재난 행동요령</Text>
          <Text style={styles.text}>AI 도우미와 대화하거나 아래 요령을 확인하세요</Text>
          
          <TouchableOpacity 
            style={styles.aiChatButton}
            onPress={() => setShowAiChat(true)}
          >
            <Text style={styles.aiChatButtonText}>AI 도우미와 채팅하기</Text>
          </TouchableOpacity>
          
          <View style={styles.itemList}>
            {mockActions.map((item) => (
              // ✅ onPress 핸들러 연결
              <TouchableOpacity 
                key={item.id} 
                style={styles.actionItem}
                onPress={() => handleActionItemPress(item)} 
              >
                <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
                  <Text style={styles.actionIconText}>{item.icon}</Text>
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <AIChatbotModal
        visible={showAiChat}
        onClose={() => setShowAiChat(false)}
        initialMessage="특정 재난 행동요령을 알려주세요"
      />
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
  aiChatButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  aiChatButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  itemList: {
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionArrow: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: 'bold',
  },
});

export default ActionContent;