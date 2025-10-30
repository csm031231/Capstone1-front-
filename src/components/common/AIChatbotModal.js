// src/components/common/AIChatbotModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  // SafeAreaView, // ❌ 제거
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar, // ✅ StatusBar 임포트
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import chatbotService from '../../services/chatbotService';

// 임시 챗봇 응답 데이터 구조 (실제 서비스 파일에서 가져와야 함)
const mockChatResponse = {
  response: "안녕하세요! 저는 재난 안전 AI 도우미입니다. 지진, 태풍, 화재 등의 상황에서 어떻게 행동해야 하는지 궁금한 점을 저에게 물어보세요.",
  sources: [],
  category: 'welcome',
  is_emergency: false,
  timestamp: new Date().toISOString()
};

const AIChatbotModal = ({ visible, onClose, initialMessage = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = React.useRef();

  useEffect(() => {
    if (visible) {
      setMessages([
        { id: 0, text: mockChatResponse.response, sender: 'bot', timestamp: mockChatResponse.timestamp }
      ]);
      setInputText(initialMessage);
    } else {
      setMessages([]);
      setInputText('');
    }
  }, [visible, initialMessage]);

  const handleSend = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    const newMessage = {
      id: messages.length + 1,
      text: textToSend,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsSending(true);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const botResponse = await chatbotService.askSmartChatbot(textToSend);
      
      const botMessage = {
        id: messages.length + 2,
        text: botResponse.response,
        sender: 'bot',
        timestamp: botResponse.timestamp || new Date().toISOString(),
        is_emergency: botResponse.is_emergency || false
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("챗봇 응답 오류:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "죄송합니다. 챗봇 연결에 실패했습니다. (네트워크 오류)",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        is_emergency: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  const renderMessage = (message) => (
    <View 
      key={message.id} 
      style={[
        styles.messageBubble,
        message.sender === 'user' ? styles.userBubble : styles.botBubble,
        message.is_emergency && styles.emergencyBubble
      ]}
    >
      <Text style={[
        styles.messageText,
        message.sender === 'user' ? styles.userText : styles.botText
      ]}>
        {message.text}
      </Text>
      <Text style={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {/* Android Status Bar 설정 */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      <KeyboardAvoidingView
        style={styles.fullScreenContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* SafeAreaView 대신 일반 View를 사용하고, Platform별 패딩을 Header에 적용 */}
        <View style={styles.content}> 
          
          {/* 헤더 */}
          <View style={[
            styles.header, 
            Platform.OS === 'ios' && styles.iosHeaderPadding, // iOS는 상단에 Safe Area 패딩을 줘야 함
            Platform.OS === 'android' && styles.androidHeaderPadding // Android는 상태 표시줄 아래로 헤더를 이동
          ]}>
            <Text style={styles.headerTitle}>AI 재난 도우미</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {/* 메시지 영역 */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(renderMessage)}
            {isSending && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.typingText}>AI가 답변을 생성 중입니다...</Text>
              </View>
            )}
          </ScrollView>
          
          {/* 입력 영역 */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="재난 안전 관련 질문을 입력하세요"
              placeholderTextColor={COLORS.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              editable={!isSending}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
            >
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  // ✅ iOS 상단 노치/Safe Area 처리 (일반적으로 40~50pt 정도 필요)
  iosHeaderPadding: {
    paddingTop: 45, 
  },
  // ✅ Android 상단 노치/상태 표시줄 영역을 덮도록 설정 (Modal이 View를 꽉 채우므로)
  androidHeaderPadding: {
    paddingTop: 24, 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatContent: {
    paddingVertical: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 5,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emergencyBubble: {
    backgroundColor: '#fdd',
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: COLORS.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 5,
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    borderBottomLeftRadius: 5,
    maxWidth: '60%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingBottom: Platform.OS === 'ios' ? 0 : 10, 
  },
  input: {
    flex: 1,
    minHeight: 40,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    marginRight: 10,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.divider,
  },
});

export default AIChatbotModal;