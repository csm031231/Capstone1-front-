import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';

// 별도 컴포넌트들 import
import DisasterAlertModal from './DisasterAlertModal';
import DisasterNewsModal from './DisasterNewsModal';
import ShelterModal from './ShelterModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = 140;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.85;

const BottomSheet = ({ 
  selectedTab = '재난문자', 
  currentLocation = null, 
  currentViewport = null,
  mapRef = null 
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [showAiChat, setShowAiChat] = useState(false);
  
  // 모달 상태들
  const [showShelterModal, setShowShelterModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  const buttonScale = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.3)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! 재난 행동요령 AI 도우미입니다. 어떤 재난 상황에 대해 궁금하신가요?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef(null);

  // 터치 상태 추적
  const touchState = useRef({
    isDragging: false,
    startY: 0,
    lastY: 0
  });

  // AI 챗봇 모달 애니메이션
  useEffect(() => {
    if (showAiChat) {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 0.3,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showAiChat]);

  // 탭별 모달 열기 핸들러
  const handleViewAll = () => {
    switch (selectedTab) {
      case '재난문자':
        setShowAlertModal(true);
        break;
      case '뉴스':
        setShowNewsModal(true);
        break;
      case '대피소':
        setShowShelterModal(true);
        break;
      case '재난행동요령':
        Alert.alert('재난행동요령', '재난행동요령 전체보기 기능입니다.');
        break;
      default:
        Alert.alert('알림', '해당 기능을 준비 중입니다.');
    }
  };

  const handleListItemMenu = () => {
    Alert.alert('메뉴', '리스트 아이템 메뉴 기능입니다.');
  };

  const handleAiChatToggle = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    setShowAiChat(!showAiChat);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newUserMessage = {
      id: chatMessages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const newBotMessage = {
        id: chatMessages.length + 2,
        text: botResponse,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setChatMessages(prev => [...prev, newBotMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('지진')) {
      return "🏠 지진 발생 시 행동요령:\n\n1️⃣ 즉시 튼튼한 테이블 아래로 몸을 피하세요\n2️⃣ 문과 창문을 열어 출구를 확보하세요\n3️⃣ 가스와 전기를 차단하세요\n4️⃣ 엘리베이터 사용을 금지하고 계단을 이용하세요\n5️⃣ 야외에서는 건물과 전선에서 멀리 떨어지세요";
    } else if (input.includes('화재')) {
      return "🔥 화재 발생 시 행동요령:\n\n1️⃣ 119에 즉시 신고하세요\n2️⃣ 낮은 자세로 연기를 피해 대피하세요\n3️⃣ 젖은 수건으로 코와 입을 막으세요\n4️⃣ 엘리베이터 사용 금지, 계단 이용\n5️⃣ 옷에 불이 붙으면 바닥에 누워 굴러주세요";
    } else if (input.includes('태풍') || input.includes('홍수')) {
      return "🌊 태풍/홍수 대비 행동요령:\n\n1️⃣ 저지대, 상습침수지역 피하기\n2️⃣ 실외 간판, 현수막 등 점검\n3️⃣ 하천 근처 접근 금지\n4️⃣ 지하공간 이용 자제\n5️⃣ 응급용품 사전 준비";
    } else if (input.includes('정전')) {
      return "⚡ 정전 시 행동요령:\n\n1️⃣ 한전(123) 또는 지역본부에 신고\n2️⃣ 촛불 대신 손전등 사용\n3️⃣ 냉장고, 냉동고 문 열지 말기\n4️⃣ 전기기구 플러그 뽑기\n5️⃣ 가스 중간밸브 잠그기";
    } else if (input.includes('대피소')) {
      return "🏠 주변 대피소 정보가 필요하시군요!\n\n대피소 탭에서 '+ 전체 대피소 지도보기' 버튼을 눌러보세요. 현재 위치 기준으로 가까운 대피소들을 확인할 수 있습니다.\n\n각 대피소의 수용인원, 연락처, 편의시설 정보와 함께 길찾기 기능도 제공됩니다!";
    } else {
      return "🤖 더 구체적인 재난 상황을 말씀해 주시면 정확한 행동요령을 안내해드릴게요!\n\n💡 예시:\n• '지진이 났을 때'\n• '화재 발생시'\n• '태풍 대비'\n• '정전 상황'\n• '대피소 정보'";
    }
  };

  // 개선된 드래그 핸들러 - 터치 이벤트 충돌 방지
  const panResponder = useMemo(() => PanResponder.create({
    // 터치 시작을 더 엄격하게 제어
    onStartShouldSetPanResponder: (evt, gestureState) => {
      // 핸들 영역에서만 드래그 허용
      const isInHandleArea = evt.nativeEvent.locationY <= 40;
      return isInHandleArea;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const isVerticalMove = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      const isSignificantMove = Math.abs(gestureState.dy) > 10;
      const isInHandleArea = evt.nativeEvent.locationY <= 40;
      
      return isInHandleArea && isVerticalMove && isSignificantMove;
    },

    // 터치 상태 추적 시작
    onPanResponderGrant: (evt, gestureState) => {
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

    // 드래그 중
    onPanResponderMove: (evt, gestureState) => {
      if (!touchState.current.isDragging) return;
      
      try {
        touchState.current.lastY = evt.nativeEvent.pageY;
        pan.setValue(-gestureState.dy);
      } catch (error) {
        console.warn('PanResponder move error:', error);
      }
    },

    // 터치 종료
    onPanResponderRelease: (evt, gestureState) => {
      try {
        if (!touchState.current.isDragging) return;
        
        touchState.current.isDragging = false;
        pan.flattenOffset();
        
        const currentValue = pan._value;
        const maxValue = MAX_HEIGHT - MIN_HEIGHT;
        
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

    // 터치 취소
    onPanResponderTerminate: () => {
      try {
        touchState.current.isDragging = false;
        pan.flattenOffset();
      } catch (error) {
        console.warn('PanResponder terminate error:', error);
      }
    },

    // 다른 컴포넌트가 responder가 되는 것을 방지
    onPanResponderTerminationRequest: () => false,
  }), [pan]);

  const animatedStyle = {
    height: pan.interpolate({
      inputRange: [0, MAX_HEIGHT - MIN_HEIGHT],
      outputRange: [MIN_HEIGHT, MAX_HEIGHT],
      extrapolate: 'clamp',
    }),
  };

  // 탭별 설정
  const getTabConfig = () => {
    switch (selectedTab) {
      case '재난문자':
        return {
          listTitle: '최근 재난문자 3건',
          buttonText: '+ 모든 재난문자 보기',
          items: [
            { icon: '🌊', title: '호우 경보', subtitle: '2시간 전 • 경남 김해시', color: '#f44336' },
            { icon: '⚡', title: '정전 안내', subtitle: '5시간 전 • 김해 장유', color: '#ff9800' },
            { icon: '🌪️', title: '강풍 주의보', subtitle: '1일 전 • 경남 전체', color: '#2196f3' }
          ]
        };
      case '뉴스':
        return {
          listTitle: '오늘의 재난 뉴스',
          buttonText: '+ 더 많은 뉴스 보기',
          items: [
            { icon: '📺', title: '태풍 경로 분석', subtitle: '30분 전 • KBS 뉴스', color: '#4caf50' },
            { icon: '📻', title: '지진 대비 요령', subtitle: '1시간 전 • MBC 라디오', color: '#673ab7' },
            { icon: '📱', title: '긴급재난문자 시스템 점검', subtitle: '2시간 전 • 연합뉴스', color: '#ff5722' }
          ]
        };
      case '재난행동요령':
        return {
          listTitle: '재난별 행동요령',
          buttonText: '+ 모든 행동요령 보기',
          items: [
            { icon: '🌊', title: '태풍 대비 요령', subtitle: '사전준비 • 행동요령', color: '#9c27b0' },
            { icon: '🔥', title: '화재 발생시 대피', subtitle: '초기대응 • 대피방법', color: '#795548' },
            { icon: '⚡', title: '지진 발생시 행동', subtitle: '실내 • 실외 대응', color: '#607d8b' }
          ]
        };
      case '대피소':
        return {
          listTitle: '김해시 주변 대피소 5곳',
          buttonText: currentViewport 
            ? '+ 지도 화면의 대피소 보기' 
            : '+ 전체 대피소 지도보기',
          items: [
            { icon: '🏫', title: '김해시 체육관', subtitle: '500m • 수용인원 2,000명', color: '#4caf50' },
            { icon: '🏢', title: '장유중학교', subtitle: '1.2km • 수용인원 800명', color: '#2196f3' },
            { icon: '🏛️', title: '김해문화센터', subtitle: '1.8km • 수용인원 1,500명', color: '#ff9800' },
            { icon: '🏫', title: '김해대학교 체육관', subtitle: '2.1km • 수용인원 1,200명', color: '#673ab7' },
            { icon: '🏢', title: '진영읍사무소', subtitle: '3.2km • 수용인원 300명', color: '#795548' }
          ]
        };
      default:
        return {
          listTitle: '기본 리스트',
          buttonText: '+ 더보기',
          items: []
        };
    }
  };

  const tabConfig = getTabConfig();

  return (
    <>
      <Animated.View style={[styles.bottomSheet, animatedStyle]}>
        {/* 개선된 드래그 핸들 - 터치 영역 명확화 */}
        <View 
          style={styles.handleContainer}
          {...panResponder.panHandlers}
        >
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.handleHint}>드래그하여 확장</Text>
        </View>

        {/* 컨텐츠 영역 - 터치 이벤트 분리 */}
        <ScrollView 
          style={styles.contentScrollView}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
        >
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <View style={styles.headerRow}>
                <Text style={styles.listTitle}>{tabConfig.listTitle}</Text>
                {selectedTab === '재난행동요령' && (
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity 
                      style={styles.aiChatButton} 
                      onPress={handleAiChatToggle}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.aiChatButtonText}>AI 도우미</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.addToListButton} 
              onPress={handleViewAll}
              activeOpacity={0.7}
            >
              <Text style={styles.addToListText}>{tabConfig.buttonText}</Text>
            </TouchableOpacity>
            
            {/* 아이템 리스트 */}
            {tabConfig.items.map((item, index) => (
              <TouchableOpacity
                key={index} 
                style={styles.listItem}
                activeOpacity={0.7}
                onPress={() => {
                  // 아이템별 상세 액션 추가 가능
                  console.log('Item pressed:', item.title);
                }}
              >
                <View style={[styles.listItemIcon, {backgroundColor: item.color}]}>
                  <Text style={styles.listItemIconText}>{item.icon}</Text>
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{item.title}</Text>
                  <Text style={styles.listItemCount}>{item.subtitle}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.listItemMenu} 
                  onPress={handleListItemMenu}
                  activeOpacity={0.7}
                >
                  <Text style={styles.listItemMenuText}>⋮</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* 재난문자 모달 */}
      <DisasterAlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />

      {/* 재난 뉴스 모달 */}
      <DisasterNewsModal
        visible={showNewsModal}
        onClose={() => setShowNewsModal(false)}
      />

      {/* 대피소 모달 - mapRef와 currentViewport 전달 */}
      <ShelterModal
        visible={showShelterModal}
        onClose={() => setShowShelterModal(false)}
        currentLocation={currentLocation}
        mapRef={mapRef}
      />

      {/* AI 챗봇 모달 */}
      <Modal
        visible={showAiChat}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowAiChat(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.fullScreenChatModal,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }]
              }
            ]}
          >
            <View style={styles.fullScreenChatHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleAiChatToggle}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chatHeaderContent}>
              <Text style={styles.chatTitle}>🤖 재난 행동요령 AI 도우미</Text>
              <Text style={styles.chatSubtitle}>재난 상황별 대응 방법을 알려드려요</Text>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              style={styles.fullScreenChatMessages}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chatMessagesContent}
            >
              {chatMessages.map((message) => (
                <View key={message.id} style={[
                  styles.messageContainer,
                  message.isBot ? styles.botMessage : styles.userMessage
                ]}>
                  {message.isBot && (
                    <View style={styles.botAvatar}>
                      <Text style={styles.botAvatarText}>🤖</Text>
                    </View>
                  )}
                  <View style={[
                    styles.messageBubble,
                    message.isBot ? styles.botBubble : styles.userBubble
                  ]}>
                    <Text style={[
                      styles.messageText,
                      message.isBot ? styles.botText : styles.userText
                    ]}>
                      {message.text}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      message.isBot ? styles.botTime : styles.userTime
                    ]}>
                      {message.timestamp}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.fullScreenChatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="재난 상황을 입력하세요 (예: 지진, 화재, 태풍)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={200}
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={inputText.trim() === ''}
                activeOpacity={0.7}
              >
                <Text style={styles.sendButtonText}>전송</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  handleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 4,
  },
  handleHint: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  contentScrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listHeader: {
    marginBottom: 12,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  aiChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  aiChatButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  addToListButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addToListText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemIconText: {
    fontSize: 16,
    color: '#ffffff',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  listItemCount: {
    fontSize: 12,
    color: '#666',
  },
  listItemMenu: {
    padding: 8,
  },
  listItemMenuText: {
    fontSize: 16,
    color: '#666',
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  fullScreenChatModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flex: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  fullScreenChatHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chatHeaderContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fullScreenChatMessages: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatMessagesContent: {
    paddingVertical: 16,
  },
  fullScreenChatInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    alignItems: 'flex-end',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },

  // 메시지 스타일
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  botAvatarText: {
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#4285f4',
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: '#333',
  },
  userText: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  botTime: {
    color: '#999',
  },
  userTime: {
    color: '#ffffff',
    opacity: 0.8,
  },

  // 입력 스타일
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 80,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BottomSheet;