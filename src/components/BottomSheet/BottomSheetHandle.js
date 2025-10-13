// ============================================
// 📁 src/components/BottomSheet/BottomSheetHandle.js
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BottomSheetHandle = ({ panHandlers }) => {
  return (
    <View style={styles.handleContainer} {...panHandlers}>
      <View style={styles.handleRow}>
        <View style={styles.bottomSheetHandle} />
      </View>
      <Text style={styles.handleHint}>드래그하여 확장/축소</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  handleContainer: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  handleHint: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});

export default BottomSheetHandle;