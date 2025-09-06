import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

const MapContainer = forwardRef(({ currentLocation, onViewportChange }, ref) => {
  const webViewRef = useRef(null);
  const [location, setLocation] = useState(
    currentLocation || { latitude: 35.233596, longitude: 128.889544 }
  );
  const [mapReady, setMapReady] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentViewport, setCurrentViewport] = useState(null);
  const [showShelters, setShowShelters] = useState(true);
  const [shelterCount, setShelterCount] = useState(0); // 디버깅용 카운터
  const locationSubscription = useRef(null);
  const viewportRequestCallbacks = useRef(new Map());

  // API 서버 URL
  const API_BASE_URL = 'http://192.168.0.16:8000';

  // 외부에서 사용할 수 있는 메서드들 노출
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
    }
  }));

  // 대피소 데이터 가져오기
  const fetchShelters = async (bounds) => {
    try {
      console.log('🔍 대피소 검색 시작:', bounds);
      
      const queryParams = new URLSearchParams({
        startLot: bounds.startLot,
        endLot: bounds.endLot,
        startLat: bounds.startLat,
        endLat: bounds.endLat
      }).toString();

      const apiUrl = `${API_BASE_URL}/shelter_router/get_shelter?${queryParams}`;
      console.log('🚀 API 요청 URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 5000,
      });

      console.log('📡 API 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API 응답 데이터:', data);
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ API 응답이 배열이 아님, 목업 데이터 사용');
        throw new Error('API 응답 데이터가 배열이 아닙니다');
      }

      // 유효한 좌표를 가진 대피소만 필터링
      const validShelters = data
        .filter(shelter => {
          const lat = parseFloat(shelter.LAT || shelter.lat);
          const lng = parseFloat(shelter.LOT || shelter.lot);
          const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          if (!isValid) {
            console.log('❌ 유효하지 않은 좌표:', shelter);
          }
          return isValid;
        })
        .map(shelter => ({
          id: shelter.MNG_SN || shelter.mng_sn || Math.random().toString(),
          name: shelter.REARE_NM || shelter.name || '대피소',
          address: shelter.RONA_DADDR || shelter.address || '주소 정보 없음',
          lat: parseFloat(shelter.LAT || shelter.lat),
          lng: parseFloat(shelter.LOT || shelter.lot),
          type: shelter.SHLT_SE_NM || shelter.type || '대피소',
          typeCode: shelter.SHLT_SE_CD || shelter.type_code
        }));

      console.log(`✅ ${validShelters.length}개의 유효한 대피소 발견`);
      return validShelters;
    } catch (error) {
      console.error('❌ 대피소 데이터 가져오기 실패:', error);
      // 목업 데이터 반환
      const mockShelters = getMockShelters(bounds);
      console.log(`🎭 ${mockShelters.length}개의 목업 대피소 데이터 사용`);
      return mockShelters;
    }
  };

  // 목업 대피소 데이터
  const getMockShelters = (bounds) => {
    const mockShelters = [
      {
        id: 'mock-1',
        name: '김해시 체육관',
        address: '경상남도 김해시 분성로 100',
        lat: 35.233596,
        lng: 128.889544,
        type: '체육시설',
        typeCode: 'SPORTS'
      },
      {
        id: 'mock-2', 
        name: '장유중학교',
        address: '경상남도 김해시 장유면 장유로 200',
        lat: 35.190156,
        lng: 128.807892,
        type: '교육시설',
        typeCode: 'SCHOOL'
      },
      {
        id: 'mock-3',
        name: '김해문화의전당',
        address: '경상남도 김해시 가야의길 16',
        lat: 35.235489,
        lng: 128.888901,
        type: '문화시설',
        typeCode: 'CULTURE'
      },
      {
        id: 'mock-4',
        name: '김해공설운동장',
        address: '경상남도 김해시 삼계로 100',
        lat: 35.240000,
        lng: 128.880000,
        type: '체육시설',
        typeCode: 'SPORTS'
      },
      {
        id: 'mock-5',
        name: '진영도서관',
        address: '경상남도 김해시 진영읍 진영대로 100',
        lat: 35.320000,
        lng: 128.750000,
        type: '공공시설',
        typeCode: 'PUBLIC'
      }
    ];

    // bounds 내의 대피소만 반환 (좀 더 넓은 범위로)
    const startLat = parseFloat(bounds.startLat) - 0.01;
    const endLat = parseFloat(bounds.endLat) + 0.01;
    const startLng = parseFloat(bounds.startLot) - 0.01;
    const endLng = parseFloat(bounds.endLot) + 0.01;

    const filtered = mockShelters.filter(shelter => 
      shelter.lat >= startLat && shelter.lat <= endLat &&
      shelter.lng >= startLng && shelter.lng <= endLng
    );

    console.log(`🎯 필터링된 목업 대피소: ${filtered.length}개`);
    return filtered;
  };

  // viewport 변경 시 대피소 업데이트
  const updateSheltersInViewport = async (bounds) => {
    if (!showShelters || !mapReady || !webViewRef.current) {
      console.log('⏭️ 대피소 업데이트 스킵:', { showShelters, mapReady, hasWebView: !!webViewRef.current });
      return;
    }

    try {
      console.log('🔄 대피소 업데이트 시작');
      const shelters = await fetchShelters(bounds);
      setShelterCount(shelters.length);
      
      console.log(`📍 ${shelters.length}개 대피소를 지도에 전송`);
      
      // 지도에 메시지 전송
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateShelters',
        shelters: shelters,
        debug: true // 디버깅 플래그 추가
      }));
    } catch (error) {
      console.error('💥 대피소 업데이트 실패:', error);
    }
  };

  // 현재 위치가 업데이트되면 지도도 업데이트
  useEffect(() => {
    if (currentLocation) {
      setLocation(currentLocation);
      if (mapReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }));
      }
    }
  }, [currentLocation, mapReady]);

  // 컴포넌트 언마운트 시 위치 추적 정리
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const getNaverMapClientId = () => {
    if (process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID) {
      return process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
    }
    if (Constants.expoConfig?.extra?.naverMapClientId) {
      return Constants.expoConfig.extra.naverMapClientId;
    }
    if (Constants.manifest?.extra?.naverMapClientId) {
      return Constants.manifest.extra.naverMapClientId;
    }
    return null;
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림', '위치 권한이 필요합니다.');
        return;
      }

      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          const updatedLocation = { latitude, longitude };
          setLocation(updatedLocation);
          
          if (mapReady && webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'updateLocation',
              latitude,
              longitude
            }));
          }
        }
      );
      
      setIsTracking(true);
    } catch (error) {
      console.error('위치 추적 시작 오류:', error);
      Alert.alert('오류', '위치 추적을 시작할 수 없습니다.');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      setIsTracking(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림', '위치 권한이 필요합니다.');
        return;
      }

      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = newLocation.coords;
      const updatedLocation = { latitude, longitude };
      setLocation(updatedLocation);
      
      if (mapReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          latitude,
          longitude
        }));
      }
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
    }
  };

  const handleLocationPress = () => {
    if (isTracking) {
      stopLocationTracking();
    } else {
      startLocationTracking();
    }
  };

  const handleShelterToggle = () => {
    const newState = !showShelters;
    setShowShelters(newState);
    
    console.log('🏠 대피소 표시 토글:', newState);
    
    if (mapReady && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleShelters',
        show: newState
      }));
    }
  };

  const handleZoomIn = () => {
    console.log('🔍 줌 인 버튼 클릭', { hasWebView: !!webViewRef.current, mapReady });
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'zoomIn' }));
      console.log('📤 줌 인 메시지 전송');
    } else {
      console.warn('⚠️ 줌 인 실패: WebView 또는 지도가 준비되지 않음');
      Alert.alert('알림', '지도가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleZoomOut = () => {
    console.log('🔍 줌 아웃 버튼 클릭', { hasWebView: !!webViewRef.current, mapReady });
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'zoomOut' }));
      console.log('📤 줌 아웃 메시지 전송');
    } else {
      console.warn('⚠️ 줌 아웃 실패: WebView 또는 지도가 준비되지 않음');
      Alert.alert('알림', '지도가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>네이버 지도</title>
        <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${getNaverMapClientId() || 'INVALID_CLIENT_ID'}"></script>
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
            #fallback {
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #e8f4fd;
                font-family: Arial, sans-serif;
                text-align: center;
                flex-direction: column;
            }
            .fallback-content {
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                max-width: 300px;
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
            #debug-info {
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 1000;
                display: none;
            }
        </style>
    </head>
    <body>
        <div id="debug-info"></div>
        <div id="fallback">
            <div class="fallback-content">
                <h3>🗺️ 김해시 지도</h3>
                <p>위도: ${location.latitude.toFixed(6)}</p>
                <p>경도: ${location.longitude.toFixed(6)}</p>
                <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #4285f4, #34a853); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 20px auto;">
                    <span style="color: white; font-size: 48px;">🗺️</span>
                </div>
                <p style="color: #666; font-size: 14px;">지도를 불러오는 중...</p>
            </div>
        </div>
        <div id="map" style="display: none;"></div>
        
        <script>
            let map;
            let currentMarker;
            let shelterMarkers = [];
            let shelterInfoWindows = [];
            let mapInitialized = false;
            let lastViewportBounds = null;
            let showShelters = ${showShelters};
            let debugMode = true;

            function debugLog(message) {
                if (debugMode) {
                    console.log('🗺️ MAP DEBUG:', message);
                    const debugDiv = document.getElementById('debug-info');
                    if (debugDiv) {
                        debugDiv.style.display = 'block';
                        debugDiv.innerHTML += '<br>' + message;
                        // 최대 10줄만 표시
                        const lines = debugDiv.innerHTML.split('<br>');
                        if (lines.length > 10) {
                            debugDiv.innerHTML = lines.slice(-10).join('<br>');
                        }
                    }
                }
            }

            function sendMapReady() {
                if (window.ReactNativeWebView && !mapInitialized) {
                    mapInitialized = true;
                    debugLog('지도 준비 완료');
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'map_ready'
                    }));
                }
            }

            function sendViewportBounds(messageId = null) {
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

                    lastViewportBounds = JSON.stringify(viewportBounds);
                    debugLog(\`뷰포트 전송: \${viewportBounds.startLat},\${viewportBounds.startLot} ~ \${viewportBounds.endLat},\${viewportBounds.endLot}\`);

                    // RN에 bounds 전송
                    if (window.ReactNativeWebView) {
                        const message = {
                            type: messageId ? 'viewport_bounds_response' : 'viewport_changed',
                            bounds: viewportBounds
                        };
                        if (messageId) message.messageId = messageId;

                        window.ReactNativeWebView.postMessage(JSON.stringify(message));
                    }
                } catch (error) {
                    debugLog('뷰포트 전송 오류: ' + error.message);
                    if (messageId && window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'viewport_bounds_error',
                            messageId,
                            error: error.message
                        }));
                    }
                }
            }

            function clearShelterMarkers() {
                debugLog(\`기존 마커 \${shelterMarkers.length}개 제거\`);
                shelterMarkers.forEach(marker => {
                    marker.setMap(null);
                });
                shelterInfoWindows.forEach(infoWindow => {
                    infoWindow.close();
                });
                shelterMarkers = [];
                shelterInfoWindows = [];
            }

            function getShelterIcon(type, typeCode) {
                let color = '#ff6b6b'; // 기본 빨간색
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
                } else if (type.includes('종교') || type.includes('교회') || typeCode === 'RELIGION') {
                    color = '#5f27cd';
                    symbol = '⛪';
                } else if (type.includes('공공') || type.includes('청사') || typeCode === 'PUBLIC') {
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
                if (!map || !Array.isArray(shelters)) {
                    debugLog('지도가 없거나 잘못된 대피소 데이터');
                    return;
                }

                debugLog(\`\${shelters.length}개 대피소 마커 업데이트 시작\`);

                // 기존 마커들 제거
                clearShelterMarkers();

                if (!showShelters) {
                    debugLog('대피소 표시 비활성화됨');
                    return;
                }

                // 새 마커들 생성
                let successCount = 0;
                shelters.forEach((shelter, index) => {
                    try {
                        debugLog(\`마커 생성 중: \${shelter.name} (\${shelter.lat}, \${shelter.lng})\`);
                        
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

                        // 마커 클릭 이벤트
                        naver.maps.Event.addListener(marker, 'click', function() {
                            debugLog(\`마커 클릭: \${shelter.name}\`);
                            // 다른 정보창들 닫기
                            shelterInfoWindows.forEach(iw => iw.close());
                            
                            if (infoWindow.getMap()) {
                                infoWindow.close();
                            } else {
                                infoWindow.open(map, marker);
                            }
                        });

                        shelterMarkers.push(marker);
                        shelterInfoWindows.push(infoWindow);
                        successCount++;
                        
                        debugLog(\`마커 생성 완료 \${successCount}/\${shelters.length}: \${shelter.name}\`);
                    } catch (error) {
                        debugLog(\`마커 생성 실패: \${shelter.name} - \${error.message}\`);
                    }
                });
                
                debugLog(\`최종 \${successCount}개 마커 생성 완료\`);
            }

            function toggleShelters(show) {
                showShelters = show;
                debugLog(\`대피소 표시 토글: \${show}\`);
                if (show) {
                    // 현재 viewport의 대피소들을 다시 요청
                    if (lastViewportBounds) {
                        sendViewportBounds();
                    }
                } else {
                    clearShelterMarkers();
                }
            }

            function initMap() {
                if (typeof naver === 'undefined' || !naver.maps) {
                    let retryCount = 0;
                    const checkInterval = setInterval(function() {
                        retryCount++;
                        debugLog(\`지도 라이브러리 로딩 시도 \${retryCount}/15\`);
                        if (naver && naver.maps) {
                            clearInterval(checkInterval);
                            createMap();
                        } else if (retryCount >= 15) {
                            clearInterval(checkInterval);
                            debugLog('지도 라이브러리 로딩 실패');
                            showFallbackMap();
                        }
                    }, 300);
                    return;
                }
                createMap();
            }

            function createMap() {
                try {
                    debugLog('지도 생성 시작');
                    const defaultLocation = new naver.maps.LatLng(${location.latitude}, ${location.longitude});
                    
                    map = new naver.maps.Map('map', {
                        center: defaultLocation,
                        zoom: 15,
                        mapTypeControl: true,
                        zoomControl: false,
                        logoControl: false,
                        mapDataControl: false,
                        scaleControl: true,
                    });

                    debugLog('지도 객체 생성 완료');

                    currentMarker = new naver.maps.Marker({
                        position: defaultLocation,
                        map: map,
                        icon: {
                            content: '<div style="width:16px;height:16px;background:#007AFF;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
                            anchor: new naver.maps.Point(11, 11)
                        },
                        zIndex: 200,
                        title: '현재 위치'
                    });

                    debugLog('현재 위치 마커 생성 완료');

                    // 지도 이벤트 리스너 추가
                    naver.maps.Event.addListener(map, 'idle', function() {
                        debugLog('지도 이동 완료');
                        sendViewportBounds();
                    });

                    naver.maps.Event.addListener(map, 'zoom_changed', function() {
                        debugLog(\`줌 레벨 변경: \${map.getZoom()}\`);
                        setTimeout(sendViewportBounds, 100);
                    });

                    debugLog('지도 이벤트 리스너 등록 완료');

                    document.getElementById('fallback').style.display = 'none';
                    document.getElementById('map').style.display = 'block';
                    
                    debugLog('지도 표시 완료');
                    
                    // 초기 viewport 정보 전송 및 대피소 로드
                    setTimeout(() => {
                        sendViewportBounds();
                        sendMapReady();
                        debugLog('초기화 완료');
                    }, 1000);

                } catch (error) {
                    debugLog('지도 생성 오류: ' + error.message);
                    showFallbackMap();
                }
            }

            function showFallbackMap() {
                debugLog('폴백 지도 표시');
                // 폴백 처리는 이미 HTML에 있음
            }

            function updateLocationMarker(lat, lng) {
                if (!map) return;

                try {
                    debugLog(\`위치 마커 업데이트: \${lat}, \${lng}\`);
                    
                    if (currentMarker) {
                        currentMarker.setMap(null);
                    }
                    
                    map.setCenter({lat: lat, lng: lng});
                    
                    if (window.naver && window.naver.maps) {
                        const position = new window.naver.maps.LatLng(lat, lng);
                        currentMarker = new window.naver.maps.Marker({
                            position: position,
                            map: map,
                            icon: {
                                content: '<div style="width:16px;height:16px;background:#007AFF;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
                                anchor: new window.naver.maps.Point(11, 11)
                            },
                            zIndex: 200,
                            title: '현재 위치'
                        });
                    }
                    
                    setTimeout(sendViewportBounds, 300);
                } catch (error) {
                    debugLog('위치 업데이트 오류: ' + error.message);
                }
            }

            function getMapViewportBounds(messageId) {
                if (!map) {
                    debugLog('지도 객체 없음');
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'viewport_bounds_error',
                            messageId: messageId,
                            error: '지도가 초기화되지 않았습니다'
                        }));
                    }
                    return;
                }

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

                    debugLog(\`뷰포트 응답: \${JSON.stringify(viewportBounds)}\`);

                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'viewport_bounds_response',
                            messageId: messageId,
                            bounds: viewportBounds
                        }));
                    }
                } catch (error) {
                    debugLog('뷰포트 가져오기 오류: ' + error.message);
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'viewport_bounds_error',
                            messageId: messageId,
                            error: error.message
                        }));
                    }
                }
            }

            function zoomIn() {
                if (!map) {
                    debugLog('줌 인 실패: 지도 객체 없음');
                    return;
                }
                try {
                    const currentZoom = map.getZoom();
                    const newZoom = Math.min(currentZoom + 1, 21);
                    debugLog(\`줌 인: \${currentZoom} → \${newZoom}\`);
                    map.setZoom(newZoom);
                    
                    // 줌 변경 후 약간의 딜레이를 두고 viewport 업데이트
                    setTimeout(() => {
                        sendViewportBounds();
                    }, 200);
                } catch (error) {
                    debugLog('줌 인 오류: ' + error.message);
                }
            }

            function zoomOut() {
                if (!map) {
                    debugLog('줌 아웃 실패: 지도 객체 없음');
                    return;
                }
                try {
                    const currentZoom = map.getZoom();
                    const newZoom = Math.max(currentZoom - 1, 6);
                    debugLog(\`줌 아웃: \${currentZoom} → \${newZoom}\`);
                    map.setZoom(newZoom);
                    
                    // 줌 변경 후 약간의 딜레이를 두고 viewport 업데이트
                    setTimeout(() => {
                        sendViewportBounds();
                    }, 200);
                } catch (error) {
                    debugLog('줌 아웃 오류: ' + error.message);
                }
            }

            function handleMessage(data) {
                try {
                    const message = JSON.parse(data);
                    debugLog(\`메시지 수신: \${message.type}\`);
                    
                    switch(message.type) {
                        case 'updateLocation':
                            updateLocationMarker(message.latitude, message.longitude);
                            break;
                        case 'zoomIn':
                            zoomIn();
                            break;
                        case 'zoomOut':
                            zoomOut();
                            break;
                        case 'get_viewport_bounds':
                            getMapViewportBounds(message.messageId);
                            break;
                        case 'updateShelters':
                            debugLog(\`대피소 업데이트 요청: \${message.shelters ? message.shelters.length : 0}개\`);
                            updateShelters(message.shelters);
                            break;
                        case 'toggleShelters':
                            toggleShelters(message.show);
                            break;
                        default:
                            debugLog(\`알 수 없는 메시지 타입: \${message.type}\`);
                    }
                } catch (error) {
                    debugLog('메시지 처리 오류: ' + error.message);
                }
            }

            // 메시지 리스너 등록 - 개선된 버전
            function setupMessageListeners() {
                debugLog('메시지 리스너 설정 시작');
                
                if (!window.ReactNativeWebView) {
                    debugLog('ReactNativeWebView 객체 없음');
                    return;
                }

                // document message 리스너 (iOS 주로 사용)
                document.addEventListener('message', (event) => {
                    try {
                        debugLog(\`Document message 수신: \${event.data}\`);
                        handleMessage(event.data);
                    } catch (err) {
                        debugLog('Document message 처리 오류: ' + err.message);
                    }
                });
                
                // window message 리스너 (Android 주로 사용) 
                window.addEventListener('message', function(event) {
                    try {
                        debugLog(\`Window message 수신: \${event.data}\`);
                        handleMessage(event.data);
                    } catch (err) {
                        debugLog('Window message 처리 오류: ' + err.message);
                    }
                });

                debugLog('메시지 리스너 등록 완료');
                
                // React Native로 초기 상태 전송
                setTimeout(() => {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'webview_ready',
                            message: '웹뷰 준비 완료'
                        }));
                        debugLog('초기 상태 메시지 전송');
                    }
                }, 500);
            }

            // 메시지 리스너 등록
            if (window.ReactNativeWebView) {
                setupMessageListeners();
            } else {
                debugLog('ReactNativeWebView 객체 없음 - 폴백 대기');
                // ReactNativeWebView가 아직 로드되지 않았을 경우 대기
                let retryCount = 0;
                const checkWebView = setInterval(() => {
                    retryCount++;
                    if (window.ReactNativeWebView) {
                        debugLog('ReactNativeWebView 객체 발견됨');
                        clearInterval(checkWebView);
                        setupMessageListeners();
                    } else if (retryCount >= 10) {
                        debugLog('ReactNativeWebView 객체 로딩 실패');
                        clearInterval(checkWebView);
                    }
                }, 200);
            }

            // 타임아웃으로 폴백 보장
            setTimeout(function() {
                if (!mapInitialized) {
                    debugLog('초기화 타임아웃');
                    showFallbackMap();
                }
            }, 10000);

            // 페이지 로드 시 지도 초기화
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    debugLog('DOM 로드 완료, 지도 초기화 시작');
                    setTimeout(initMap, 100);
                });
            } else {
                debugLog('즉시 지도 초기화 시작');
                setTimeout(initMap, 100);
            }

            // 전역 오류 처리
            window.onerror = function(message, source, lineno, colno, error) {
                debugLog(\`전역 오류: \${message} at \${source}:\${lineno}:\${colno}\`);
                return false;
            };

        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 WebView 메시지 수신:', data.type);
      
      switch (data.type) {
        case 'webview_ready':
          console.log('✅ WebView 준비 완료');
          break;
          
        case 'injected_js_ready':
          console.log('✅ Injected JavaScript 준비 완료');
          break;
          
        case 'map_ready':
          console.log('🗺️ 지도 준비 완료');
          setMapReady(true);
          break;
          
        case 'viewport_changed':
          console.log('📱 뷰포트 변경:', data.bounds);
          setCurrentViewport(data.bounds);
          if (onViewportChange) {
            onViewportChange(data.bounds);
          }
          // 지도 범위 변경 시 자동으로 대피소 업데이트
          updateSheltersInViewport(data.bounds);
          break;
          
        case 'viewport_bounds_response':
          const callback = viewportRequestCallbacks.current.get(data.messageId);
          if (callback) {
            viewportRequestCallbacks.current.delete(data.messageId);
            callback(data.bounds);
          }
          break;
          
        case 'viewport_bounds_error':
          const errorCallback = viewportRequestCallbacks.current.get(data.messageId);
          if (errorCallback) {
            viewportRequestCallbacks.current.delete(data.messageId);
            console.error('❌ Viewport bounds 오류:', data.error);
          }
          break;
          
        default:
          console.log('❓ 알 수 없는 메시지:', data.type);
      }
    } catch (error) {
      console.error('💥 메시지 파싱 오류:', error);
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    console.error('💥 WebView 오류:', syntheticEvent.nativeEvent);
    Alert.alert('지도 오류', '지도를 불러오는 중 오류가 발생했습니다.');
  };

  // 테스트용 메시지 전송 함수
  const sendTestMessage = (type) => {
    if (webViewRef.current) {
      console.log(`📤 테스트 메시지 전송: ${type}`);
      webViewRef.current.postMessage(JSON.stringify({ 
        type, 
        timestamp: Date.now(),
        test: true 
      }));
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
        onError={handleWebViewError}
        onHttpError={(syntheticEvent) => {
          console.error('🌐 HTTP 오류:', syntheticEvent.nativeEvent);
        }}
        onLoadStart={() => {
          console.log('🚀 WebView 로딩 시작');
        }}
        onLoad={() => {
          console.log('✅ WebView 로딩 완료');
        }}
        // 추가: 메시지 전달 확인을 위한 injected JavaScript
        injectedJavaScript={`
          (function() {
            console.log('🚀 Injected JavaScript 실행');
            
            // 메시지 수신 테스트
            window.addEventListener('message', function(event) {
              console.log('📨 Injected JS에서 메시지 수신:', event.data);
            });
            
            // 즉시 테스트 메시지 전송
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'injected_js_ready',
                message: 'Injected JavaScript 준비 완료'
              }));
            }
            
            true; // injectedJavaScript는 반드시 true를 반환해야 함
          })();
        `}
        renderError={(errorName) => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>지도를 불러올 수 없습니다</Text>
            <Text style={styles.errorSubText}>네트워크 연결을 확인해주세요</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                if (webViewRef.current) {
                  webViewRef.current.reload();
                }
              }}
            >
              <Text style={styles.refreshButtonText}>새로고침</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* 위치 버튼 */}
      <TouchableOpacity 
        style={[styles.locationButton, isTracking && styles.trackingButton]} 
        onPress={handleLocationPress}
      >
        <Ionicons 
          name={isTracking ? "stop-circle-outline" : "location-outline"} 
          size={24} 
          color={isTracking ? "#fff" : "#007AFF"} 
        />
      </TouchableOpacity>

      {/* 현재 위치 버튼 */}
      <TouchableOpacity 
        style={styles.currentLocationButton} 
        onPress={getCurrentLocation}
      >
        <Ionicons 
          name="navigate-outline" 
          size={24} 
          color="#007AFF" 
        />
      </TouchableOpacity>

      {/* 대피소 표시 토글 버튼 */}
      <TouchableOpacity 
        style={[styles.shelterToggleButton, showShelters && styles.shelterToggleActiveButton]} 
        onPress={handleShelterToggle}
      >
        <Ionicons 
          name="home-outline" 
          size={24} 
          color={showShelters ? "#fff" : "#007AFF"} 
        />
      </TouchableOpacity>

      {/* 줌 컨트롤 - 개선된 버전 */}
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

      {/* 대피소 표시 상태 인디케이터 */}
      {showShelters && (
        <View style={styles.shelterIndicator}>
          <Text style={styles.shelterIndicatorText}>🏠 대피소 {shelterCount}개 표시중</Text>
        </View>
      )}

      {/* 현재 viewport 정보 표시 (디버그용) */}
      {__DEV__ && currentViewport && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            📱 화면범위: {currentViewport.startLat},{currentViewport.startLot} ~ {currentViewport.endLat},{currentViewport.endLot}
          </Text>
          <Text style={styles.debugText}>
            🏠 대피소: {shelterCount}개 | 지도준비: {mapReady ? 'O' : 'X'} | 표시: {showShelters ? 'O' : 'X'}
          </Text>
          {/* 테스트 버튼들 */}
          <View style={styles.debugButtons}>
            <TouchableOpacity 
              style={styles.debugButton} 
              onPress={() => sendTestMessage('zoomIn')}
            >
              <Text style={styles.debugButtonText}>테스트 줌+</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.debugButton} 
              onPress={() => sendTestMessage('zoomOut')}
            >
              <Text style={styles.debugButtonText}>테스트 줌-</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  trackingButton: {
    backgroundColor: '#ff4444',
  },
  currentLocationButton: {
    position: 'absolute',
    left: 16,
    top: 72,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  shelterToggleButton: {
    position: 'absolute',
    left: 16,
    top: 128,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  shelterToggleActiveButton: {
    backgroundColor: '#4caf50',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 220,
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
  shelterIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  shelterIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  debugInfo: {
    position: 'absolute',
    top: 184,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    zIndex: 5,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  debugButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
    gap: 8,
  },
  debugButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default MapContainer;