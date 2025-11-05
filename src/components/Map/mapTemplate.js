const getSidoData = () => {
    // sido.json 파일의 내용을 여기에 포함 (MapContainer에서 주입)
    return window.SIDO_GEOJSON || null;
  };
  
  export const getMapHTML = (clientId, location, showShelters, theme, sidoData) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
      <title>네이버 지도</title>
      <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}"></script>
      <style>
          ${getMapStyles()}
      </style>
      <script type="text/javascript">
          // Sido GeoJSON 데이터를 전역 변수로 설정
          window.SIDO_GEOJSON = ${JSON.stringify(sidoData)};
      </script>
  </head>
  <body>
      <div id="map"></div>
      <script>
          ${getMapScript(location, showShelters, theme)}
      </script>
  </body>
  </html>
  `;
  
  const getMapStyles = () => `
  body, html { 
      margin: 0; 
      padding: 0; 
      width: 100%; 
      height: 100%; 
      overflow: hidden;
      background-color: #f0f0f0;
      touch-action: pan-x pan-y pinch-zoom;
  }
  #map { 
      width: 100%; 
      height: 100vh;
      touch-action: manipulation;
  }
  
  .map_type_control {
      display: none !important;
  }
  
  .custom-map-type-control {
      position: absolute;
      top: 80px;
      right: 13px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 1000;
  }
  
  .map-type-button {
      width: 60px;
      padding: 8px 10px;
      border: none;
      background: white;
      color: #666;
      font-size: 9px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      text-align: center;
  }
  
  .map-type-button.active {
      background: #a374db;
      color: white;
      box-shadow: 0 3px 12px rgba(163, 116, 219, 0.4);
  }
  
  .map-type-button:hover:not(.active) {
      background: #f5f5f5;
      transform: scale(1.05);
  }
  
  .current-location-button {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: white;
      border: none;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 1000;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
  }
  
  .current-location-button:hover {
      background: #f0f0f0;
      transform: scale(1.1);
  }
  
  .current-location-button:active {
      transform: scale(0.95);
  }
  
  .boundary-toggle-button {
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 10px 16px;
      background: white;
      border: none;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-size: 12px;
      font-weight: 600;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;
      z-index: 1000;
  }
  
  .boundary-toggle-button.active {
      background: #a374db;
      color: white;
  }
  
  .boundary-toggle-button:hover {
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
      margin-bottom: 8px;
  }
  
  .shelter-distance {
      font-size: 13px;
      color: #a374db;
      font-weight: bold;
      margin-bottom: 8px;
  }
  
  .route-button {
      width: 100%;
      padding: 8px;
      background: #a374db;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
  }
  
  .route-button:hover {
      background: #8355c4;
  }
  
  .disaster-info-window {
      padding: 10px;
      min-width: 150px;
  }
  
  .disaster-title {
      font-size: 15px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
  }
  
  .disaster-type {
      font-size: 13px;
      color: #ff4444;
      font-weight: 600;
  }
  
  /* 시도 이름 라벨 스타일 */
  .sido-label {
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      pointer-events: none;
      white-space: nowrap;
  }
  `;
  
  const getMapScript = (location, showShelters, theme) => `
  let map;
  let currentMarker;
  let shelterMarkers = [];
  let shelterInfoWindows = [];
  let disasterMarkers = [];
  let routePath = null;
  let mapInitialized = false;
  let showShelters = ${showShelters};
  let currentTheme = '${theme}';
  let userLocation = { lat: ${location.latitude}, lng: ${location.longitude} };
  
  // Sido 경계선 관련 변수
  let sidoPolygons = [];
  let sidoLabels = [];
  let showSidoBoundaries = true;
  
  const KOREA_CENTER = { lat: 36.5, lng: 127.5 };
  
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
  
  // 시도별 색상 팔레트
  const SIDO_COLORS = {
      '서울': '#FF6B6B',
      '부산': '#4ECDC4',
      '대구': '#45B7D1',
      '인천': '#FFA07A',
      '광주': '#98D8C8',
      '대전': '#F7DC6F',
      '울산': '#BB8FCE',
      '세종': '#85C1E2',
      '경기': '#52C41A',
      '강원': '#69C0FF',
      '충북': '#FFD666',
      '충남': '#FFA940',
      '전북': '#B37FEB',
      '전남': '#73D13D',
      '경북': '#5CDBD3',
      '경남': '#FF85C0',
      '제주': '#FFC069'
  };
  
  // Sido 폴리곤 그리기
  function drawSidoPolygons() {
      console.log('🗺️ Sido 폴리곤 그리기 시작');
      
      if (!window.SIDO_GEOJSON) {
          console.error('❌ SIDO_GEOJSON 데이터가 없습니다');
          return;
      }
      
      const geoJson = window.SIDO_GEOJSON;
      console.log('✅ GeoJSON 데이터 로드 완료:', geoJson.features.length, '개 시도');
      
      // 기존 폴리곤 제거
      sidoPolygons.forEach(polygon => polygon.setMap(null));
      sidoLabels.forEach(label => label.setMap(null));
      sidoPolygons = [];
      sidoLabels = [];
      
      geoJson.features.forEach((feature, index) => {
          const properties = feature.properties;
          const sidoName = properties.SIG_KOR_NM;
          const geometry = feature.geometry;
          
          console.log(\`📍 \${index + 1}. \${sidoName} 폴리곤 생성 중...\`);
          
          try {
              let paths = [];
              
              if (geometry.type === 'Polygon') {
                  // Polygon: 하나의 다각형
                  paths = geometry.coordinates.map(ring => 
                      ring.map(coord => new naver.maps.LatLng(coord[1], coord[0]))
                  );
              } else if (geometry.type === 'MultiPolygon') {
                  // MultiPolygon: 여러 개의 다각형
                  paths = geometry.coordinates.map(polygon => 
                      polygon.map(ring => 
                          ring.map(coord => new naver.maps.LatLng(coord[1], coord[0]))
                      )
                  ).flat();
              }
              
              const color = SIDO_COLORS[sidoName] || '#999999';
              
              // 폴리곤 생성
              const polygon = new naver.maps.Polygon({
                  map: showSidoBoundaries ? map : null,
                  paths: paths,
                  fillColor: color,
                  fillOpacity: 0.15,
                  strokeColor: color,
                  strokeOpacity: 0.8,
                  strokeWeight: 3,
                  clickable: true
              });
              
              // 마우스 오버 이벤트
              naver.maps.Event.addListener(polygon, 'mouseover', function() {
                  polygon.setOptions({
                      fillOpacity: 0.3,
                      strokeWeight: 3
                  });
              });
              
              // 마우스 아웃 이벤트
              naver.maps.Event.addListener(polygon, 'mouseout', function() {
                  polygon.setOptions({
                      fillOpacity: 0.15,
                      strokeWeight: 2
                  });
              });
              
              sidoPolygons.push(polygon);
              
              // 시도 이름 라벨 추가 (중심점 계산)
              
              
              console.log(\`✅ \${sidoName} 폴리곤 생성 완료\`);
          } catch (error) {
              console.error(\`❌ \${sidoName} 폴리곤 생성 오류:\`, error);
          }
      });
      
      console.log(\`✅ 총 \${sidoPolygons.length}개 시도 폴리곤 생성 완료\`);
  }
  
  // 폴리곤 중심점 계산
  function calculatePolygonCenter(paths) {
      try {
          let totalLat = 0;
          let totalLng = 0;
          let count = 0;
          
          // 첫 번째 path만 사용 (외곽선)
          const firstPath = Array.isArray(paths[0]) ? paths[0] : paths;
          
          firstPath.forEach(point => {
              if (point.lat && point.lng) {
                  totalLat += point.lat();
                  totalLng += point.lng();
                  count++;
              }
          });
          
          if (count === 0) return null;
          
          return new naver.maps.LatLng(totalLat / count, totalLng / count);
      } catch (error) {
          console.error('중심점 계산 오류:', error);
          return null;
      }
  }
  
  // 시도 경계선 토글
  function toggleSidoBoundaries() {
      showSidoBoundaries = !showSidoBoundaries;
      console.log('🔄 시도 경계선 토글:', showSidoBoundaries);
      
      sidoPolygons.forEach(polygon => {
          polygon.setMap(showSidoBoundaries ? map : null);
      });
      
      sidoLabels.forEach(label => {
          label.setMap(showSidoBoundaries ? map : null);
      });
      
      const button = document.getElementById('boundary-toggle-btn');
      if (button) {
          if (showSidoBoundaries) {
              button.classList.add('active');
              button.textContent = '🗺️ 경계선 ON';
          } else {
              button.classList.remove('active');
              button.textContent = '🗺️ 경계선 OFF';
          }
      }
  }
  
  function moveToCurrentLocation() {
      if (!map) return;
      try {
          const position = new naver.maps.LatLng(userLocation.lat, userLocation.lng);
          map.panTo(position);
          map.setZoom(15);
      } catch (error) {
          console.error('현재 위치 이동 오류:', error);
      }
  }
  
  function createCustomMapTypeControl() {
      const mapTypeControl = document.createElement('div');
      mapTypeControl.className = 'custom-map-type-control';
      
      const normalButton = document.createElement('button');
      normalButton.className = 'map-type-button active';
      normalButton.textContent = '기본';
      normalButton.id = 'normal-map-btn';
      normalButton.onclick = () => changeMapType('normal');
      
      const satelliteButton = document.createElement('button');
      satelliteButton.className = 'map-type-button';
      satelliteButton.textContent = '위성';
      satelliteButton.id = 'satellite-map-btn';
      satelliteButton.onclick = () => changeMapType('satellite');
      
      const hybridButton = document.createElement('button');
      hybridButton.className = 'map-type-button';
      hybridButton.textContent = '하이브리드';
      hybridButton.id = 'hybrid-map-btn';
      hybridButton.onclick = () => changeMapType('hybrid');
      
      mapTypeControl.appendChild(normalButton);
      mapTypeControl.appendChild(satelliteButton);
      mapTypeControl.appendChild(hybridButton);
      
      document.getElementById('map').appendChild(mapTypeControl);
  }
  
  function changeMapType(type) {
      if (!map) return;
      
      document.querySelectorAll('.map-type-button').forEach(btn => {
          btn.classList.remove('active');
      });
      
      switch(type) {
          case 'normal':
              map.setMapTypeId(naver.maps.MapTypeId.NORMAL);
              document.getElementById('normal-map-btn').classList.add('active');
              break;
          case 'satellite':
              map.setMapTypeId(naver.maps.MapTypeId.SATELLITE);
              document.getElementById('satellite-map-btn').classList.add('active');
              break;
          case 'hybrid':
              map.setMapTypeId(naver.maps.MapTypeId.HYBRID);
              document.getElementById('hybrid-map-btn').classList.add('active');
              break;
      }
  }
  
  function applyTheme(theme) {
      if (!map) return;
      console.log('테마 변경:', theme);
  }
  
  const DISASTER_TYPES = {
      earthquake: { icon: '🌍', name: '지진', color: '#ff4444' },
      flood: { icon: '🌊', name: '홍수', color: '#4169E1' },
      fire: { icon: '🔥', name: '화재', color: '#ff6b00' },
      typhoon: { icon: '🌀', name: '태풍', color: '#9370DB' }
  };
  
  function addDisasterMarkers() {
      const disasters = [
          { type: 'earthquake', lat: 35.8, lng: 129.2, title: '경주 지진' },
          { type: 'flood', lat: 37.5, lng: 127.0, title: '서울 침수' }
      ];
      
      disasters.forEach(disaster => {
          const disasterType = DISASTER_TYPES[disaster.type];
          const marker = new naver.maps.Marker({
              position: new naver.maps.LatLng(disaster.lat, disaster.lng),
              map: map,
              icon: {
                  content: \`<div style="font-size:24px;">\${disasterType.icon}</div>\`,
                  anchor: new naver.maps.Point(12, 12)
              },
              zIndex: 300
          });
          
          const infoWindow = new naver.maps.InfoWindow({
              content: \`
                  <div class="disaster-info-window">
                      <div class="disaster-title">\${disaster.title}</div>
                      <div class="disaster-type">\${disasterType.name}</div>
                  </div>
              \`
          });
          
          naver.maps.Event.addListener(marker, 'click', () => {
              if (infoWindow.getMap()) {
                  infoWindow.close();
              } else {
                  infoWindow.open(map, marker);
              }
          });
          
          disasterMarkers.push(marker);
      });
  }
  
  function updateShelters(shelters) {
      console.log('대피소 업데이트:', shelters.length);
      
      shelterMarkers.forEach(marker => marker.setMap(null));
      shelterInfoWindows.forEach(iw => iw.close());
      shelterMarkers = [];
      shelterInfoWindows = [];
      
      if (!shelters || shelters.length === 0 || !showShelters) {
          return;
      }
      
      shelters.forEach(shelter => {
          if (!shelter.latitude || !shelter.longitude) return;
          
          const position = new naver.maps.LatLng(shelter.latitude, shelter.longitude);
          
          const marker = new naver.maps.Marker({
              position: position,
              map: map,
              icon: {
                  content: '<div style="width:20px;height:20px;background:#4CAF50;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
                  anchor: new naver.maps.Point(10, 10)
              },
              zIndex: 100
          });
          
          const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              shelter.latitude,
              shelter.longitude
          );
          
          const infoWindow = new naver.maps.InfoWindow({
              content: \`
                  <div class="shelter-info-window">
                      <div class="shelter-name">\${shelter.name || '대피소'}</div>
                      <div class="shelter-type">\${shelter.type || '일반대피소'}</div>
                      <div class="shelter-address">\${shelter.address || ''}</div>
                      <div class="shelter-distance">📍 \${distance}km</div>
                      <button class="route-button" onclick="alert('길찾기 기능 준비중')">
                          🧭 길찾기
                      </button>
                  </div>
              \`,
              maxWidth: 300,
              backgroundColor: "#fff",
              borderColor: "#ccc",
              borderWidth: 1,
              anchorSize: new naver.maps.Size(10, 10),
              pixelOffset: new naver.maps.Point(0, -10)
          });
          
          naver.maps.Event.addListener(marker, 'click', () => {
              shelterInfoWindows.forEach(iw => iw.close());
              infoWindow.open(map, marker);
          });
          
          shelterMarkers.push(marker);
          shelterInfoWindows.push(infoWindow);
      });
  }
  
  function toggleShelters(show) {
      showShelters = show;
      shelterMarkers.forEach(marker => {
          marker.setMap(show ? map : null);
      });
      if (!show) {
          shelterInfoWindows.forEach(iw => iw.close());
      }
  }
  
  function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(1);
  }
  
  function createMap() {
      try {
          console.log('지도 생성 시작');
          
          const userPosition = new naver.maps.LatLng(
              userLocation.lat,
              userLocation.lng
          );
          
          map = new naver.maps.Map('map', {
              center: userPosition,
              zoom: 7,
              mapTypeControl: false,
              zoomControlOptions: {
                  style: naver.maps.ZoomControlStyle.SMALL,
                  position: naver.maps.Position.TOP_RIGHT
              },
              logoControl: false,
              mapDataControl: false,
              scaleControl: true,
              minZoom: 6,
              maxZoom: 18,
              draggable: true,
              pinchZoom: true,
              scrollWheel: true,
              keyboardShortcuts: true,
              disableDoubleTapZoom: true,
              disableDoubleClickZoom: true,
              disableTwoFingerTapZoom: true
          });
  
          createCustomMapTypeControl();
          
          setTimeout(() => {
              applyTheme(currentTheme);
          }, 500);
  
          currentMarker = new naver.maps.Marker({
              position: userPosition,
              map: map,
              icon: {
                  content: '<div style="width:18px;height:18px;background:#a374db;border:3px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(163,116,219,0.6);"></div>',
                  anchor: new naver.maps.Point(12, 12)
              },
              zIndex: 200,
              title: '현재 위치'
          });
  
          const currentLocationButton = document.createElement('button');
          currentLocationButton.className = 'current-location-button';
          currentLocationButton.innerHTML = '📍';
          currentLocationButton.onclick = moveToCurrentLocation;
          
          document.getElementById('map').appendChild(currentLocationButton);
  
          const boundaryToggleButton = document.createElement('button');
          boundaryToggleButton.id = 'boundary-toggle-btn';
          boundaryToggleButton.className = 'boundary-toggle-button active';
          boundaryToggleButton.textContent = '🗺️ 경계선 ON';
          boundaryToggleButton.onclick = toggleSidoBoundaries;
          
          document.getElementById('map').appendChild(boundaryToggleButton);
  
          addDisasterMarkers();
          
          // 시도 폴리곤 그리기
          setTimeout(() => {
              drawSidoPolygons();
          }, 1000);
          
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
  
  function updateLocationMarker(lat, lng, zoom) {
      if (!map) return;
      try {
          if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
              const position = new naver.maps.LatLng(lat, lng);
              userLocation = { lat, lng };
              if (currentMarker) {
                  currentMarker.setPosition(position);
              }
              if (zoom !== undefined && zoom !== null) {
                  console.log('✅ updateLocationMarker에서 줌 레벨 적용:', zoom);
                  map.setZoom(zoom);
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
  
  function moveAndZoom(lat, lng, zoom) {
      console.log('🎯 moveAndZoom 함수 진입 - lat:', lat, 'lng:', lng, 'zoom:', zoom);
      
      if (!map) {
          console.error('❌ map이 없습니다');
          return;
      }
      
      try {
          console.log('🗺️ moveAndZoom 실행 시작');
          
          if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
              const position = new naver.maps.LatLng(lat, lng);
              console.log('📍 position 생성 완료:', position);
              
              userLocation = { lat, lng };
              
              if (currentMarker) {
                  currentMarker.setPosition(position);
                  console.log('📌 마커 위치 업데이트');
              }
              
              if (zoom !== undefined && zoom !== null) {
                  console.log('줌 설정 시작 - 레벨:', zoom );
                  map.setZoom(zoom, true);
                  console.log('✅ 줌 레벨 설정 완료:', zoom);
              }
      
              setTimeout(() => {
                  console.log('위치 이동 시작');
                  map.panTo(position);
              }, 500);
              
              console.log('✅ moveAndZoom 실행 완료');
          } else {
              console.warn('⚠️ 좌표가 한국 범위를 벗어남:', lat, lng);
          }
      } catch (error) {
          console.error('❌ moveAndZoom 오류:', error);
          console.error('❌ 오류 스택:', error.stack);
      }
  }
  
  function zoomIn() {
      if (!map) return;
      try {
          const currentZoom = map.getZoom();
          const newZoom = Math.min(currentZoom + 1, 21);
          console.log('🔍 Zoom In:', currentZoom, '->', newZoom);
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
          console.log('🔍 Zoom Out:', currentZoom, '->', newZoom);
          map.setZoom(newZoom);
      } catch (error) {
          console.error('줌 아웃 오류:', error);
      }
  }
  
  function handleMessage(data) {
      try {
          const message = JSON.parse(data);
          console.log('📩 메시지 수신:', message.type, message);
          
          switch(message.type) {
              case 'updateLocation':
                  updateLocationMarker(message.latitude, message.longitude, message.zoom);
                  break;
              case 'moveToLocation':
                  moveToLocation(message.latitude, message.longitude);
                  break;
              case 'moveAndZoom':
                  moveAndZoom(message.latitude, message.longitude, message.zoom);
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
              case 'get_current_location':
                  moveToCurrentLocation();
                  break;
              case 'toggleBoundaries':
                  toggleSidoBoundaries();
                  break;
          }
      } catch (error) {
          console.error('메시지 처리 오류:', error);
      }
  }
  
  function setupMessageListeners() {
      document.addEventListener('message', (event) => {
          console.log('📨 document 메시지 수신:', event.data);
          handleMessage(event.data);
      });
      
      window.addEventListener('message', (event) => {
          console.log('📨 window 메시지 수신:', event.data);
          handleMessage(event.data);
      });
      
      setTimeout(() => {
          if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'webview_ready'
              }));
              console.log('✅ webview_ready 메시지 전송');
          }
      }, 500);
  }
  
  setupMessageListeners();
  console.log('✅ 메시지 리스너 설정 완료');
  
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
  `;