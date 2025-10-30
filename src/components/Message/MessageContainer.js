// src/components/Message/MessageContainer.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppState } from '../../store/AppContext';
import EmptyState from '../common/EmptyState';
import emergencyMessageService from '../../services/emergencyMessageService';

export default function MessageContainer() {
  const { currentLocation } = useAppState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRegionName = () => {
    if (currentLocation && currentLocation.favoriteRegion) {
        return currentLocation.favoriteRegion;
    }
    return '김해시'; 
  }

  useEffect(() => {
    loadMessages();
  }, [currentLocation]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const regionName = getRegionName();
      const response = await emergencyMessageService.getEmergencyMessages(regionName);
      
      if (response.success && response.messages) {
        setMessages(response.messages);
      } else {
         setMessages([]);
      }
    } catch (error) {
      console.error('재난문자 로드 실패:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'emergency': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'weather': return '🌦️';
      case 'earthquake': return '🏗️';
      case 'fire': return '🔥';
      case 'flood': return '🌊';
      default: return '🚨';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚨 재난문자</Text>
        <Text style={styles.subtitle}>
          {loading ? '문자를 불러오는 중...' : `총 ${messages.length}건의 재난문자`}
        </Text>
        
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 현재 위치: {currentLocation?.favoriteRegion || getRegionName()}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4285f4" />
            </View>
        ) : messages.length === 0 ? (
          <EmptyState
            icon="alert-circle-outline"
            title="재난문자가 없습니다"
            message="현재 발령된 재난문자가 없거나 조회에 실패했습니다"
          />
        ) : (
          messages.map((message) => (
            <View key={message.id} style={styles.messageItem}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageIcon}>{getCategoryIcon(message.category)}</Text>
                <View style={styles.messageTitleContent}>
                  <Text style={styles.messageTitle}>{message.title}</Text>
                  <Text style={styles.messageRegion}>{message.location}</Text>
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
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  }
});