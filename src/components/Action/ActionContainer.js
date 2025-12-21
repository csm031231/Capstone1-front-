// src/components/Action/ActionContainer.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; 
import EmptyState from '../common/EmptyState';
import AIChatbotModal from '../common/AIChatbotModal'; 
import COLORS from '../../constants/colors';
import disasterActionService from '../../services/disasterActionService'; 

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

  const [showAiChat, setShowAiChat] = useState(false);
  
  // ✅ 추가: 현재 열린 항목의 ID (null 또는 action.id)
  const [openActionId, setOpenActionId] = useState(null);
  // ✅ 추가: 로드된 행동요령 상세 데이터 저장
  const [actionDetails, setActionDetails] = useState({});
  // ✅ 추가: 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // ✅ handleActionPress 함수를 수정
  const handleActionPress = async (action) => {
    // 이미 열려 있으면 닫기
    if (openActionId === action.id) {
      setOpenActionId(null);
      return;
    }
    
    // 긴급신고 로직 (Alert 유지)
    if (action.id === 'emergency') {
        setOpenActionId(null); // 다른 항목이 열려있다면 닫기
        Alert.alert(
          '긴급신고',
          '어떤 신고를 하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '화재신고 (119)', onPress: () => Alert.alert('119 신고', '화재신고가 접수되었습니다.') },
            { text: '경찰신고 (112)', onPress: () => Alert.alert('112 신고', '경찰신고가 접수되었습니다.') }
          ]
        );
        return;
    } 
    
    // 기타 특수 항목 (정전, 대피소) - Alert 대신 상세 내용으로 표시
    if (action.id === 'shelter' || action.id === 'blackout') {
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
        // API 호출 자체가 실패했을 때 (서버 미작동 등)
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
    
    if (isLoading && !details) { // 처음 로딩 중일 때만 로딩 인디케이터 표시
      return (
        <View style={styles.detailsContainer}>
          <ActivityIndicator size="small" color={COLORS.primaryDark} />
          <Text style={styles.detailsText}>정보를 불러오는 중...</Text>
        </View>
      );
    }
    
    if (!details) return null; // 로딩 후 데이터가 없을 경우

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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>재난 행동요령</Text>
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
              <React.Fragment key={action.id}>
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    { backgroundColor: action.color },
                    openActionId === action.id && styles.selectedAction
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
                  <View style={[
                    styles.actionArrow,
                    openActionId === action.id && styles.arrowRotated
                  ]}>
                    <Text style={styles.arrowText}>⌵</Text>
                  </View>
                </TouchableOpacity>
                {/* ✅ 상세 내용 렌더링 */}
                {renderActionDetails(action.id)}
              </React.Fragment>
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
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    overflow: 'hidden',
    // 💡 열리지 않은 항목 간의 간격
    marginBottom: 12, 
  },
  selectedAction: {
    // 항목이 열렸을 때 스타일 (모서리 둥글기 아래쪽 제거, marginBottom 제거)
    borderBottomLeftRadius: 0, 
    borderBottomRightRadius: 0,
    marginBottom: 0,
    opacity: 0.95,
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
    // transition: 'transform 0.3s ease-in-out', // RN에서는 사용 불가 (JS 기반 애니메이션 사용)
  },
  arrowRotated: {
    transform: [{ rotate: '180deg' }],
  },
  arrowText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: -2,
  },
  // ✅ 추가: 상세 내용 스타일
  detailsContainer: {
    backgroundColor: COLORS.surface, 
    padding: 16,
    paddingTop: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 12, // 다음 항목과의 간격
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0, 
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 4,
  },
  detailsContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  detailsLink: {
    fontSize: 12,
    color: COLORS.primaryDark,
    textDecorationLine: 'underline',
  },
  detailsText: { // 로딩 텍스트 스타일
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  }
});