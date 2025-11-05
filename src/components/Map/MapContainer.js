// ============================================
// 📍 src/components/Map/MapContainer.js (SIDO VERSION)
// ============================================
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { getMapHTML } from './mapTemplate';
import sidoData from './sido.json'; // sido.json 파일 import

const KIMHAE_DEFAULT = { latitude: 35.233596, longitude: 128.889544 };

const MapContainer = forwardRef(({ currentLocation, onViewportChange, theme = 'white', onMapPress, shelters = [] }, ref) => {
  const webViewRef = useRef(null);
  const [location, setLocation] = useState(currentLocation || KIMHAE_DEFAULT);
  const [mapReady, setMapReady] = useState(false);
  const [showShelters, setShowShelters] = useState(true);
  const viewportRequestCallbacks = useRef(new Map());
  const userInitiatedMove = useRef(false);

  useImperativeHandle(ref, () => ({
    getViewportBounds: () => {
      return new Promise((resolve, reject) => {
        if (!mapReady || !webViewRef.current) {
          reject(new Error('지도가 준비되지 않았습니다'));
          return;
        }

        const messageId = Date.now().toString();
        const timeout = setTimeout(() => {
          viewportRequestCallbacks.current.delete(messageId);
          reject(new Error('지도 범위 가져오기 시간 초과'));
        }, 3000);

        viewportRequestCallbacks.current.set(messageId, (bounds) => {
          clearTimeout(timeout);
          resolve(bounds);
        });

        webViewRef.current.postMessage(JSON.stringify({
          type: 'get_viewport_bounds',
          messageId: messageId
        }));
      });
    },
    getCurrentLocation: () => location,
    isMapReady: () => mapReady,
    
    updateLocation: (newLocation) => {
      console.log('📍 updateLocation 호출:', newLocation);
      setLocation(newLocation);
      if (mapReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          zoom: newLocation.zoom
        }));
      }
    },
    
    moveAndZoom: (latitude, longitude, zoom) => {
      console.log('🗺️ moveAndZoom 호출:', { latitude, longitude, zoom });
      
      if (!mapReady) {
        console.warn('⚠️ 지도가 아직 준비되지 않았습니다');
        return;
      }
      
      if (!webViewRef.current) {
        console.error('❌ webViewRef가 없습니다');
        return;
      }

      userInitiatedMove.current = true;

      webViewRef.current.postMessage(JSON.stringify({
        type: 'moveAndZoom',
        latitude: latitude,
        longitude: longitude,
        zoom: zoom
      }));
      
      console.log('✅ moveAndZoom 메시지 전송 완료');
      
      setTimeout(() => {
        userInitiatedMove.current = false;
        console.log('🔄 userInitiatedMove 플래그 리셋');
      }, 10000);
    },
    
    toggleShelters: () => {
      setShowShelters(prev => {
        const newState = !prev;
        if (mapReady && webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'toggleShelters',
            show: newState
          }));
        }
        return newState;
      });
    },
    
    applyTheme: (newTheme) => {
      if (mapReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'changeTheme',
          theme: newTheme
        }));
      }
    }
  }));

  useEffect(() => {
    if (currentLocation) {
      if (userInitiatedMove.current) {
        console.log('⏸️ 사용자 이동 중 - currentLocation 업데이트 무시');
        return;
      }
      
      setLocation(currentLocation);
      
      if (mapReady && webViewRef.current) {
        console.log('📍 현재 위치 마커만 업데이트:', currentLocation);
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }));
      }
    }
  }, [currentLocation, mapReady]);

  useEffect(() => {
    if (mapReady && webViewRef.current && shelters && shelters.length > 0) {
      console.log('🏠 대피소 데이터를 지도에 전송:', shelters.length, '개');
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateShelters',
        shelters: shelters
      }));
    }
  }, [shelters, mapReady]);

  const getNaverMapClientId = () => {
    return process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ||
           Constants.expoConfig?.extra?.naverMapClientId ||
           Constants.manifest?.extra?.naverMapClientId ||
           'INVALID_CLIENT_ID';
  };

  const handleZoomIn = () => {
    if (webViewRef.current && mapReady) {
      console.log('🔍 줌 인 버튼 클릭');
      webViewRef.current.postMessage(JSON.stringify({ type: 'zoomIn' }));
    }
  };

  const handleZoomOut = () => {
    if (webViewRef.current && mapReady) {
      console.log('🔍 줌 아웃 버튼 클릭');
      webViewRef.current.postMessage(JSON.stringify({ type: 'zoomOut' }));
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'webview_ready':
          console.log('✅ WebView 준비 완료');
          break;
          
        case 'map_ready':
          console.log('🗺️ 지도 준비 완료');
          setMapReady(true);
          break;
          
        case 'viewport_changed':
          if (onViewportChange) {
            const centerLat = (parseFloat(data.bounds.startLat) + parseFloat(data.bounds.endLat)) / 2;
            const centerLng = (parseFloat(data.bounds.startLot) + parseFloat(data.bounds.endLot)) / 2;
            
            let region = '전국';
            if (centerLat >= 35.15 && centerLat <= 35.35 && centerLng >= 128.7 && centerLng <= 129.0) {
              region = '김해';
            } else if (centerLat >= 35.0 && centerLat <= 35.4 && centerLng >= 128.8 && centerLng <= 129.3) {
              region = '부산';
            } else if (centerLat >= 34.7 && centerLat <= 35.9 && centerLng >= 127.5 && centerLng <= 129.5) {
              region = '경남';
            }
            
            onViewportChange({
              ...data.bounds,
              region: region
            });
          }
          break;
          
        case 'shelter_clicked':
          console.log('🏠 대피소 클릭:', data.shelter);
          break;
          
        case 'zoom_changed':
          console.log('🔍 줌 레벨 변경:', data.zoom);
          break;
      }
    } catch (error) {
      console.error('💥 메시지 파싱 오류:', error);
    }
  };

  // sido 데이터를 포함하여 HTML 생성
  const mapHTML = getMapHTML(getNaverMapClientId(), location, showShelters, theme, sidoData);

  return (
     <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ 
          html: mapHTML,
          baseUrl: 'https://localhost:8081'
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        
        onStartShouldSetResponder={(evt) => {
          if (onMapPress) {
            return false;
          }
          return false;
        }}
        onTouchStart={() => {
          if (onMapPress) {
            onMapPress();
          }
        }}
      
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
        allowsBackForwardNavigationGestures={false}
        
        scrollEnabled={true}
        scalesPageToFit={true}
        bounces={false}
      />

      <View style={styles.zoomControls}>
        <TouchableOpacity 
          style={[styles.zoomButton, !mapReady && styles.zoomButtonDisabled]} 
          onPress={handleZoomIn}
          disabled={!mapReady}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="add-outline" 
            size={24} 
            color={mapReady ? "#007AFF" : "#ccc"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.zoomButton, !mapReady && styles.zoomButtonDisabled]} 
          onPress={handleZoomOut}
          disabled={!mapReady}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="remove-outline" 
            size={24} 
            color={mapReady ? "#007AFF" : "#ccc"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    zIndex: 10,
  },
  zoomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  zoomButtonDisabled: {
    backgroundColor: '#f0f0f0',
    elevation: 1,
  },
});

export default MapContainer;