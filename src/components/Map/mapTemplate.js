// ============================================
// 🗺️ src/components/Map/mapTemplate.js (SIDO POLYGON VERSION)
// 네이버 지도 HTML 템플릿 - 시도 경계선 폴리곤 추가
// ============================================

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
    z-index: 1000;
    min-width: 100px;
    }

    .map-control-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        overflow: hidden;
    }

    .accordion-header {
        padding: 12px 16px;
        background: white;
        border: none;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        color: #333;
        transition: background 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .accordion-header:hover {
        background: #f8f8f8;
    }

    .accordion-arrow {
        transition: transform 0.3s;
        font-size: 10px;
        color: #999;
    }

    .accordion-arrow.open {
        transform: rotate(180deg);
    }

    .accordion-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
    }

    .accordion-content.open {
        max-height: 200px;
    }

    .map-type-buttons {
        display: flex;
        flex-direction: column;
        border-top: 1px solid #f0f0f0;
    }

    .map-type-button {
        padding: 12px 16px;
        border: none;
        background: white;
        color: #666;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: left;
        border-bottom: 1px solid #f5f5f5;
    }

    .map-type-button:last-child {
        border-bottom: none;
    }

    .map-type-button.active {
        background: #f0e8ff;
        color: #a374db;
        font-weight: 600;
    }

    .map-type-button:hover:not(.active) {
        background: #f8f8f8;
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
    padding: 12px 16px;
    background: white;
    border: none;
    border-top: 1px solid #f0f0f0;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    text-align: left;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .boundary-toggle-button.active {
        background: #f0e8ff;
        color: #a374db;
        font-weight: 600;
    }

    .boundary-toggle-button:hover {
        background: #f8f8f8;
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
  // ----------------------------------------------------
  // 🚨 여기부터 추가: WebView 로그를 React Native로 리디렉션
  // ----------------------------------------------------
  function setupConsoleRedirect() {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      function sendLogToRN(type, args) {
          try {
              // 객체나 배열을 JSON 문자열로 변환
              const processedArgs = Array.from(args).map(arg => {
                  if (typeof arg === 'object' && arg !== null) {
                      try {
                          return JSON.stringify(arg);
                      } catch (e) {
                          return '[Circular Object]';
                      }
                  }
                  return String(arg);
              });

              window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'webview_log',
                  level: type,
                  data: processedArgs.join(' ') // 모든 인자를 하나의 문자열로 합침
              }));
          } catch (error) {
              // 이 함수 자체가 실패할 경우를 대비
              originalError.call(console, 'Failed to send log to RN:', error);
          }
      }

      console.log = function() {
          originalLog.apply(console, arguments); // 원래 WebView 콘솔에도 로그 남김
          sendLogToRN('log', arguments);        // React Native로 로그 전송
      };
      
      console.warn = function() {
          originalWarn.apply(console, arguments);
          sendLogToRN('warn', arguments);
      };
      
      console.error = function() {
          originalError.apply(console, arguments);
          sendLogToRN('error', arguments);
      };
  }
  setupConsoleRedirect();
  const MIN_ZOOM_FOR_MARKERS = 12;
  let map;
  let currentMarker;
  let shelterMarkers = [];
  let disasterMarkers = [];
  let routePath = null;
  let mapInitialized = false;
  let showShelters = ${showShelters};
  let currentTheme = '${theme}';
  let userLocation = { lat: ${location.latitude}, lng: ${location.longitude} };
  let isMarkerCurrentlySelected = false;
  let pinnedShelterID = null;
  let currentlyBouncingMarker = null;
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
      if (isMarkerCurrentlySelected) {
          console.log('Info window open, skipping viewport change event.');
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
  
          window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'viewport_changed',
              bounds: viewportBounds
          }));
      } catch (error) {
          console.error('뷰포트 전송 오류:', error);
      }
  }
  
  // 시도별 색상 팔레트
  const SIDO_COLORS1 = {
      '서울': '#000000',
      '부산': '#000000',
      '대구': '#000000',
      '인천': '#000000',
      '광주': '#000000',
      '대전': '#000000',
      '울산': '#000000',
      '세종': '#000000',
      '경기': '#000000',
      '강원': '#000000',
      '충북': '#000000',
      '충남': '#000000',
      '전북': '#000000',
      '전남': '#000000',
      '경북': '#000000',
      '경남': '#000000',
      '제주': '#000000'
  };
  
  const SIDO_COLORS2 = {
      '서울': '#00BFFF',
      '부산': '#00BFFF',
      '대구': '#00BFFF',
      '인천': '#00BFFF',
      '광주': '#00BFFF',
      '대전': '#00BFFF',
      '울산': '#00BFFF',
      '세종': '#00BFFF',
      '경기': '#00BFFF',
      '강원': '#00BFFF',
      '충북': '#00BFFF',
      '충남': '#00BFFF',
      '전북': '#00BFFF',
      '전남': '#00BFFF',
      '경북': '#00BFFF',
      '경남': '#00BFFF',
      '제주': '#00BFFF'
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
              
              const color1 = SIDO_COLORS1[sidoName] || '#000000';
              const color2 = SIDO_COLORS2[sidoName] || '#000000';

              // 폴리곤 생성
              const polygon = new naver.maps.Polygon({
                  map: showSidoBoundaries ? map : null,
                  paths: paths,
                  fillColor: color2,
                  fillOpacity: 0.27,
                  strokeColor: color1,
                  strokeOpacity: 0.8,
                  strokeWeight: 1,
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
              /*const center = calculatePolygonCenter(paths);
              if (center) {
                  const label = new naver.maps.Marker({
                      position: center,
                      map: showSidoBoundaries ? map : null,
                      icon: {
                          content: \`<div class="sido-label">\${sidoName}</div>\`,
                          anchor: new naver.maps.Point(0, 0)
                      },
                      zIndex: 1000
                  });
                  sidoLabels.push(label);
              }*/
              
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
              button.textContent = '경계선 ON';
          } else {
              button.classList.remove('active');
              button.textContent = '경계선 OFF';
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
        
        // 컨테이너 생성
        const container = document.createElement('div');
        container.className = 'map-control-container';
        
        // 아코디언 헤더 생성
        const accordionHeader = document.createElement('button');
        accordionHeader.className = 'accordion-header';
        accordionHeader.innerHTML = '<span>지도 유형</span><span class="accordion-arrow">▼</span>';
        
        // 아코디언 콘텐츠 생성
        const accordionContent = document.createElement('div');
        accordionContent.className = 'accordion-content';
        
        const mapTypeButtons = document.createElement('div');
        mapTypeButtons.className = 'map-type-buttons';
        
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
        hybridButton.textContent = '겹쳐보기';
        hybridButton.id = 'hybrid-map-btn';
        hybridButton.onclick = () => changeMapType('hybrid');
        
        mapTypeButtons.appendChild(normalButton);
        mapTypeButtons.appendChild(satelliteButton);
        mapTypeButtons.appendChild(hybridButton);
        
        accordionContent.appendChild(mapTypeButtons);
        
        // 경계선 토글 버튼 생성
        const boundaryToggleButton = document.createElement('button');
        boundaryToggleButton.id = 'boundary-toggle-btn';
        boundaryToggleButton.className = 'boundary-toggle-button active';
        boundaryToggleButton.textContent = '경계선 ON';
        boundaryToggleButton.onclick = toggleSidoBoundaries;
        
        // 아코디언 토글 기능
        let isAccordionOpen = false;
        accordionHeader.onclick = () => {
            isAccordionOpen = !isAccordionOpen;
            if (isAccordionOpen) {
                accordionContent.classList.add('open');
                accordionHeader.querySelector('.accordion-arrow').classList.add('open');
            } else {
                accordionContent.classList.remove('open');
                accordionHeader.querySelector('.accordion-arrow').classList.remove('open');
            }
        };
        
        container.appendChild(accordionHeader);
        container.appendChild(accordionContent);
        container.appendChild(boundaryToggleButton);
        
        mapTypeControl.appendChild(container);
        
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

    function updateMarkerVisibility() {
      if (!map) return;
      
      const currentZoom = map.getZoom();
      const shouldShow = currentZoom >= MIN_ZOOM_FOR_MARKERS;
      
      console.log(\`줌 레벨: \${currentZoom}, 마커 표시: \${shouldShow}\`);
      
      // 📍 [수정] forEach에 index 인자 추가
      shelterMarkers.forEach((item) => {
          
          // 📍 [수정] '순번' 비교(index === ...)가 아닌 'ID' 비교로 변경
          if (item.shelter.uniqueID && item.shelter.uniqueID === pinnedShelterID) { 
              item.marker.setMap(map); // 고정된 마커는 줌 레벨과 상관없이 항상 표시
          } else {
              // (기존 로직)
              item.marker.setMap(shouldShow ? map : null);
              
              if (!shouldShow) {
                  item.infoWindow.close();
              }
          }
      });
    }

    function handleManualMove() {
      // 1-1. 열려있는 모든 정보창 닫기
      shelterMarkers.forEach(item => item.infoWindow.close());

      isMarkerCurrentlySelected = false;
      
      // 1-2. React Native에 "수동 조작했음" 신호 전송
      window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'map_manual_move'
      }));
    }

    function updateShelters(shelters) {
      if (!map) return;
      
      console.log('📥 updateShelters 호출됨, 대피소 수:', shelters?.length || 0);
      
      // 기존 마커 제거
      shelterMarkers.forEach(item => {
          if (item.marker) item.marker.setMap(null);
          if (item.infoWindow) item.infoWindow.close();
      });
      shelterMarkers = []; // 배열 비우기

      currentlyBouncingMarker = null;

      if (!shelters || shelters.length === 0) {
          console.warn('⚠️ 대피소 데이터가 없습니다');
          return;
      }
      
      let successCount = 0;
      let failCount = 0;
      
      shelters.forEach((shelter, index) => {
        
        try {
          // ✅ FIX: 여러 필드명 형식 모두 지원 (LAT/lat/latitude, LOT/lot/lng/longitude)
          const lat = parseFloat(shelter.LAT || shelter.lat || shelter.latitude);
          const lng = parseFloat(shelter.LOT || shelter.lot || shelter.lng || shelter.longitude);
          const shelterID = shelter.RONA_DADDR || shelter.rdnmadr_nm || shelter.dtl_adres || shelter.REARE_NM || shelter.vt_acmdfclty_nm || \`\${lat}_\${lng}\`;

          if (index < 3) {
              console.log(\`🏠 대피소[\${index}] 좌표 체크:\`, {
                  name: shelter.REARE_NM || shelter.vt_acmdfclty_nm,
                  lat: lat,
                  lng: lng,
                  원본: { LAT: shelter.LAT, LOT: shelter.LOT, lat: shelter.lat, lot: shelter.lot }
              });
          }
          
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
              if (failCount < 3) {
                  console.warn('⚠️ 좌표 없거나 유효하지 않음:', {
                      name: shelter.REARE_NM || shelter.vt_acmdfclty_nm,
                      lat: lat,
                      lng: lng,
                      원본: { LAT: shelter.LAT, LOT: shelter.LOT }
                  });
              }
              failCount++;
              return; // ⬅️ try...catch 안의 return은 continue처럼 동작합니다.
          }
          
          const location = new naver.maps.LatLng(lat, lng);
          
          const getShelterIcon = (type) => {
              const iconMap = {
                  '지진': { emoji: '🏢', color: '#FF6B6B' },
                  '민방위': { emoji: '🏛️', color: '#4ECDC4' },
                  '화생방': { emoji: '🛡️', color: '#95E1D3' },
                  '대피소': { emoji: '🏠', color: '#a374db' }
              };
              // 🚨 FIX: type이 null이거나 undefined일 경우를 대비하여 기본값 설정
              const shelterType = type || '대피소';
              const matchedType = Object.keys(iconMap).find(key => shelterType.includes(key)) || '대피소';
              const config = iconMap[matchedType];
              
              return \`<div style="
                  background: \${config.color};
                  color: white;
                  padding: 8px;
                  border-radius: 50%;
                  font-size: 20px;
                  box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                  border: 2px solid white;
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              ">\${config.emoji}</div>\`;
          };
          
          const marker = new naver.maps.Marker({
              position: location,
              map: map,
              icon: {
                  content: getShelterIcon(shelter.SHLT_SE_NM || shelter.vt_acmdfclty_se_nm || shelter.shlt_se_nm),
                  anchor: new naver.maps.Point(16, 16)
              },
              zIndex: 100,
              title: shelter.REARE_NM || shelter.vt_acmdfclty_nm
          });
          
          const distance = userLocation ? 
              calculateDistance(
                  userLocation.lat, 
                  userLocation.lng, 
                  lat, 
                  lng
              ).toFixed(1) : '0.0';
          const markerIndex = shelterMarkers.length;

          const infoWindowContent = \`
              <div class="shelter-info-window">
                  <div class="shelter-name">\${shelter.REARE_NM || shelter.vt_acmdfclty_nm || '이름 없음'}</div>
                  <div class="shelter-type">\${shelter.SHLT_SE_NM || shelter.vt_acmdfclty_se_nm || shelter.shlt_se_nm || '대피소'}</div>
                  <div class="shelter-address">\${shelter.RONA_DADDR || shelter.rdnmadr_nm || shelter.dtl_adres || '주소 정보 없음'}</div>
                  <div class="shelter-distance">📍 \${distance}km</div>
                  <button class="route-button" onclick="requestRoute(\${lat}, \${lng}, '\${shelter.REARE_NM || shelter.vt_acmdfclty_nm || '이름 없음'}', '\${shelterID}')">
                      길찾기
                  </button>
              </div>
          \`;
          
          const infoWindow = new naver.maps.InfoWindow({
              content: infoWindowContent,
              borderWidth: 0,
              backgroundColor: 'transparent',
              disableAnchor: false,
              pixelOffset: new naver.maps.Point(0, -10)
          });
          
          naver.maps.Event.addListener(marker, 'click', function() {                             
                shelterMarkers.forEach(item => item.infoWindow.close());
                isMarkerCurrentlySelected = true;
                infoWindow.open(map, marker);
                
                map.panTo(location);
                
                setTimeout(() => {
                    if (map.getZoom() < 15) {
                        map.setZoom(15, true);
                    }
                }, 300);
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'user_interaction_start'
                }));
          });

          shelter.uniqueID = shelterID;
          shelterMarkers.push({ marker, infoWindow, shelter });
          successCount++;

        
        } catch (error) {
            console.error(\`❌ 대피소[\${index}] 마커 생성 중 오류 발생:\`, {
                name: shelter.REARE_NM,
                error: error.message || String(error) // 오류 메시지를 문자열로 변환
            });
            failCount++;
        }
        
      });
      
      // 📍 [수정] 핀 복원 로직 (ID 기준)
      if (pinnedShelterID && shelterMarkers.length > 0) {
          console.log('🔄 대피소 갱신, 핀 복원 시도... ID:', pinnedShelterID);
          
          // '새' 마커 배열에서 'pinnedShelterID'를 가진 마커를 찾습니다.
          const newPinnedItem = shelterMarkers.find(item => item.shelter.uniqueID === pinnedShelterID);
          
          if (newPinnedItem) {
              const newPinnedMarker = newPinnedItem.marker;
              newPinnedMarker.setAnimation(naver.maps.Animation.BOUNCE);
              currentlyBouncingMarker = newPinnedMarker; // 튀는 마커 갱신
              console.log('✅ 핀 마커 복원 성공:', newPinnedItem.shelter.REARE_NM);
          } else {
              console.warn('⚠️ 핀 마커 복원 실패: ID를 찾을 수 없음');
          }
      }

      updateMarkerVisibility();
      console.log(\`✅ 대피소 마커 생성 완료: 성공 \${successCount}개, 실패 \${failCount}개\`);
    }

  function requestRoute(lat, lng, name, shelterID) {
      console.log('📬 경로 그리기 요청:', { lat: lat, lng: lng, name: name, shelterID: shelterID });

      clearRoutePolyline();

      if (currentlyBouncingMarker) {
          currentlyBouncingMarker.setAnimation(null); // 애니메이션 중지
          currentlyBouncingMarker = null;
      }

      // 📍 [수정] '순번' 대신 '고유 ID'를 저장합니다.
      if (shelterID) {
          pinnedShelterID = shelterID; // 📍 ID 저장
          
          // 지금 당장 튀게 만들 마커를 ID로 찾습니다.
          const newPinnedItem = shelterMarkers.find(item => item.shelter.uniqueID === shelterID);

          if (newPinnedItem) {
              const newPinnedMarker = newPinnedItem.marker;
              newPinnedMarker.setMap(map);
              newPinnedMarker.setAnimation(naver.maps.Animation.BOUNCE);
              currentlyBouncingMarker = newPinnedMarker;
          } else {
               console.warn('⚠️ (request) 핀 설정 실패: ID를 찾을 수 없음');
          }
      } else {
          pinnedShelterID = null; // 📍 ID 초기화
          console.warn('⚠️ 고정할 마커 ID가 유효하지 않습니다.');
      }

      // 1. 정보창 닫기
      shelterMarkers.forEach(item => item.infoWindow.close());
      isMarkerCurrentlySelected = false; 
      
      // 2. React Native로 메시지 전송
      if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'request_route',
              goalLat: lat,
              goalLng: lng,
              goalName: name
          }));
      } else {
          console.error('❌ ReactNativeWebView가 없습니다.');
      }
  }
      
  function toggleShelters(show) {
      showShelters = show;
      shelterMarkers.forEach(item => {
          if (item.marker) {
              item.marker.setMap(show ? map : null);
          }
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
      return (R * c);
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
          
          naver.maps.Event.addListener(map, 'zoom_changed', updateMarkerVisibility);

          // 시도 폴리곤 그리기
          setTimeout(() => {
              drawSidoPolygons();
          }, 1000);

          naver.maps.Event.addListener(map, 'dragstart', handleManualMove);
          naver.maps.Event.addListener(map, 'touchstart', handleManualMove); // 핀치줌(두손가락) 조작 감지

          naver.maps.Event.addListener(map, 'idle', sendViewportBounds);
          naver.maps.Event.addListener(map, 'zoom_changed', () => setTimeout(sendViewportBounds, 100));
  
          setTimeout(() => {
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
    function drawRoute(routeData) {
        console.log('🛣️ drawRoute 함수 호출', routeData);
        
        clearRoutePolyline();
        
        if (!routeData || !routeData.route || !routeData.route.trafast || !routeData.route.trafast[0]) {
            console.error('❌ 유효하지 않은 경로 데이터');
            return;
        }
        
        try {
            const route = routeData.route.trafast[0];
            const path = route.path;
            
            // 경로 좌표 변환
            const routeCoords = [];
            for (let i = 0; i < path.length; i++) {
                const coord = path[i]; // coord는 [lng, lat] 배열입니다.
                const lng = coord[0];
                const lat = coord[1];
                routeCoords.push(new naver.maps.LatLng(lat, lng));
            }
            
            console.log('📍 경로 좌표 개수:', routeCoords.length);
            
            // 경로 폴리라인 생성
            routePath = new naver.maps.Polyline({
                map: map,
                path: routeCoords,
                strokeColor: '#5347AA',
                strokeWeight: 6,
                strokeOpacity: 0.8,
                strokeLineCap: 'round',
                strokeLineJoin: 'round'
            });
            
            console.log('✅ 경로 폴리라인 생성 완료');
            
            const bounds = new naver.maps.LatLngBounds();
            
            // 1. 경로 좌표 추가
            routeCoords.forEach(coord => bounds.extend(coord));
            
            // 2. 대피소 마커 좌표 추가
            // shelterMarkers는 MapContainer에서 updateShelters 메시지를 통해
            // WebView로 전달된 전역 변수(또는 전역적으로 접근 가능한 상태)라고 가정합니다.
            shelterMarkers.forEach(markerItem => {
                bounds.extend(markerItem.marker.getPosition());
            });

            // 3. 현재 위치 마커 (currentMarker) 좌표 추가
            if (currentMarker) {
                bounds.extend(currentMarker.getPosition());
            }

            // 지도 범위 조정 (maxZoom 제한)
            map.fitBounds(bounds, {
                padding: { // 지도의 여백 (경로가 잘리지 않도록)
                    top: 100, // 상단 (정보창이나 헤더 있을 경우)
                    right: 50,
                    bottom: 100, // 하단 (하단 버튼 있을 경우)
                    left: 50
                },
                // ✅ maxZoom: 최대 줌 레벨을 15로 제한 (더 이상 축소되지 않도록)
                // 이 값을 조절하여 가장 적절하다고 생각하는 줌 레벨로 맞춰주세요.
                // 값이 클수록 더 확대되고, 작을수록 더 축소됩니다.
                maxZoom: 15 
            });
            
            console.log('✅ 지도 범위 조정 완료');
            
        } catch (error) {
            console.error('❌ 경로 그리기 오류:', error);
        }
    }

    // 경로 지우기 함수
    function clearRouteAndPin() {
      console.log('🗑️ clearRouteAndPin 함수 호출 (핀 포함)');
      
      if (routePath) {
          routePath.setMap(null);
          routePath = null;
      }
      // --- 📍 [수정 시작] ---
      // 1. 튀고 있던 마커를 멈춥니다.
      if (currentlyBouncingMarker) {
          currentlyBouncingMarker.setAnimation(null); // 애니메이션 중지
          currentlyBouncingMarker = null;
      }
      // --- [수정 끝] ---

      pinnedShelterID = null;

      console.log('📌 마커 고정 해제');
      
      updateMarkerVisibility();
      
      console.log('✅ 경로 및 핀 제거 완료');
  }

  function clearRoutePolyline() {
      console.log('🗑️ clearRoutePolyline 함수 호출 (선만)');
      if (routePath) {
          routePath.setMap(null);
          routePath = null;
          console.log('✅ 기존 경로 Polyline 제거');
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
                  handleManualMove();
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
              case 'drawRoute':
                  drawRoute(message.routeData);
                  break;
              case 'clearRoute':
                  clearRouteAndPin();
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