// src/components/BottomSheet/ActionContent.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import AIChatbotModal from '../common/AIChatbotModal';
import disasterActionService from '../../services/disasterActionService'; 
import COLORS from '../../constants/colors'; 

const ActionContent = () => {
  const [showAiChat, setShowAiChat] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);
  const [actionDetails, setActionDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const mockActions = [
    {
      id: '01012',
      icon: '🌊',
      title: '태풍 대비 요령',
      subtitle: '사전준비 • 행동요령',
      color: '#9c27b0'
    },
    {
      id: '01014',
      icon: '🔥',
      title: '화재 발생시 대피',
      subtitle: '초기대응 • 대피방법',
      color: '#795548'
    },
    {
      id: '01011',
      icon: '⚡',
      title: '지진 발생시 행동',
      subtitle: '실내 • 실외 대응',
      color: '#607d8b'
    },
    {
      id: 'blackout',
      icon: '🌪️',
      title: '강풍 주의사항',
      subtitle: '외출금지 • 안전수칙',
      color: '#ff9800'
    }
  ];
  
  const handleActionItemPress = async (action) => {
    if (openActionId === action.id) {
      setOpenActionId(null);
      return;
    }
    
    setOpenActionId(action.id);
    if (actionDetails[action.id]) return;

    // ✅ [수정] '구현 예정' 문구 제거 -> 실제 강풍 대비 요령 내용으로 대체
    if (action.id === 'blackout') {
        setActionDetails(prev => ({
            ...prev,
            [action.id]: {
                title: action.title,
                content: `1. 간판, 창문 등 낙하물 위험이 있는 곳을 피하세요.\n2. 유리창 파손에 대비해 안전필름을 부착하거나 창문틀을 고정하세요.\n3. 외출을 자제하고 안전한 실내에 머무르세요.\n4. 공사장이나 전신주 근처에는 접근하지 마세요.`,
                url: null
            }
        }));
        return;
    }

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
          setActionDetails(prev => ({
            ...prev,
            [action.id]: {
              title: action.title,
              content: `현재 ${action.title}에 대한 상세 행동요령 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.`,
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
              content: '데이터를 불러오는 데 실패했습니다.',
              url: null
            }
        }));
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderActionDetails = (actionId) => {
    if (openActionId !== actionId) return null;
    const details = actionDetails[actionId];
    
    if (isLoading && !details) {
      return (
        <View style={styles.detailsLoadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.detailsLoadingText}>정보를 불러오는 중...</Text>
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
            [더보기: {details.url.substring(0, 30)}...]
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={styles.header}>
          <Text style={styles.headerTitle}>재난 행동요령</Text>
          <Text style={styles.headerSubtitle}>AI 도우미와 대화하거나 아래 요령을 확인하세요</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.aiChatButton}
            onPress={() => setShowAiChat(true)}
            activeOpacity={0.9}
          >
            <View style={styles.aiIconCircle}>
                <Text style={{fontSize: 22}}>🤖</Text>
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.aiChatButtonTitle}>AI 안전 도우미</Text>
                <Text style={styles.aiChatButtonSubtitle}>무엇이든 물어보세요!</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.itemList}>
            {mockActions.map((item) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity 
                  style={[
                    styles.cardItem,
                    openActionId === item.id && styles.cardItemSelected 
                  ]}
                  onPress={() => handleActionItemPress(item)}
                  activeOpacity={0.8} 
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${item.color}15` }]}>
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
                    ▼
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
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
    left: 13,
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  aiChatButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  aiIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  aiChatButtonTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 2,
  },
  aiChatButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  itemList: {
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 12,
    zIndex: 1,
  },
  cardItemSelected: {
    borderBottomLeftRadius: 0, 
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    marginBottom: 0, 
    backgroundColor: '#fafafa',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionIconText: {
    fontSize: 22,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionArrow: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  arrowRotated: {
    transform: [{ rotate: '180deg' }],
    color: COLORS.primary,
  },
  detailsContainer: {
    backgroundColor: '#fafafa', 
    padding: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 1, 
    borderColor: COLORS.border,
    marginBottom: 12,
    marginTop: -1, 
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  detailsContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  detailsLink: {
    fontSize: 13,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  detailsLoadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    marginTop: -1,
  },
  detailsLoadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  }
});

export default ActionContent;