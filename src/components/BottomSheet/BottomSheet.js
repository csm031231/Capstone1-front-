// src/components/BottomSheet/BottomSheet.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Keyboard,
} from 'react-native';
import { useAppState, useAppDispatch, actions } from '../../store/AppContext';
import NewsContent from './NewsContent';
import ShelterContent from './ShelterContent';
import MessageContent from './MessageContent';
import ActionContent from './ActionContent';
import COLORS from '../../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 🎯 고정 높이값들
const BOTTOM_NAV_HEIGHT = 60;  // 하단 네비게이션 바 높이
const PEEK_HEIGHT = 138;        // 미리보기 높이
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8; // 확장 높이

export default function BottomSheet() {
  const { selectedTab } = useAppState();
  const dispatch = useAppDispatch();
  
  // 애니메이션 값 (0 = 닫힘, PEEK_HEIGHT = 미리보기, EXPANDED_HEIGHT = 확장)
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = React.useState(false);

  // 탭 선택/해제에 따른 애니메이션
  useEffect(() => {
    if (selectedTab) {
      // 탭 선택됨 -> 미리보기로 열기
      openSheet(false);
    } else {
      // 탭 해제됨 -> 닫기
      closeSheet();
    }
  }, [selectedTab]);

  // 전역 함수 등록
  useEffect(() => {
    window.closeBottomSheet = () => {
      handleClose();
    };

    return () => {
      delete window.closeBottomSheet;
    };
  }, []);

  // 🟢 시트 열기
  const openSheet = (expanded = false) => {
    setIsExpanded(expanded);
    const toValue = expanded ? EXPANDED_HEIGHT : PEEK_HEIGHT;
    
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  };

  // 🔴 시트 닫기
  const closeSheet = () => {
    setIsExpanded(false);
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  // ❌ 완전히 닫기 (탭도 초기화)
  const handleClose = () => {
    Keyboard.dismiss();
    closeSheet();
    setTimeout(() => {
      dispatch(actions.setSelectedTab(null));
    }, 200);
  };

  // ⬆️ 확장
  const expandSheet = () => {
    setIsExpanded(true);
    Animated.spring(animatedHeight, {
      toValue: EXPANDED_HEIGHT,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  };

  // ⬇️ 축소
  const collapseSheet = () => {
    setIsExpanded(false);
    Animated.spring(animatedHeight, {
      toValue: PEEK_HEIGHT,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  };

  // 🖐️ PanResponder (드래그 핸들러)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 세로 방향 움직임이 가로보다 크면 응답
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderGrant: () => {
        animatedHeight.setOffset(animatedHeight._value);
        animatedHeight.setValue(0);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // 아래로 드래그: dy > 0 (음수로 적용)
        // 위로 드래그: dy < 0 (양수로 적용)
        animatedHeight.setValue(-gestureState.dy);
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        animatedHeight.flattenOffset();
        
        const { dy, vy } = gestureState;
        const currentHeight = animatedHeight._value;
        
        // 🔽 빠르게 아래로 스와이프 또는 많이 내림 → 닫기
        if ((vy > 0.5 && dy > 0) || dy > 100) {
          handleClose();
          return;
        }
        
        // 🔼 빠르게 위로 스와이프 → 확장
        if ((vy < -0.5 && dy < 0) || dy < -100) {
          expandSheet();
          return;
        }
        
        // 현재 높이에 따라 결정
        if (isExpanded) {
          // 확장 상태에서 중간 이하로 내려가면 축소
          if (currentHeight < EXPANDED_HEIGHT * 0.7) {
            collapseSheet();
          } else {
            expandSheet();
          }
        } else {
          // 미리보기 상태에서 일정 높이 이상 올라가면 확장
          if (currentHeight > PEEK_HEIGHT * 1.3) {
            expandSheet();
          } else if (currentHeight < PEEK_HEIGHT * 0.5) {
            handleClose();
          } else {
            collapseSheet();
          }
        }
      },
      
      onPanResponderTerminate: () => {
        animatedHeight.flattenOffset();
      },
    })
  ).current;

  // 선택된 탭의 콘텐츠 렌더링
  const renderTabContent = () => {
    if (!selectedTab) return null;
    
    switch (selectedTab) {
      case '뉴스':
        return <NewsContent isVisible={true} />;
      case '대피소':
        return <ShelterContent isVisible={true} />;
      case '재난문자':
        return <MessageContent />;
      case '재난행동요령':
      case '재난요령':
        return <ActionContent />;
      default:
        return null;
    }
  };

  // 시트가 열려있지 않으면 아무것도 렌더링하지 않음
  if (!selectedTab) {
    return null;
  }

  // backdrop 투명도 계산
  const backdropOpacity = animatedHeight.interpolate({
    inputRange: [0, PEEK_HEIGHT],
    outputRange: [0, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* 🌑 Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
            pointerEvents: selectedTab ? 'auto' : 'none',
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* 📄 BottomSheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: animatedHeight.interpolate({
              inputRange: [0, EXPANDED_HEIGHT],
              outputRange: [0, EXPANDED_HEIGHT],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        {/* 🎯 Handle Area */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handleBar} />
        </View>

        {/* 📦 Content */}
        <View style={styles.contentWrapper}>
          {renderTabContent()}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: BOTTOM_NAV_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 999,
    overflow: 'hidden',
  },
  handleArea: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
});