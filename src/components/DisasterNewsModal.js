import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';

const DisasterNewsModal = ({ visible, onClose }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // 뉴스 데이터 가져오기
  const fetchNews = async () => {
    setLoading(true);
    try {
      // 실제 구현시 API 호출
      const mockNews = [
        {
          id: 1,
          title: '태풍 힌남노 경로 분석 및 대비 요령',
          content: '기상청에 따르면 태풍 힌남노가 한반도를 향해 북상하고 있어 각별한 주의가 필요합니다...',
          source: 'KBS 뉴스',
          time: '30분 전',
          category: '태풍',
          thumbnail: '🌪️',
          url: 'https://news.kbs.co.kr/news/view.do?ncd=example'
        },
        {
          id: 2,
          title: '지진 대비 행동요령 및 대피소 위치 안내',
          content: '최근 경주 지역에서 발생한 지진을 계기로 시민들의 지진 대비 의식이 높아지고 있습니다...',
          source: 'MBC 뉴스',
          time: '1시간 전',
          category: '지진',
          thumbnail: '🏗️',
          url: 'https://imnews.imbc.com/news/2023/example'
        },
        {
          id: 3,
          title: '긴급재난문자 시스템 고도화 작업 완료',
          content: '행정안전부는 긴급재난문자 시스템의 신속성과 정확성을 높이기 위한 고도화 작업을 완료했다고 발표했습니다...',
          source: '연합뉴스',
          time: '2시간 전',
          category: '시스템',
          thumbnail: '📱',
          url: 'https://www.yna.co.kr/view/example'
        },
        {
          id: 4,
          title: '겨울철 한파 대비 취약계층 보호 대책 발표',
          content: '정부가 올겨울 한파에 대비해 독거노인, 노숙인 등 취약계층 보호를 위한 종합대책을 발표했습니다...',
          source: 'SBS 뉴스',
          time: '3시간 전',
          category: '한파',
          thumbnail: '❄️',
          url: 'https://news.sbs.co.kr/news/example'
        },
        {
          id: 5,
          title: 'AI 기반 재난예측 시스템 도입 확산',
          content: '전국 지자체에서 인공지능 기술을 활용한 재난예측 및 대응 시스템 도입이 확산되고 있습니다...',
          source: 'YTN',
          time: '4시간 전',
          category: '기술',
          thumbnail: '🤖',
          url: 'https://www.ytn.co.kr/news/example'
        },
        {
          id: 6,
          title: '전국 대피소 시설 점검 및 보완 작업 진행',
          content: '행정안전부는 전국 지정 대피소의 시설 현황을 점검하고 미비점을 보완하는 작업을 진행 중이라고 밝혔습니다...',
          source: 'JTBC 뉴스',
          time: '5시간 전',
          category: '대피소',
          thumbnail: '🏠',
          url: 'https://news.jtbc.joins.com/example'
        }
      ];

      setNews(mockNews);
    } catch (error) {
      console.error('뉴스 데이터 가져오기 실패:', error);
      Alert.alert('오류', '뉴스 정보를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchNews();
    }
  }, [visible]);

  // 뉴스 기사 열기
  const openNews = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('오류', '기사를 열 수 없습니다.');
        }
      })
      .catch((err) => console.error('뉴스 열기 오류:', err));
  };

  // 카테고리별 배경색
  const getCategoryColor = (category) => {
    switch (category) {
      case '태풍':
        return '#2196f3';
      case '지진':
        return '#ff9800';
      case '화재':
        return '#f44336';
      case '한파':
        return '#607d8b';
      case '시스템':
        return '#9c27b0';
      case '기술':
        return '#4caf50';
      case '대피소':
        return '#795548';
      default:
        return '#666';
    }
  };

  const renderNewsItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.newsItem}
      onPress={() => openNews(item.url)}
      activeOpacity={0.7}
    >
      <View style={styles.newsHeader}>
        <Text style={styles.newsThumbnail}>{item.thumbnail}</Text>
        <View style={styles.newsMetadata}>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.newsTime}>{item.time}</Text>
        </View>
      </View>
      
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsContent} numberOfLines={3}>{item.content}</Text>
      
      <View style={styles.newsFooter}>
        <Text style={styles.newsSource}>{item.source}</Text>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>자세히 보기 →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📰 재난 뉴스</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subtitle}>
            <Text style={styles.subtitleText}>최신 재난 관련 뉴스를 확인하세요</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285f4" />
              <Text style={styles.loadingText}>뉴스를 가져오는 중...</Text>
            </View>
          ) : (
            <ScrollView style={styles.newsList} showsVerticalScrollIndicator={false}>
              {news.length > 0 ? (
                news.map(renderNewsItem)
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>뉴스가 없습니다</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  subtitle: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  newsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  newsItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsThumbnail: {
    fontSize: 24,
  },
  newsMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  newsTime: {
    fontSize: 12,
    color: '#666',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  newsSource: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  readMoreButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  readMoreText: {
    fontSize: 12,
    color: '#4285f4',
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DisasterNewsModal;