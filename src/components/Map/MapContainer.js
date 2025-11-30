// ============================================
// 📍 src/components/Map/MapContainer.js (SIDO VERSION)
// ============================================
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity} from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { getMapHTML } from './mapTemplate';
import sidoData from './sido.json'; // sido.json 파일 import
import { getDirections } from '../../services/ApiService';

const KIMHAE_DEFAULT = { latitude: 35.233596, longitude: 128.889544 };

const MapContainer = forwardRef(({ currentLocation, onViewportChange, theme = 'white', onMapPress, shelters = [], disasters = null }, ref) => {
  const webViewRef = useRef(null);
  const [location, setLocation] = useState(currentLocation || KIMHAE_DEFAULT);
  const [mapReady, setMapReady] = useState(false);
  const [setShowShelters] = useState(true);
  const viewportRequestCallbacks = useRef(new Map());
  const userInitiatedMove = useRef(false);
  const [isMarkerSelected, setIsMarkerSelected] = useState(false);
  const [currentMapCenter, setCurrentMapCenter] = useState(currentLocation || KIMHAE_DEFAULT);

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
      /*
      setTimeout(() => {
        userInitiatedMove.current = false;
        console.log('🔄 userInitiatedMove 플래그 리셋');
      }, 10000);*/
      
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
    },

    //  경로 그리기 함수 추가
    drawRoute: (routeData) => {
      console.log('🛣️ drawRoute 호출:', routeData);
      if (mapReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'drawRoute',
          routeData: routeData
        }));
      }
    },

    //  경로 지우기 함수 추가
    clearRoute: () => {
      console.log('🗑️ clearRoute 호출');
      if (mapReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'clearRoute'
        }));
      }
    }
  }));

  useEffect(() => {
    if (mapReady && webViewRef.current && disasters) {
      console.log('🚨 재난 데이터 지도 전송:', disasters.total_count, '건');
      
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateDisasterMap',
        payload: disasters // 백엔드에서 받은 전체 데이터 (regions, total_count 등)
      }));
    }
  }, [disasters, mapReady]);
  
  useEffect(() => {
    if (currentLocation) {
      if (userInitiatedMove.current) {
        console.log('⏸️ 사용자 이동 중 - currentLocation 업데이트 무시');
        return;
      }
      
      setLocation(currentLocation);
      
      if (mapReady && webViewRef.current && !isMarkerSelected) { 
        console.log('📍 현재 위치 마커만 업데이트:', currentLocation);
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }));
      }
    }
  }, [currentLocation, mapReady, isMarkerSelected]);

 // ✅ shelters가 변경될 때마다 지도에 전송 (항상)
 useEffect(() => {
  if (mapReady && webViewRef.current && shelters !== undefined) {
    
    // 🚨 이 로그를 추가하세요!
    console.log('--- 🗺️ MapContainer가 WebView로 실제 전송하는 데이터 ---');
    console.log(JSON.stringify(shelters, null, 2));
    // 🚨 여기까지
    
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

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        
        case 'user_interaction_start':
          console.log('WebView 상호작용 감지: GPS 지도 이동 방지 시작');
          setIsMarkerSelected(true); // ⬅️ 마커 선택 상태로 변경
          break;

        case 'map_manual_move':
          console.log('수동 지도 조작 감지: GPS 지도 이동 방지 해제');
          setIsMarkerSelected(false); // ⬅️ 마커 선택 해제
          break;
          
        // 🚨 [수정됨]
        // 중복된 'request_route' 케이스를 삭제하고,
        // 올바른 케이스(currentMapCenter 사용)만 남겼습니다.
        case 'request_route':
          console.log('📬 WebView로부터 경로 요청 받음:', data);
          
          // 1. ✅ 시작 위치 결정 로직
          // 1순위: 실시간 GPS (currentLocation)
          // 2순위: 현재 지도 중심 (currentMapCenter)
          const startLocation = currentLocation || currentMapCenter; 
          
          if (!startLocation || !startLocation.latitude || !startLocation.longitude) {
            console.error('❌ 시작 위치(GPS 또는 지도 중심)를 알 수 없어 경로를 요청할 수 없습니다.');
            return; 
          }
          
          console.log('✅ 경로 탐색 시작점:', currentLocation ? '실시간 GPS' : '현재 지도 중심', {
            lat: startLocation.latitude,
            lng: startLocation.longitude
          });
          
          try {
            // 2. ApiService.js의 getDirections 호출
            console.log('🚀 길찾기 API 호출 시작...');
            const routeData = await getDirections(
              startLocation.longitude, // ✅ [수정됨]
              startLocation.latitude,  // ✅ [수정됨]
              data.goalLng,
              data.goalLat
            );
            
            console.log('✅ 길찾기 성공, WebView의 drawRoute 호출');
            
            // 3. imperative handle을 통해 WebView의 drawRoute 함수 호출
            if (ref && ref.current) {
              ref.current.drawRoute(routeData); 
            }
            
          } catch (error) {
            console.error('❌ 길찾기 API 호출 또는 경로 그리기 실패:', error);
          }
          break; // ⬅️ 'request_route' 종료
            
        case 'webview_log':
          const logHeader = `[WebView/${data.level || 'log'}]`;
          if (data.level === 'warn') {
            console.warn(logHeader, data.data);
          } else if (data.level === 'error') {
            console.error(logHeader, data.data);
          } else {
            console.log(logHeader, data.data);
          }
          break;

        case 'webview_ready':
          console.log('✅ WebView 준비 완료');
          break;
          
        case 'map_ready':
          console.log('🗺️ 지도 준비 완료');
          setMapReady(true);
          break;
          
        // 🚨 이 'viewport_changed'가 'request_route'에서
        // 사용할 'currentMapCenter'를 올바르게 설정합니다.
        case 'viewport_changed':
          if (onViewportChange) {
            const centerLat = (parseFloat(data.bounds.startLat) + parseFloat(data.bounds.endLat)) / 2;
            const centerLng = (parseFloat(data.bounds.startLot) + parseFloat(data.bounds.endLot)) / 2;

            // ✅ 지도 중심 state 업데이트
            setCurrentMapCenter({ latitude: centerLat, longitude: centerLng });

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
  const mapHTML = useMemo(() => {
    return getMapHTML(getNaverMapClientId(), location, true, theme, sidoData);
  }, []);

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