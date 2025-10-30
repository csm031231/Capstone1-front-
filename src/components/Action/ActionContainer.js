// src/components/Action/ActionContainer.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import EmptyState from '../common/EmptyState';
import AIChatbotModal from '../common/AIChatbotModal'; 
import COLORS from '../../constants/colors';
import disasterActionService from '../../services/disasterActionService'; // ✅ 서비스 import 추가

export default function ActionContainer() {
  
  const [actions] = useState([
    {
      id: '01011', // 지진 코드 (서비스/라우터 참고)
      title: '지진 대응',
      subtitle: '지진 발생시 행동요령',
      icon: '🏗️',
      color: COLORS.accent,
      description: '지진 발생시 안전한 대피 방법을 확인하세요'
    },
    {
      id: '01014', // 화재 코드 (서비스/라우터 참고)
      title: '화재 대응',
      subtitle: '화재 발생시 대피요령',
      icon: '🔥',
      color: COLORS.primaryDark,
      description: '화재 발생시 신속한 대피 방법을 확인하세요'
    },
    {
      id: '01013', // 홍수 코드 (서비스 목업 참고)
      title: '수해 대응 (홍수)',
      subtitle: '홍수/태풍 대비요령',
      icon: '🌊',
      color: COLORS.primary,
      description: '홍수나 태풍 발생시 대비 방법을 확인하세요'
    },
    {
      id: 'blackout', // 특수 항목: 정전은 별도의 로직이 필요하거나 상세 코드가 없는 경우가 많아 ID 유지
      title: '정전 대응',
      subtitle: '정전 발생시 행동요령',
      icon: '⚡',
      color: COLORS.accentDark,
      description: '정전 발생시 안전한 행동 방법을 확인하세요'
    },
    {
      id: 'shelter', // 특수 항목: 대피소 찾기는 지도/API 연동 필요하여 ID 유지
      title: '대피소 찾기',
      subtitle: '주변 대피소 위치',
      icon: '🏠',
      color: COLORS.primaryLight,
      description: '현재 위치 기준 가까운 대피소를 찾아보세요'
    },
    {
      id: 'emergency', // 특수 항목: 긴급 신고는 ID 유지
      title: '긴급신고',
      subtitle: '119/112 신고',
      icon: '🚨',
      color: '#f44336',
      description: '긴급상황 발생시 신속한 신고를 도와드립니다'
    }
  ]);

  const [selectedAction, setSelectedAction] = useState(null);
  const [showAiChat, setShowAiChat] = useState(false);

  // ✅ handleActionPress 함수를 async로 변경하고 서비스 호출 로직 추가
  const handleActionPress = async (action) => {
    setSelectedAction(action.id);
    
    //console.log('--- Action Press Called:', action.id); // 디버깅용
    
    try {
      if (action.id === 'emergency') {
        // 긴급신고 로직
        Alert.alert(
          '긴급신고',
          '어떤 신고를 하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '화재신고 (119)', onPress: () => Alert.alert('119 신고', '화재신고가 접수되었습니다.') },
            { text: '경찰신고 (112)', onPress: () => Alert.alert('112 신고', '경찰신고가 접수되었습니다.') }
          ]
        );
      } else if (action.id === 'shelter' || action.id === 'blackout') {
        // 기타 특수 항목 (정전, 대피소)
        Alert.alert(action.title, `${action.title} 상세 정보를 표시합니다.`);
      } else {
        // ✅ 재난 유형에 따른 행동 요령 데이터를 불러옴 (Category Code 사용)
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
          // 데이터는 불러왔으나 해당 카테고리에 내용이 없을 때
          Alert.alert(action.title, `현재 ${action.title}에 대한 상세 행동요령을 찾을 수 없습니다.`);
        }
      }
    } catch (error) {
        console.error('행동요령 로드 실패:', error);
        // API 호출 자체가 실패했을 때 (서버 미작동 등)
        Alert.alert('오류', '행동요령 데이터를 불러오는 데 실패했습니다.\n(서버 연결 상태를 확인하세요)');
    }
    
    setTimeout(() => {
      setSelectedAction(null);
    }, 200);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🤖 재난 행동요령</Text>
          <Text style={styles.subtitle}>긴급상황별 대응 방법을 빠르게 확인하세요</Text>
          
          <TouchableOpacity 
            style={styles.aiChatButton}
            onPress={() => setShowAiChat(true)}
          >
            <Text style={styles.aiChatButtonText}>AI 도우미와 채팅하기</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {actions.length === 0 ? (
            <EmptyState
              icon="book-outline"
              title="행동요령이 없습니다"
              message="행동요령 데이터를 불러올 수 없습니다"
            />
          ) : (
            actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionItem,
                  { backgroundColor: action.color },
                  selectedAction === action.id && styles.selectedAction
                ]}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.8}
              >
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <View style={styles.actionArrow}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <AIChatbotModal
        visible={showAiChat}
        onClose={() => setShowAiChat(false)}
        initialMessage="재난 행동요령에 대해 질문하고 싶어요"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  aiChatButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  aiChatButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  selectedAction: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  actionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  arrowText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});