// src/components/Map/MapContainer.js
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://192.168.0.16:8000';
const KIMHAE_DEFAULT = { latitude: 35.233596, longitude: 128.889544 };

const MapContainer = forwardRef(({ currentLocation, onViewportChange, theme = 'white' }, ref) => {
  const webViewRef = useRef(null);
  const [location, setLocation] = useState(currentLocation || KIMHAE_DEFAULT);
  const [mapReady, setMapReady] = useState(false);
  const [showShelters, setShowShelters] = useState(true);
  const viewportRequestCallbacks = useRef(new Map());

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
      setLocation(newLocation);
      if (mapReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          latitude: newLocation.latitude,
          longitude: newLocation.longitude
        }));
      }
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
      setLocation(currentLocation);
      
      if (mapReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }));
        
        webViewRef.current.postMessage(JSON.stringify({
          type: 'moveToLocation',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }));
      }
    }
  }, [currentLocation, mapReady]);

  const getNaverMapClientId = () => {
    return process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ||
           Constants.expoConfig?.extra?.naverMapClientId ||
           Constants.manifest?.extra?.naverMapClientId ||
           'INVALID_CLIENT_ID';
  };

  const handleZoomIn = () => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'zoomIn' }));
    }
  };

  const handleZoomOut = () => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'zoomOut' }));
    }
  };

  // MapContainer.js의 mapHTML 부분 중 스타일 섹션만 수정
// 기존 파일에서 <style> 태그 내부의 .custom-map-type-control 관련 스타일을 아래 내용으로 교체하세요

const mapHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>네이버 지도</title>
    <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${getNaverMapClientId()}"></script>
    <style>
        body, html { 
            margin: 0; 
            padding: 0; 
            width: 100%; 
            height: 100%; 
            overflow: hidden;
            background-color: #f0f0f0;
        }
        #map { 
            width: 100%; 
            height: 100vh; 
        }
        
        /* 기본 지도 타입 컨트롤 숨기기 */
        .map_type_control {
            display: none !important;
        }
        
        /* 🔥 커스텀 지도 타입 컨트롤 - 세로 배치 */
        .custom-map-type-control {
            position: absolute;
            top: 80px;  /* 검색바 아래에 위치 */
            right: 13px;  /* 오른쪽에 배치 */
            display: flex;
            flex-direction: column;  /* 세로 배치 */
            gap: 2px;  /* 버튼 간격 */
            z-index: 1000;
        }
        
        .map-type-button {
            width: 60px;  /* 버튼 너비 */
            padding: 8px 10px;
            border: none;
            background: white;
            color: #666;
            font-Size: 9px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 10px;  /* 개별 버튼 모서리 둥글게 */
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);  /* 그림자 추가 */
            text-align: center;
        }
        
        .map-type-button.active {
            background: #4285f4;
            color: white;
            box-shadow: 0 3px 12px rgba(66, 133, 244, 0.4);  /* 선택된 버튼 강조 */
        }
        
        .map-type-button:hover:not(.active) {
            background: #f5f5f5;
            transform: scale(1.05);
        }
        
        .shelter-info-window {
            padding: 12px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            min-width: 200px;
            max-width: 300px;
        }
        .shelter-name {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 6px;
        }
        .shelter-type {
            font-size: 12px;
            color: #666;
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 8px;
        }
        .shelter-address {
            font-size: 14px;
            color: #555;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <script>
        let map;
        let currentMarker;
        let shelterMarkers = [];
        let shelterInfoWindows = [];
        let mapInitialized = false;
        let showShelters = ${showShelters};
        let currentTheme = '${theme}';

        const KIMHAE_CENTER = { lat: ${location.latitude}, lng: ${location.longitude} };

        function sendMapReady() {
            if (window.ReactNativeWebView && !mapInitialized) {
                mapInitialized = true;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'map_ready'
                }));
            }
        }

        function sendViewportBounds() {
            if (!map || !window.ReactNativeWebView) return;
            try {
                const bounds = map.getBounds();
                const ne = bounds.getNE();
                const sw = bounds.getSW();

                const viewportBounds = {
                    startLat: sw.lat().toFixed(6),
                    endLat: ne.lat().toFixed(6),
                    startLot: sw.lng().toFixed(6),
                    endLot: ne.lng().toFixed(6)
                };

                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'viewport_changed',
                    bounds: viewportBounds
                }));
            } catch (error) {
                console.error('뷰포트 전송 오류:', error);
            }
        }

        function clearShelterMarkers() {
            shelterMarkers.forEach(marker => marker.setMap(null));
            shelterInfoWindows.forEach(infoWindow => infoWindow.close());
            shelterMarkers = [];
            shelterInfoWindows = [];
        }

        function getShelterIcon(type, typeCode) {
            let color = '#ff6b6b';
            let symbol = '🏠';

            if (type.includes('학교') || type.includes('교육') || typeCode === 'SCHOOL') {
                color = '#4ecdc4';
                symbol = '🏫';
            } else if (type.includes('체육') || type.includes('운동') || typeCode === 'SPORTS') {
                color = '#45b7d1';
                symbol = '🏟️';
            } else if (type.includes('문화') || type.includes('공연') || typeCode === 'CULTURE') {
                color = '#f7b731';
                symbol = '🎭';
            } else if (type.includes('종교') || typeCode === 'RELIGION') {
                color = '#5f27cd';
                symbol = '⛪';
            } else if (type.includes('공공') || typeCode === 'PUBLIC') {
                color = '#00d2d3';
                symbol = '🏢';
            }

            return {
                content: \`<div style="
                    width: 32px; 
                    height: 32px; 
                    background: \${color}; 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-size: 16px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    cursor: pointer;
                ">\${symbol}</div>\`,
                anchor: new naver.maps.Point(16, 16)
            };
        }

        function createShelterInfoWindow(shelter) {
            return new naver.maps.InfoWindow({
                content: \`<div class="shelter-info-window">
                    <div class="shelter-name">\${shelter.name}</div>
                    <div class="shelter-type">\${shelter.type}</div>
                    <div class="shelter-address">\${shelter.address}</div>
                </div>\`,
                borderWidth: 0,
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                anchorSize: new naver.maps.Size(0, 0)
            });
        }

        function updateShelters(shelters) {
            if (!map || !Array.isArray(shelters)) return;
            clearShelterMarkers();
            if (!showShelters) return;

            shelters.forEach((shelter) => {
                try {
                    const position = new naver.maps.LatLng(shelter.lat, shelter.lng);
                    const icon = getShelterIcon(shelter.type, shelter.typeCode);
                    
                    const marker = new naver.maps.Marker({
                        position: position,
                        map: map,
                        icon: icon,
                        zIndex: 100,
                        title: shelter.name
                    });

                    const infoWindow = createShelterInfoWindow(shelter);

                    naver.maps.Event.addListener(marker, 'click', function() {
                        shelterInfoWindows.forEach(iw => iw.close());
                        
                        if (infoWindow.getMap()) {
                            infoWindow.close();
                        } else {
                            infoWindow.open(map, marker);
                        }
                    });

                    shelterMarkers.push(marker);
                    shelterInfoWindows.push(infoWindow);
                } catch (error) {
                    console.error('마커 생성 실패:', error);
                }
            });
        }

        function toggleShelters(show) {
            showShelters = show;
            if (!show) {
                clearShelterMarkers();
            } else {
                sendViewportBounds();
            }
        }
        
        function applyTheme(theme) {
            const buttons = document.querySelectorAll('.map-type-button');
            
            if (theme === 'black') {
                buttons.forEach(button => {
                    if (!button.classList.contains('active')) {
                        button.style.background = '#2a2a2a';
                        button.style.color = '#ffffff';
                    }
                });
            } else {
                buttons.forEach(button => {
                    if (!button.classList.contains('active')) {
                        button.style.background = 'white';
                        button.style.color = '#666';
                    }
                });
            }
        }

        function createCustomMapTypeControl() {
            const controlDiv = document.createElement('div');
            controlDiv.className = 'custom-map-type-control';
            
            const normalButton = document.createElement('button');
            normalButton.className = 'map-type-button active';
            normalButton.textContent = '일반지도';
            normalButton.onclick = () => {
                map.setMapTypeId(naver.maps.MapTypeId.NORMAL);
                normalButton.classList.add('active');
                satelliteButton.classList.remove('active');
                hybridButton.classList.remove('active');
                applyTheme(currentTheme);
            };
            
            const satelliteButton = document.createElement('button');
            satelliteButton.className = 'map-type-button';
            satelliteButton.textContent = '위성지도';
            satelliteButton.onclick = () => {
                map.setMapTypeId(naver.maps.MapTypeId.SATELLITE);
                normalButton.classList.remove('active');
                satelliteButton.classList.add('active');
                hybridButton.classList.remove('active');
                applyTheme(currentTheme);
            };
            
            const hybridButton = document.createElement('button');
            hybridButton.className = 'map-type-button';
            hybridButton.textContent = '겹쳐보기';
            hybridButton.onclick = () => {
                map.setMapTypeId(naver.maps.MapTypeId.HYBRID);
                normalButton.classList.remove('active');
                satelliteButton.classList.remove('active');
                hybridButton.classList.add('active');
                applyTheme(currentTheme);
            };
            
            controlDiv.appendChild(normalButton);
            controlDiv.appendChild(satelliteButton);
            controlDiv.appendChild(hybridButton);
            
            document.getElementById('map').appendChild(controlDiv);
        }

        function createMap() {
            try {
                const kimhaeLocation = new naver.maps.LatLng(KIMHAE_CENTER.lat, KIMHAE_CENTER.lng);
                
                map = new naver.maps.Map('map', {
                    center: kimhaeLocation,
                    zoom: 14,
                    mapTypeControl: false,
                    zoomControl: false,
                    logoControl: false,
                    mapDataControl: false,
                    scaleControl: true,
                    minZoom: 6,
                    maxZoom: 18
                });

                createCustomMapTypeControl();
                
                setTimeout(() => {
                    applyTheme(currentTheme);
                }, 500);

                currentMarker = new naver.maps.Marker({
                    position: kimhaeLocation,
                    map: map,
                    icon: {
                        content: '<div style="width:16px;height:16px;background:#007AFF;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
                        anchor: new naver.maps.Point(11, 11)
                    },
                    zIndex: 200,
                    title: '현재 위치'
                });

                naver.maps.Event.addListener(map, 'idle', sendViewportBounds);
                naver.maps.Event.addListener(map, 'zoom_changed', () => setTimeout(sendViewportBounds, 100));

                setTimeout(() => {
                    sendViewportBounds();
                    sendMapReady();
                }, 1000);

            } catch (error) {
                console.error('지도 생성 오류:', error);
            }
        }

        function updateLocationMarker(lat, lng) {
            if (!map) return;
            try {
                if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
                    const position = new naver.maps.LatLng(lat, lng);
                    if (currentMarker) {
                        currentMarker.setPosition(position);
                    }
                }
            } catch (error) {
                console.error('위치 업데이트 오류:', error);
            }
        }

        function moveToLocation(lat, lng) {
            if (!map) return;
            try {
                if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
                    const position = new naver.maps.LatLng(lat, lng);
                    map.setCenter(position);
                }
            } catch (error) {
                console.error('지도 이동 오류:', error);
            }
        }

        function zoomIn() {
            if (!map) return;
            try {
                const currentZoom = map.getZoom();
                const newZoom = Math.min(currentZoom + 1, 21);
                map.setZoom(newZoom);
            } catch (error) {
                console.error('줌 인 오류:', error);
            }
        }

        function zoomOut() {
            if (!map) return;
            try {
                const currentZoom = map.getZoom();
                const newZoom = Math.max(currentZoom - 1, 6);
                map.setZoom(newZoom);
            } catch (error) {
                console.error('줌 아웃 오류:', error);
            }
        }

        function handleMessage(data) {
            try {
                const message = JSON.parse(data);
                
                switch(message.type) {
                    case 'updateLocation':
                        updateLocationMarker(message.latitude, message.longitude);
                        break;
                    case 'moveToLocation':
                        moveToLocation(message.latitude, message.longitude);
                        break;
                    case 'zoomIn':
                        zoomIn();
                        break;
                    case 'zoomOut':
                        zoomOut();
                        break;
                    case 'updateShelters':
                        updateShelters(message.shelters);
                        break;
                    case 'toggleShelters':
                        toggleShelters(message.show);
                        break;
                    case 'changeTheme':
                        currentTheme = message.theme;
                        applyTheme(message.theme);
                        break;
                }
            } catch (error) {
                console.error('메시지 처리 오류:', error);
            }
        }

        function setupMessageListeners() {
            document.addEventListener('message', (event) => handleMessage(event.data));
            window.addEventListener('message', (event) => handleMessage(event.data));
            
            setTimeout(() => {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'webview_ready'
                    }));
                }
            }, 500);
        }

        if (window.ReactNativeWebView) {
            setupMessageListeners();
        }

        function initMap() {
            if (typeof naver === 'undefined' || !naver.maps) {
                let retryCount = 0;
                const checkInterval = setInterval(function() {
                    retryCount++;
                    if (naver && naver.maps) {
                        clearInterval(checkInterval);
                        createMap();
                    } else if (retryCount >= 15) {
                        clearInterval(checkInterval);
                        console.error('지도 라이브러리 로딩 실패');
                    }
                }, 300);
                return;
            }
            createMap();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(initMap, 100));
        } else {
            setTimeout(initMap, 100);
        }

    </script>
</body>
</html>
`;

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
      }
    } catch (error) {
      console.error('💥 메시지 파싱 오류:', error);
    }
  };

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
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
        allowsBackForwardNavigationGestures={false}
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