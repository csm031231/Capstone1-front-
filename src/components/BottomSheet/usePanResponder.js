// ============================================
// 📁 src/components/BottomSheet/usePanResponder.js
// ============================================
import { useRef, useMemo } from 'react';
import { PanResponder, Animated } from 'react-native';

const MIN_HEIGHT = 200;
const MAX_HEIGHT_RATIO = 0.85;

export const usePanResponder = (pan, onClose, screenHeight) => {
  const touchState = useRef({
    isDragging: false,
    startY: 0,
    lastY: 0
  });

  const MAX_HEIGHT = screenHeight * MAX_HEIGHT_RATIO;

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
          onClose();
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
  }), [pan, onClose, MAX_HEIGHT]);

  const animatedStyle = {
    height: pan.interpolate({
      inputRange: [0, MAX_HEIGHT - MIN_HEIGHT],
      outputRange: [MIN_HEIGHT, MAX_HEIGHT],
      extrapolate: 'clamp',
    }),
  };

  return { panResponder, animatedStyle };
};