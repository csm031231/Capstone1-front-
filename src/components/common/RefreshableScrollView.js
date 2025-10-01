// src/components/common/RefreshableScrollView.js
import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';

export default function RefreshableScrollView({ 
  children, 
  onRefresh, 
  refreshing = false, 
  ...props 
}) {
  return (
    <ScrollView
      {...props}
      refreshControl={
        onRefresh ? (
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4285f4']}
            tintColor="#4285f4"
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}