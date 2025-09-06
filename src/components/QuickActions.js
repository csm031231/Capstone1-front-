import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const QuickActions = ({ onActionPress }) => {
  const [selectedAction, setSelectedAction] = useState(null);

  const quickActionData = [
    {
      id: 'earthquake',
      title: '지진 대응',
      subtitle: '지진 발생시 행동요령',
      icon: '🏗️',
      color: '#ff9800',
      description: '지진 발생시 안전한 대피 방법을 확인하세요'
    },
    {
      id: 'fire',
      title: '화재 대응',
      subtitle: '화재 발생시 대피요령',
      icon: '🔥',
      color: '#f44336',
      description: '화재 발생시 신속한 대피 방법을 확인하세요'
    },
    {
      id: 'flood',
      title: '수해 대응',
      subtitle: '홍수/태풍 대비요령',
      icon: '🌊',
      color: '#2196f3',
      description: '홍수나 태풍 발생시 대비 방법을 확인하세요'
    },
    {
      id: 'blackout',
      title: '정전 대응',
      subtitle: '정전 발생시 행동요령',
      icon: '⚡',
      color: '#607d8b',
      description: '정전 발생시 안전한 행동 방법을 확인하세요'
    },
    {
      id: 'shelter',
      title: '대피소 찾기',
      subtitle: '주변 대피소 위치',
      icon: '🏠',
      color: '#4caf50',
      description: '현재 위치 기준 가까운 대피소를 찾아보세요'
    },
    {
      id: 'emergency',
      title: '긴급신고',
      subtitle: '119/112 신고',
      icon: '🚨',
      color: '#e91e63',
      description: '긴급상황 발생시 신속한 신고를 도와드립니다'
    }
  ];

  const handleActionPress = (action) => {
    setSelectedAction(action.id);
    
    // 부모 컴포넌트에 액션 전달
    if (onActionPress) {
      onActionPress(action);
    }
    
    // 선택 효과를 위한 타이머
    setTimeout(() => {
      setSelectedAction(null);
    }, 200);
  };

  const renderActionItem = (action) => (
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>빠른 행동요령</Text>
        <Text style={styles.headerSubtitle}>긴급상황별 대응 방법을 빠르게 확인하세요</Text>
      </View>
      
      <ScrollView 
        style={styles.actionsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.actionsContent}
      >
        {quickActionData.map(renderActionItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionsList: {
    flex: 1,
  },
  actionsContent: {
    padding: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285f4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedAction: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default QuickActions;