import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 아이콘 라이브러리

const TabButton = ({ title, icon, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, isSelected && styles.selectedTab]}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={24}
      color={isSelected ? '#fff' : '#888'}
      style={{ marginBottom: 4 }}
    />
    <Text style={[styles.tabText, isSelected && styles.selectedTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const BottomNavigation = ({ selectedTab, setSelectedTab }) => {
  const tabs = [
    { title: '재난문자', icon: 'alert-circle-outline' },
    { title: '뉴스', icon: 'newspaper-outline' },
    { title: '재난행동요령', icon: 'book-outline' },
    { title: '대피소', icon: 'home-outline' },
  ];

  return (
    <View style={styles.bottomNavigation}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.title}
          title={tab.title}
          icon={tab.icon}
          isSelected={selectedTab === tab.title}
          onPress={() => setSelectedTab(tab.title)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 0,
    paddingVertical: 12,
    paddingBottom: 45,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTab: {
    backgroundColor: '#ff4444',
    borderColor: '#ff6666',
    elevation: 4,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '600',
  },
  selectedTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default BottomNavigation;
