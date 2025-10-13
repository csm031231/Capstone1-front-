// ============================================
// 📁 src/components/Header/SettingsModal.js
// ============================================
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import COLORS from '../../constants/colors';

const SettingsModal = ({ visible, onClose, currentTheme, onThemeChange }) => {
  const isDarkTheme = currentTheme === 'black';
  
  const modalBg = isDarkTheme ? COLORS.surfaceDark : COLORS.surface;
  const titleColor = isDarkTheme ? COLORS.textWhite : COLORS.textPrimary;
  const optionColor = isDarkTheme ? COLORS.textLight : COLORS.textSecondary;
  const borderColor = isDarkTheme ? COLORS.divider : COLORS.border;
  const activeOptionBg = isDarkTheme ? 'rgba(155, 122, 201, 0.2)' : COLORS.overlayLight;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: modalBg }]}>
          <Text style={[styles.title, { color: titleColor }]}>앱 설정</Text>

          <View style={[styles.settingsItem, { borderBottomColor: borderColor }]}>
            <Text style={[styles.itemTitle, { color: optionColor }]}>화면 테마</Text>
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: currentTheme === 'white' ? activeOptionBg : 'transparent',
                    borderColor: currentTheme === 'white' ? COLORS.primary : borderColor,
                  },
                ]}
                onPress={() => onThemeChange('white')}
              >
                <Text
                  style={[
                    styles.themeText,
                    { color: currentTheme === 'white' ? COLORS.primary : optionColor }
                  ]}
                >
                  화이트
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: currentTheme === 'black' ? activeOptionBg : 'transparent',
                    borderColor: currentTheme === 'black' ? COLORS.primary : borderColor,
                  },
                ]}
                onPress={() => onThemeChange('black')}
              >
                <Text
                  style={[
                    styles.themeText,
                    { color: currentTheme === 'black' ? COLORS.primary : optionColor }
                  ]}
                >
                  블랙
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: COLORS.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SettingsModal;