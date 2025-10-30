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
  Platform,
} from 'react-native';
import { useAppState, useAppDispatch, actions } from '../../store/AppContext';
import NewsContent from './NewsContent';
import ShelterContent from './ShelterContent';
import MessageContent from './MessageContent';
import ActionContent from './ActionContent';
import COLORS from '../../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 🎯 고정 높이값들
const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 70 : 60;
const PEEK_HEIGHT = 138;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8;

export default function BottomSheet() {
  const { selectedTab } = useAppState();
  const dispatch = useAppDispatch();
  
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = React.useState(false);

  useEffect(() => {
    if (selectedTab) {
      openSheet(false);
    } else {
      closeSheet();
    }
  }, [selectedTab]);

  useEffect(() => {
    window.closeBottomSheet = () => {
      handleClose();
    };
    window.closeBottomSheetOnly = () => {
        collapseSheet();
    };

    return () => {
      delete window.closeBottomSheet;
      delete window.closeBottomSheetOnly;
    };
  }, []);

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

  const closeSheet = () => {
    setIsExpanded(false);
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    closeSheet();
    setTimeout(() => {
      dispatch(actions.setSelectedTab(null));
      if (window.blurSearchInput) { 
        window.blurSearchInput();
      }
    }, 200);
  };

  const expandSheet = () => {
    setIsExpanded(true);
    Animated.spring(animatedHeight, {
      toValue: EXPANDED_HEIGHT,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  };

  const collapseSheet = () => {
    setIsExpanded(false);
    Animated.spring(animatedHeight, {
      toValue: PEEK_HEIGHT,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderGrant: () => {
        animatedHeight.setOffset(animatedHeight._value);
        animatedHeight.setValue(0);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        animatedHeight.setValue(-gestureState.dy);
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        animatedHeight.flattenOffset();
        
        const { dy, vy } = gestureState;
        const currentHeight = animatedHeight._value;
        
        if ((vy > 0.5 && dy > 0) || dy > 100) {
          handleClose();
          return;
        }
        
        if ((vy < -0.5 && dy < 0) || dy < -100) {
          expandSheet();
          return;
        }
        
        if (isExpanded) {
          if (currentHeight < EXPANDED_HEIGHT * 0.6) {
            collapseSheet();
          } else {
            expandSheet();
          }
        } else {
          if (currentHeight > PEEK_HEIGHT * 1.3) {
            expandSheet();
          } else if (currentHeight < PEEK_HEIGHT * 0.4) {
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

  if (!selectedTab) {
    return null;
  }

  const backdropOpacity = animatedHeight.interpolate({
    inputRange: [0, PEEK_HEIGHT],
    outputRange: [0, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <>
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
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handleBar} />
        </View>

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