// src/components/BottomSheet/BottomSheet.js
import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState, useAppDispatch, actions } from '../../store/AppContext';
import NewsContent from './NewsContent';
import ShelterContent from './ShelterContent';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = 200;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.85;

export default function BottomSheet() {
  const { selectedTab, currentLocation, currentViewport } = useAppState();
  const dispatch = useAppDispatch();
  const [isVisible, setIsVisible] = React.useState(false);
  const pan = useRef(new Animated.Value(0)).current;

  const touchState = useRef({
    isDragging: false,
    startY: 0,
    lastY: 0
  });

  const prevTab = useRef(selectedTab);

  // 탭이 변경되면 모달 토글
  React.useEffect(() => {
    if (selectedTab === null) {
      // 탭이 null이면 모달 닫기
      setIsVisible(false);
    } else if (selectedTab !== prevTab.current) {
      // 다른 탭을 누르면 무조건 열기
      setIsVisible(true);
    }
    prevTab.current = selectedTab;
  }, [selectedTab]);

  const getCurrentRegion = () => {
    if (currentViewport && currentViewport.region) {
      return currentViewport.region;
    }
    return '전국';
  };

  const handleClose = () => {
    setIsVisible(false);
    dispatch(actions.setSelectedTab(null));
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const isInHandleArea = evt.nativeEvent.locationY <= 40;
      return isInHandleArea;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const isVerticalMove = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      const isSignificantMove = Math.abs(gestureState.dy) > 10;
      const isInHandleArea = evt.nativeEvent.locationY <= 40;
      
      return isInHandleArea && isVerticalMove && isSignificantMove;
    },

    onPanResponderGrant: (evt) => {
      try {
        touchState.current = {
          isDragging: true,
          startY: evt.nativeEvent.pageY,
          lastY: evt.nativeEvent.pageY
        };
        
        pan.setOffset(pan._value);
        pan.setValue(0);
      } catch (error) {
        console.warn('PanResponder grant error:', error);
      }
    },

    onPanResponderMove: (evt, gestureState) => {
      if (!touchState.current.isDragging) return;
      
      try {
        touchState.current.lastY = evt.nativeEvent.pageY;
        pan.setValue(-gestureState.dy);
      } catch (error) {
        console.warn('PanResponder move error:', error);
      }
    },

    onPanResponderRelease: (evt, gestureState) => {
      try {
        if (!touchState.current.isDragging) return;
        
        touchState.current.isDragging = false;
        pan.flattenOffset();
        
        const currentValue = pan._value;
        const maxValue = MAX_HEIGHT - MIN_HEIGHT;
        
        // 아래로 많이 드래그하면 닫기
        if (gestureState.dy > 100) {
          handleClose();
          return;
        }
        
        if (currentValue < 0) {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 10,
          }).start();
        } else if (currentValue > maxValue) {
          Animated.spring(pan, {
            toValue: maxValue,
            useNativeDriver: false,
            tension: 100,
            friction: 10,
          }).start();
        }
      } catch (error) {
        console.warn('PanResponder release error:', error);
      }
    },

    onPanResponderTerminate: () => {
      try {
        touchState.current.isDragging = false;
        pan.flattenOffset();
      } catch (error) {
        console.warn('PanResponder terminate error:', error);
      }
    },

    onPanResponderTerminationRequest: () => false,
  }), [pan]);

  const animatedStyle = {
    height: pan.interpolate({
      inputRange: [0, MAX_HEIGHT - MIN_HEIGHT],
      outputRange: [MIN_HEIGHT, MAX_HEIGHT],
      extrapolate: 'clamp',
    }),
  };

  const renderTabContent = () => {
    const currentRegion = getCurrentRegion();
    
    switch (selectedTab) {
      case '뉴스':
        return <NewsContent isVisible={true} currentRegion={currentRegion} />;
        
      case '대피소':
        return <ShelterContent isVisible={true} currentLocation={currentLocation} />;
        
      case '재난문자':
        return (
          <ScrollView style={styles.defaultScrollView}>
            <View style={styles.defaultContent}>
              <Text style={styles.defaultTitle}>🚨 재난문자</Text>
              <Text style={styles.defaultText}>재난문자 전체 목록을 표시합니다.</Text>
              <View style={styles.itemList}>
                {[
                  { icon: '🌊', title: '호우 경보', subtitle: '2시간 전 • 경남 김해시', color: '#f44336' },
                  { icon: '⚡', title: '정전 안내', subtitle: '5시간 전 • 김해 장유', color: '#ff9800' },
                  { icon: '🌪️', title: '강풍 주의보', subtitle: '1일 전 • 경남 전체', color: '#2196f3' }
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={styles.listItem}>
                    <View style={[styles.listItemIcon, {backgroundColor: item.color}]}>
                      <Text style={styles.listItemIconText}>{item.icon}</Text>
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{item.title}</Text>
                      <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        );
        
      case '재난행동요령':
        return (
          <ScrollView style={styles.defaultScrollView}>
            <View style={styles.defaultContent}>
              <Text style={styles.defaultTitle}>🤖 재난 행동요령</Text>
              <Text style={styles.defaultText}>AI 도우미와 대화하거나 아래 요령을 확인하세요</Text>
              
              <TouchableOpacity style={styles.aiChatButton}>
                <Text style={styles.aiChatButtonText}>AI 도우미와 채팅하기</Text>
              </TouchableOpacity>
              
              <View style={styles.itemList}>
                {[
                  { icon: '🌊', title: '태풍 대비 요령', subtitle: '사전준비 • 행동요령', color: '#9c27b0' },
                  { icon: '🔥', title: '화재 발생시 대피', subtitle: '초기대응 • 대피방법', color: '#795548' },
                  { icon: '⚡', title: '지진 발생시 행동', subtitle: '실내 • 실외 대응', color: '#607d8b' },
                  { icon: '🌪️', title: '강풍 주의사항', subtitle: '외출금지 • 안전수칙', color: '#ff9800' }
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={styles.actionItem}>
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
        );

      default:
        return (
          <View style={styles.defaultContent}>
            <Text style={styles.defaultTitle}>📋 {selectedTab}</Text>
            <Text style={styles.defaultText}>선택된 탭의 내용을 표시합니다.</Text>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <Animated.View style={[styles.bottomSheet, animatedStyle]}>
            <View 
              style={styles.handleContainer}
              {...panResponder.panHandlers}
            >
              <View style={styles.handleRow}>
                <View style={styles.bottomSheetHandle} />
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                 
                </TouchableOpacity>
              </View>
              <Text style={styles.handleHint}>드래그하여 확장/축소</Text>
            </View>

            {renderTabContent()}
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // 모달 배경 전체를 덮는 오버레이 스타일 (Bottom Sheet 뒤의 반투명 배경)
  modalOverlay: {
    flex: 1, // 전체 화면을 꽉 채움
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검은색 배경
    justifyContent: 'flex-end', // 내용을 컨테이너의 맨 아래에 배치 (Bottom Sheet를 바닥에 위치시킴)
  },
  // Bottom Sheet 컨테이너 스타일 (실제 내용이 담기는 하단 시트)
  bottomSheet: {
    backgroundColor: '#ffffff', // 흰색 배경
    borderTopLeftRadius: 16, // 왼쪽 상단 모서리 둥글게
    borderTopRightRadius: 16, // 오른쪽 상단 모서리 둥글게
    elevation: 8, // Android용 그림자 효과
    shadowColor: '#000', // iOS용 그림자 색상
    shadowOffset: { width: 0, height: -2 }, // 그림자 오프셋: 위쪽으로 그림자가 드리워짐
    shadowOpacity: 0.1, // 그림자 불투명도
    shadowRadius: 8, // 그림자 반경
  },
  // Bottom Sheet의 상단 핸들(잡고 끌어올리는 부분) 컨테이너 스타일
  handleContainer: {
    paddingVertical: 13, // 상하 내부 여백
    paddingHorizontal: 16, // 좌우 내부 여백
    backgroundColor: '#f8f9fa', // 연한 회색 배경
    borderTopLeftRadius: 16, // 모서리 둥글게 (Sheet의 모서리와 일치)
    borderTopRightRadius: 16, // 모서리 둥글게
  },
  // 핸들 및 힌트 텍스트를 포함하는 행 스타일
  handleRow: {
    flexDirection: 'row', // 내용을 가로로 배치
    alignItems: 'center', // 수직 중앙 정렬
    justifyContent: 'center', // 수평 중앙 정렬
    marginBottom: 4, // 하단 외부 여백
  },
  // Bottom Sheet를 잡고 올릴 수 있음을 시각적으로 보여주는 작은 바 스타일
  bottomSheetHandle: {
    width: 40, // 너비
    height: 4, // 높이
    backgroundColor: '#ddd', // 연한 회색 배경색
    borderRadius: 2, // 둥근 모서리
  },
  // 닫기 버튼 스타일 (핸들 컨테이너 내부에 절대 위치로 배치될 것으로 예상)
  closeButton: {
    position: 'absolute', // 절대 위치 설정
    right: 0, // 오른쪽 끝에 배치
    padding: 4, // 클릭 영역 확보를 위한 여백
  },
  // 핸들 아래에 표시될 수 있는 작은 힌트 텍스트 스타일
  handleHint: {
    fontSize: 10, // 글자 크기
    color: '#999', // 회색 글자색
    textAlign: 'center', // 텍스트 중앙 정렬
  },
  // 기본 콘텐츠를 담는 ScrollView 스타일
  defaultScrollView: {
    maxHeight: MAX_HEIGHT - 60, // 최대 높이 설정 (화면 전체 높이에서 일정 부분 제외)
  },
  // 기본 콘텐츠 영역의 내부 여백 스타일
  defaultContent: {
    padding: 16, // 상하좌우 내부 여백
  },
  // 기본 콘텐츠 제목 텍스트 스타일
  defaultTitle: {
    fontSize: 20, // 글자 크기
    fontWeight: 'bold', // 굵은 글씨
    color: '#333', // 어두운 글자색
    marginBottom: 8, // 하단 외부 여백
  },
  // 기본 콘텐츠 일반 텍스트 스타일
  defaultText: {
    fontSize: 14, // 글자 크기
    color: '#666', // 중간 회색 글자색
    marginBottom: 16, // 하단 외부 여백
  },
  // AI 챗봇 실행 버튼 스타일
  aiChatButton: {
    backgroundColor: '#4285f4', // 구글 블루 계열의 배경색
    paddingHorizontal: 20, // 좌우 내부 여백
    paddingVertical: 12, // 상하 내부 여백
    borderRadius: 25, // 매우 둥근 모서리 (알약 모양)
    alignItems: 'center', // 텍스트 중앙 정렬
    marginBottom: 16, // 하단 외부 여백
  },
  // AI 챗봇 버튼 텍스트 스타일
  aiChatButtonText: {
    fontSize: 16, // 글자 크기
    color: '#ffffff', // 흰색 글자색
    fontWeight: '600', // 글자 두께
  },
  // 목록 아이템을 감싸는 컨테이너 스타일
  itemList: {
    marginTop: 8, // 상단 외부 여백
  },
  // 목록의 개별 아이템 스타일 (대피소 목록 등으로 예상)
  listItem: {
    flexDirection: 'row', // 내용을 가로로 배치
    alignItems: 'center', // 수직 중앙 정렬
    backgroundColor: '#ffffff', // 흰색 배경
    borderRadius: 12, // 둥근 모서리
    padding: 12, // 내부 여백
    marginBottom: 8, // 하단 외부 여백
    borderWidth: 1, // 테두리 선
    borderColor: '#e0e0e0', // 연한 회색 테두리
    elevation: 1, // Android용 아주 약한 그림자
    shadowColor: '#000', // iOS용 그림자 색상
    shadowOffset: { width: 0, height: 1 }, // 아래로 약하게 드리우는 그림자
    shadowOpacity: 0.05, // 매우 낮은 불투명도
    shadowRadius: 2, // 그림자 반경
  },
  // 목록 아이템 좌측의 아이콘 컨테이너 스타일
  listItemIcon: {
    width: 40, // 너비
    height: 40, // 높이
    borderRadius: 20, // 둥근 원 모양
    alignItems: 'center', // 내부 요소를 수평 중앙 정렬
    justifyContent: 'center', // 내부 요소를 수직 중앙 정렬
    marginRight: 12, // 오른쪽 외부 여백
  },
  // 목록 아이템 아이콘의 텍스트 스타일 (이모지 등으로 예상)
  listItemIconText: {
    fontSize: 18, // 글자 크기
    color: '#ffffff', // 흰색 글자색
  },
  // 목록 아이템의 제목/부제목을 포함하는 컨테이너 스타일
  listItemContent: {
    flex: 1, // 남은 공간을 모두 차지
  },
  // 목록 아이템의 제목 스타일
  listItemTitle: {
    fontSize: 15, // 글자 크기
    fontWeight: '600', // 글자 두께
    color: '#333', // 어두운 글자색
    marginBottom: 2, // 하단 외부 여백
  },
  // 목록 아이템의 부제목/설명 스타일
  listItemSubtitle: {
    fontSize: 13, // 글자 크기
    color: '#666', // 중간 회색 글자색
  },
  // 특별한 '액션'을 유도하는 아이템 스타일 (버튼 또는 링크 역할)
  actionItem: {
    flexDirection: 'row', // 내용을 가로로 배치
    alignItems: 'center', // 수직 중앙 정렬
    backgroundColor: '#ffffff', // 흰색 배경
    borderRadius: 12, // 둥근 모서리
    padding: 16, // 내부 여백
    marginBottom: 12, // 하단 외부 여백
    borderWidth: 1, // 테두리 선
    borderColor: '#e0e0e0', // 연한 회색 테두리
    elevation: 2, // Android용 약한 그림자
    shadowColor: '#000', // iOS용 그림자 색상
    shadowOffset: { width: 0, height: 1 }, // 아래로 약하게 드리우는 그림자
    shadowOpacity: 0.1, // 낮은 불투명도
    shadowRadius: 2, // 그림자 반경
  },
  // 액션 아이템 좌측의 큰 아이콘 컨테이너 스타일
  actionIcon: {
    width: 48, // 너비
    height: 48, // 높이
    borderRadius: 24, // 둥근 원 모양
    alignItems: 'center', // 내부 요소를 수평 중앙 정렬
    justifyContent: 'center', // 내부 요소를 수직 중앙 정렬
    marginRight: 16, // 오른쪽 외부 여백
  },
  // 액션 아이콘의 텍스트 스타일
  actionIconText: {
    fontSize: 24, // 큰 글자 크기
  },
  // 액션 아이템의 제목/부제목 컨테이너 스타일
  actionContent: {
    flex: 1, // 남은 공간을 모두 차지
  },
  // 액션 아이템의 제목 스타일
  actionTitle: {
    fontSize: 16, // 글자 크기
    fontWeight: 'bold', // 굵은 글씨
    color: '#333', // 어두운 글자색
    marginBottom: 4, // 하단 외부 여백
  },
  // 액션 아이템의 부제목/설명 스타일
  actionSubtitle: {
    fontSize: 14, // 글자 크기
    color: '#666', // 중간 회색 글자색
  },
  // 액션 아이템 우측의 화살표(>) 아이콘 스타일
  actionArrow: {
    fontSize: 24, // 글자 크기
    color: '#ccc', // 연한 회색 글자색
    fontWeight: 'bold', // 굵은 글씨
  },
});