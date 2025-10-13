// src/components/Navigation/BottomNavigation.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState, useAppDispatch, actions } from '../../store/AppContext';
import COLORS from '../../constants/colors';

const TabButton = ({ title, icon, isSelected, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [isSelected]);

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 상단 인디케이터 */}
      {isSelected && <View style={styles.topIndicator} />}
      
      <Animated.View 
        style={[
          styles.iconContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)'}
        />
      </Animated.View>
      
      <Text style={[
        styles.tabText,
        isSelected && styles.selectedTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default function BottomNavigation() {
  const { selectedTab } = useAppState();
  const dispatch = useAppDispatch();

  const tabs = [
    { title: '재난문자', icon: 'alert-circle-outline' },
    { title: '뉴스', icon: 'newspaper-outline' },
    { title: '재난요령', icon: 'book-outline' },
    { title: '대피소', icon: 'home-outline' },
  ];

  const handleTabPress = (tabTitle) => {
    if (selectedTab === tabTitle) {
      dispatch(actions.setSelectedTab(null));
    } else {
      dispatch(actions.setSelectedTab(tabTitle));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.title}
            title={tab.title}
            icon={tab.icon}
            isSelected={selectedTab === tab.title}
            onPress={() => handleTabPress(tab.title)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 25,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#7348b3', // COLORS.primaryDark보다 살짝 진한 보라색
    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal: 4,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 1,
    position: 'relative',
  },
  topIndicator: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 4,
    backgroundColor: '#ECECEC',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
    borderRadius: 20,
    
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});