// ============================================
// 📁 src/components/BottomSheet/MessageContent.js
// ============================================
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const MessageContent = () => {
  const mockMessages = [
    {
      id: 1,
      icon: '🌊',
      title: '호우 경보',
      subtitle: '2시간 전 • 경남 김해시',
      color: '#f44336'
    },
    {
      id: 2,
      icon: '⚡',
      title: '정전 안내',
      subtitle: '5시간 전 • 김해 장유',
      color: '#ff9800'
    },
    {
      id: 3,
      icon: '🌪️',
      title: '강풍 주의보',
      subtitle: '1일 전 • 경남 전체',
      color: '#2196f3'
    }
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <Text style={styles.title}>🚨 재난문자</Text>
        <Text style={styles.text}>재난문자 전체 목록을 표시합니다.</Text>
        
        <View style={styles.itemList}>
          {mockMessages.map((item) => (
            <TouchableOpacity key={item.id} style={styles.listItem}>
              <View style={[styles.listItemIcon, { backgroundColor: item.color }]}>
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
  itemList: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemIconText: {
    fontSize: 18,
    color: '#ffffff',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});

export default MessageContent;