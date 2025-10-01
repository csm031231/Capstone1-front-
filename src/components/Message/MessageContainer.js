/ src/components/Message/MessageContainer.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppState } from '../../store/AppContext';
import EmptyState from '../common/EmptyState';

export default function MessageContainer() {
  const { currentLocation } = useAppState();
  const [messages, setMessages] = useState([]);

  // 목업 재난문자 데이터
  const getMockMessages = () => [
    {
      id: 1,
      title: '김해시 태풍 경보 발령',
      content: '김해시에 태풍 경보가 발령되었습니다. 시민들은 외출을 자제하고 안전에 유의해 주시기 바랍니다.',
      time: '2시간 전',
      region: '김해시',
      severity: 'high',
      icon: '🌊'
    },
    {
      id: 2,
      title: '정전 안내',
      content: '김해시 장유면 일대에 정전이 발생하였습니다. 복구까지 약 2시간 소요 예정입니다.',
      time: '5시간 전',
      region: '김해시 장유면',
      severity: 'medium',
      icon: '⚡'
    },
    {
      id: 3,
      title: '강풍 주의보',
      content: '경남 일대에 강풍 주의보가 발령되었습니다. 시설물 점검 및 외출 시 주의하시기 바랍니다.',
      time: '1일 전',
      region: '경남 전체',
      severity: 'low',
      icon: '🌪️'
    }
  ];

  useEffect(() => {
    // 실제로는 API에서 데이터를 가져올 것
    setMessages(getMockMessages());
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#2196f3';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚨 재난문자</Text>
        <Text style={styles.subtitle}>총 {messages.length}건의 재난문자</Text>
        
        {currentLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 현재 위치: {currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <EmptyState
            icon="alert-circle-outline"
            title="재난문자가 없습니다"
            message="현재 발령된 재난문자가 없습니다"
          />
        ) : (
          messages.map((message) => (
            <View key={message.id} style={styles.messageItem}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageIcon}>{message.icon}</Text>
                <View style={styles.messageTitleContent}>
                  <Text style={styles.messageTitle}>{message.title}</Text>
                  <Text style={styles.messageRegion}>{message.region}</Text>
                </View>
                <View style={styles.messageTime}>
                  <Text style={styles.timeText}>{message.time}</Text>
                  <View 
                    style={[
                      styles.severityIndicator, 
                      { backgroundColor: getSeverityColor(message.severity) }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.messageContent}>{message.content}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationInfo: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#f57c00',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  messageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  messageTitleContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  messageRegion: {
    fontSize: 12,
    color: '#666',
  },
  messageTime: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});