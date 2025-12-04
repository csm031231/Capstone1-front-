// ============================================
// 📁 src/components/BottomSheet/ActionContent.js
// ============================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; // Alert, ActivityIndicator import
import AIChatbotModal from '../common/AIChatbotModal';
import disasterActionService from '../../services/disasterActionService'; // 서비스 import
import COLORS from '../../constants/colors'; // ✅ COLORS import 추가

const ActionContent = () => {
  const [showAiChat, setShowAiChat] = useState(false);
  
  // ✅ 추가: 현재 열린 항목의 ID (null 또는 action.id)
  const [openActionId, setOpenActionId] = useState(null);
  // ✅ 추가: 로드된 행동요령 상세 데이터 저장
  const [actionDetails, setActionDetails] = useState({});
  // ✅ 추가: 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

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
  
  // ✅ onPress 핸들러 수정
  const handleActionItemPress = async (action) => {
    // 이미 열려 있으면 닫기
    if (openActionId === action.id) {
      setOpenActionId(null);
      return;
    }
    
    // 특수 항목 (강풍 주의사항) - Alert 대신 상세 내용으로 표시
    if (action.id === 'blackout') {
        setActionDetails(prev => ({
            ...prev,
            [action.id]: {
                title: action.title,
                content: `${action.title} 상세 정보를 표시합니다. (구현 예정)`,
                url: null
            }
        }));
        setOpenActionId(action.id);
        return;
    }

    // 재난 유형에 따른 행동 요령 데이터 로드
    setOpenActionId(action.id); // 항목을 즉시 열고 로딩 표시
    setIsLoading(true);
    
    try {
        const response = await disasterActionService.getActionsByCategory(action.id, 1, 1);
        
        if (response.success && response.items && response.items.length > 0) {
          const firstAction = response.items[0];
          
          setActionDetails(prev => ({
            ...prev,
            [action.id]: {
              title: firstAction.title || action.title,
              content: firstAction.content,
              url: firstAction.url
            }
          }));
        } else {
          // 데이터는 불러왔으나 해당 카테고리에 내용이 없을 때
          setActionDetails(prev => ({
            ...prev,
            [action.id]: {
              title: action.title,
              content: `현재 ${action.title}에 대한 상세 행동요령을 찾을 수 없습니다.`,
              url: null
            }
          }));
        }
    } catch (error) {
        console.error('행동요령 로드 실패:', error);
        setActionDetails(prev => ({
            ...prev,
            [action.id]: {
              title: action.title,
              content: '행동요령 데이터를 불러오는 데 실패했습니다.\n(서버 연결 상태를 확인하세요)',
              url: null
            }
        }));
    } finally {
        setIsLoading(false);
    }
  };
  
  // ✅ 상세 내용을 렌더링하는 컴포넌트 추가
  const renderActionDetails = (actionId) => {
    if (openActionId !== actionId) return null;
    
    const details = actionDetails[actionId];
    
    if (isLoading && !details) {
      return (
        <View style={styles.detailsContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.detailsText}>정보를 불러오는 중...</Text>
        </View>
      );
    }
    
    if (!details) return null;

    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{details.title}</Text>
        <Text style={styles.detailsContent}>{details.content}</Text>
        {details.url && (
          <Text style={styles.detailsLink}>
            [더보기: {details.url.length > 30 ? details.url.substring(0, 30) + '...' : details.url}]
          </Text>
        )}
      </View>
    );
  };
  

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>재난 행동요령</Text>
          <Text style={styles.text}>AI 도우미와 대화하거나 아래 요령을 확인하세요</Text>
          
          <TouchableOpacity 
            style={styles.aiChatButton}
            onPress={() => setShowAiChat(true)}
          >
            <Text style={styles.aiChatButtonText}>AI 도우미와 채팅하기</Text>
          </TouchableOpacity>
          
          <View style={styles.itemList}>
            {mockActions.map((item) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity 
                  style={[
                    styles.actionItem,
                    openActionId === item.id && styles.selectedActionForBottomSheet 
                  ]}
                  onPress={() => handleActionItemPress(item)} 
                >
                  <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
                    <Text style={styles.actionIconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Text style={[
                    styles.actionArrow,
                    openActionId === item.id && styles.arrowRotated 
                  ]}>
                    ⌵
                  </Text>
                </TouchableOpacity>
                {/* ✅ 상세 내용 렌더링 */}
                {renderActionDetails(item.id)}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>

      <AIChatbotModal
        visible={showAiChat}
        onClose={() => setShowAiChat(false)}
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
    // marginBottom: 12, // ✅ 상세 내용과 연결되도록 marginBottom 제거
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
    marginBottom: 12, // 💡 열리지 않은 항목 간의 간격
  },
  // ✅ 추가: 항목이 열렸을 때의 스타일
  selectedActionForBottomSheet: {
    borderBottomLeftRadius: 0, 
    borderBottomRightRadius: 0,
    backgroundColor: '#f5f5f5',
    marginBottom: 0, // 상세 내용과 연결되도록 marginBottom 제거
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
    // transition: 'transform 0.3s ease-in-out', // RN에서는 사용 불가
  },
  arrowRotated: {
    transform: [{ rotate: '180deg' }], // ✅ 회전
  },
  // ✅ 추가: 상세 내용 스타일
  detailsContainer: {
    backgroundColor: '#f9f9f9', // 밝은 회색 배경
    padding: 16,
    paddingTop: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 12, // 다음 항목과의 간격
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopWidth: 0, // 상단 경계선 제거
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  detailsContent: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  detailsLink: {
    fontSize: 11,
    color: '#4285f4',
    textDecorationLine: 'underline',
  },
  detailsText: { // 로딩 텍스트 스타일
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  }
});

export default ActionContent;