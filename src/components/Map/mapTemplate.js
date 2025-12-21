import { DISASTER_IMAGES } from '../../assets/icons/disasterIcons';

// 1. HTML 전체 구조 (export 필수)
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
          window.SIDO_GEOJSON = ${JSON.stringify(sidoData)};
          window.DISASTER_IMG_DATA = ${JSON.stringify(DISASTER_IMAGES)};
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

// 2. 스타일 정의
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
  
  .map_type_control { display: none !important; }
  
  .custom-map-type-control {
    position: absolute; top: 80px; right: 13px; z-index: 1000; min-width: 100px;
  }

  .map-control-container {
      background: white; border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15); overflow: hidden;
  }

  .accordion-header {
      padding: 12px 16px; background: white; border: none; width: 100%;
      display: flex; align-items: center; justify-content: space-between;
      cursor: pointer; font-size: 13px; font-weight: 600; color: #333;
      transition: background 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .accordion-header:hover { background: #f8f8f8; }

  .accordion-arrow { transition: transform 0.3s; font-size: 10px; color: #999; }
  .accordion-arrow.open { transform: rotate(180deg); }

  .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
  .accordion-content.open { max-height: 200px; }

  .map-type-buttons { display: flex; flex-direction: column; border-top: 1px solid #f0f0f0; }

  .map-type-button {
      padding: 12px 16px; border: none; background: white; color: #666;
      font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: left; border-bottom: 1px solid #f5f5f5;
  }
  .map-type-button:last-child { border-bottom: none; }
  .map-type-button.active { background: #f0e8ff; color: #a374db; font-weight: 600; }
  .map-type-button:hover:not(.active) { background: #f8f8f8; }
  
  .boundary-toggle-button {
      padding: 12px 16px; background: white; border: none; border-top: 1px solid #f0f0f0;
      font-size: 13px; font-weight: 500; color: #666; cursor: pointer;
      transition: all 0.2s; width: 100%; text-align: left;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .boundary-toggle-button.active { background: #f0e8ff; color: #a374db; font-weight: 600; }
  .boundary-toggle-button:hover { background: #f8f8f8; }
  
  .shelter-info-window {
      padding: 12px; background: white; border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2); min-width: 200px; max-width: 300px;
  }
  .shelter-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 6px; }
  .shelter-type {
      font-size: 12px; color: #666; background: #f0f0f0;
      padding: 2px 8px; border-radius: 12px; display: inline-block; margin-bottom: 8px;
  }
  .shelter-address { font-size: 14px; color: #555; line-height: 1.4; margin-bottom: 8px; }
  .shelter-distance { font-size: 13px; color: #a374db; font-weight: bold; margin-bottom: 8px; }
  
  .route-button {
      width: 100%; padding: 8px; background: #a374db; color: white;
      border: none; border-radius: 6px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
  }
  .route-button:hover { background: #8355c4; }
  
  .disaster-info-window { padding: 10px; min-width: 150px; }
  .disaster-title { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 5px; }
  .disaster-type { font-size: 13px; color: #ff4444; font-weight: 600; }
  
  .sido-label {
      padding: 4px 8px; background: rgba(255, 255, 255, 0.9);
      border-radius: 4px; font-size: 12px; font-weight: bold; color: #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); pointer-events: none; white-space: nowrap;
  }
  .disaster-marker {
      color: white; padding: 6px 10px; border-radius: 20px;
      font-size: 13px; font-weight: bold; box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white; white-space: nowrap;
      animation: bounceIn 0.5s ease-out;
  }
  .disaster-icon { font-size: 16px; margin-right: 4px; }
  @keyframes bounceIn {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
  }
`;

// 3. 자바스크립트 로직 (수정 완료)
const getMapScript = (location, showShelters, theme) => `
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
  
  // 📍 애니메이션 변수 삭제, 핀 ID 관리 변수
  let pinnedShelterID = null; 

  // Sido 경계선 관련 변수
  let sidoPolygons = [];
  let sidoLabels = [];
  let showSidoBoundaries = true;
  let pendingDisasterData = null;
  let cachedDisasterData = null;

  const DEFAULT_FILL_COLOR = '#00BFFF'; 
  const DEFAULT_FILL_OPACITY = 0.27;
  const DEFAULT_STROKE_COLOR = '#000000';

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

  // Sido 폴리곤 그리기
  function drawSidoPolygons() {
      if (!window.SIDO_GEOJSON) {
          console.error('❌ SIDO_GEOJSON 데이터가 없습니다');
          return;
      }
      
      const geoJson = window.SIDO_GEOJSON;
      sidoPolygons.forEach(polygon => polygon.setMap(null));
      sidoLabels.forEach(label => label.setMap(null));
      sidoPolygons = [];
      sidoLabels = [];
      
      geoJson.features.forEach((feature, index) => {
          const properties = feature.properties;
          const sidoName = feature.properties.SIG_KOR_NM;
          const geometry = feature.geometry;
          
          try {
              let paths = [];
              if (geometry.type === 'Polygon') {
                  paths = geometry.coordinates.map(ring => 
                      ring.map(coord => new naver.maps.LatLng(coord[1], coord[0]))
                  );
              } else if (geometry.type === 'MultiPolygon') {
                  paths = geometry.coordinates.map(polygon => 
                      polygon.map(ring => 
                          ring.map(coord => new naver.maps.LatLng(coord[1], coord[0]))
                      )
                  ).flat();
              }
              
              const polygon = new naver.maps.Polygon({
                  map: showSidoBoundaries ? map : null,
                  paths: paths,
                  fillColor: DEFAULT_FILL_COLOR,
                  fillOpacity: DEFAULT_FILL_OPACITY,
                  strokeColor: DEFAULT_STROKE_COLOR,
                  strokeOpacity: 0.8,
                  strokeWeight: 1,
                  clickable: true
              });  

              polygon.sidoName = sidoName;

                naver.maps.Event.addListener(polygon, 'mouseover', function() {
                    if (polygon.getOptions('fillOpacity') < 0.5) { 
                        polygon.setOptions({ fillOpacity: 0.4, strokeWeight: 2 });
                    }
                });
                
                naver.maps.Event.addListener(polygon, 'mouseout', function() {
                    if (polygon.getOptions('fillOpacity') < 0.5) {
                        polygon.setOptions({ fillOpacity: DEFAULT_FILL_OPACITY, strokeWeight: 1 });
                    }
                });

              naver.maps.Event.addListener(polygon, 'click', function() {
                    if (polygon.disasterInfo) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'disaster_marker_clicked', 
                            regionName: sidoName,
                            detail: polygon.disasterInfo
                        }));
                    }
                });

                sidoPolygons.push(polygon);
          } catch (error) {
              console.error(\`❌ \${sidoName} 폴리곤 생성 오류:\`, error);
          }
      });

      const dataToApply = pendingDisasterData || cachedDisasterData;
      if (dataToApply) {
        updateDisasterStatus(dataToApply);
        pendingDisasterData = null; 
      }
  }
  
  function calculatePolygonCenter(paths) {
      try {
          let totalLat = 0;
          let totalLng = 0;
          let count = 0;
          const ring = paths.getAt(0); 
          ring.forEach(point => {
              totalLat += point.lat();
              totalLng += point.lng();
              count++;
          });
          if (count === 0) return null;
          return new naver.maps.LatLng(totalLat / count, totalLng / count);
      } catch (error) {
          return null;
      }
  }

  function getDisasterIconHtml(type) {
      const safeType = type || '';
      const imgData = window.DISASTER_IMG_DATA || {};
      let imageUrl = imgData['기본'];

      if (safeType.includes('화재')) imageUrl = imgData['화재'];
      else if (safeType.includes('산불')) imageUrl = imgData['산불'];
      else if (safeType.includes('지진')) imageUrl = imgData['지진'];
      else if (safeType.includes('태풍')) imageUrl = imgData['태풍'];
      else if (safeType.includes('호우') || safeType.includes('홍수') || safeType.includes('비')||safeType.includes('침수')) imageUrl = imgData['비'];
      else if (safeType.includes('대설') || safeType.includes('눈')||safeType.includes('폭설')) imageUrl = imgData['눈'];
      else if (safeType.includes('폭염')) imageUrl = imgData['폭염'];
      else if (safeType.includes('한파')) imageUrl = imgData['한파'];
      else if (safeType.includes('미세먼지') || safeType.includes('황사')) imageUrl = imgData['황사'];
      else if (safeType.includes('교통')||safeType.includes('열차')||safeType.includes('철도')||safeType.includes('지하철')) imageUrl = imgData['교통'];
      else if (safeType.includes('테러') || safeType.includes('민방위')||safeType.includes('공습')) imageUrl = imgData['테러'];
      else if (safeType.includes('안개')) imageUrl = imgData['안개'];
      else if (safeType.includes('가뭄')) imageUrl = imgData['가뭄'];
      else if (safeType.includes('기타')||safeType.includes('안전')||safeType.includes('실종')) imageUrl = imgData['기타'];

      return \`
        <div class="disaster-pin" style="display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <img src="\${imageUrl}" style="width: 16px; height: 16px; object-fit: contain; filter: grayscale(100%) brightness(20%) contrast(150%); opacity: 1.0;" />
        </div>
      \`;
  }

  function getDisasterColor(type) {
    const safeType = type || '';
    if (safeType.includes('교통') || safeType.includes('열차') || safeType.includes('철도') || safeType.includes('지하철')) return '#9400D3'; 
    if (safeType.includes('지진') || safeType.includes('해일')) return '#DC143C'; 
    if (safeType.includes('화재') || safeType.includes('산불')) return '#FF4500'; 
    if (safeType.includes('테러') || safeType.includes('공습') || safeType.includes('민방위')) return '#8B0000'; 
    if (safeType.includes('폭염')) return '#FF8C00'; 
    if (safeType.includes('가뭄')) return '#8B4513'; 
    if (safeType.includes('태풍')) return '#000080'; 
    if (safeType.includes('호우') || safeType.includes('홍수') || safeType.includes('침수') || safeType.includes('비')) return '#1E90FF'; 
    if (safeType.includes('대설') || safeType.includes('폭설') || safeType.includes('눈')) return '#00CED1'; 
    if (safeType.includes('한파')) return '#008080'; 
    if (safeType.includes('미세먼지') || safeType.includes('황사')) return '#DAA520'; 
    if (safeType.includes('안개')) return '#696969'; 
    if (safeType.includes('기타') || safeType.includes('안전') || safeType.includes('실종')) return '#228B22'; 
    return '#808080'; 
  }

  function updateDisasterStatus(disasterData) {
      if (disasterData) cachedDisasterData = disasterData;
      const dataToUse = disasterData || cachedDisasterData;

      if (!sidoPolygons || sidoPolygons.length === 0) {
          pendingDisasterData = dataToUse;
          return;
      }

      sidoPolygons.forEach(p => {
          p.setOptions({
              fillColor: '#00BFFF',
              fillOpacity: 0.27,
              strokeColor: '#000000',
              strokeWeight: 1,
              zIndex: 10
          });
          p.disasterInfo = null;
          if (p.disasterMarker) {
              p.disasterMarker.setMap(null);
              p.disasterMarker = null;
          }
      });

      if (!dataToUse) return;

      let processedRegions = [];
      if (dataToUse.regions) {
          processedRegions = dataToUse.regions;
      } else if (dataToUse.body && Array.isArray(dataToUse.body)) {
          const groups = {};
          const regionKeywords = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

          dataToUse.body.forEach(item => {
              let regionKey = "기타";
              for (const r of regionKeywords) {
                  if (item.RCPTN_RGN_NM && item.RCPTN_RGN_NM.includes(r)) {
                      regionKey = r;
                      break;
                  }
              }

              if (!groups[regionKey]) {
                  groups[regionKey] = {
                      region_name: regionKey,
                      disaster_count: 0,
                      disasters: []
                  };
              }
              groups[regionKey].disaster_count++;
              groups[regionKey].disasters.push({
                  disaster_type: item.DST_SE_NM || "기타",
                  message: item.MSG_CN,
                  created_at: item.REG_YMD || item.CRT_DT
              });
          });
          processedRegions = Object.values(groups);
      }
      
      if (processedRegions.length === 0) return;

      processedRegions.forEach(region => {
          if (region.disaster_count > 0 && region.disasters.length > 0) {
              const latestDisaster = region.disasters[0];
              const warningColor = getDisasterColor(latestDisaster.disaster_type);
              const targetRegionName = region.region_name;

              sidoPolygons.forEach(polygon => {
                  if (polygon.sidoName && polygon.sidoName.includes(targetRegionName)) {
                      polygon.setOptions({
                          fillColor: warningColor,
                          fillOpacity: 0.6,
                          strokeColor: '#000000',
                          strokeWeight: 1,
                          zIndex: 100
                      });
                      polygon.disasterInfo = latestDisaster;

                      const center = calculatePolygonCenter(polygon.getPaths());
                      if (center) {
                          const iconHtml = getDisasterIconHtml(latestDisaster.disaster_type);
                          polygon.disasterMarker = new naver.maps.Marker({
                              position: center,
                              map: map,
                              icon: {
                                  content: iconHtml,
                                  anchor: new naver.maps.Point(8, 8) 
                              },
                              clickable: false, 
                              zIndex: 100 
                          });
                      }
                  }
              });
          }
      });
  }

  function toggleSidoBoundaries() {
      showSidoBoundaries = !showSidoBoundaries;
      
      sidoPolygons.forEach(polygon => {
          polygon.setMap(showSidoBoundaries ? map : null);
          if (polygon.disasterMarker) {
              polygon.disasterMarker.setMap(showSidoBoundaries ? map : null);
          }
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
        
        const container = document.createElement('div');
        container.className = 'map-control-container';
        
        const accordionHeader = document.createElement('button');
        accordionHeader.className = 'accordion-header';
        accordionHeader.innerHTML = '<span>지도 유형</span><span class="accordion-arrow">▼</span>';
        
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
        
        const boundaryToggleButton = document.createElement('button');
        boundaryToggleButton.id = 'boundary-toggle-btn';
        boundaryToggleButton.className = 'boundary-toggle-button active';
        boundaryToggleButton.textContent = '경계선 ON';
        boundaryToggleButton.onclick = toggleSidoBoundaries;
        
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
      document.querySelectorAll('.map-type-button').forEach(btn => btn.classList.remove('active'));
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
    }

    // 📍 [수정] 마커 표시 로직 강화 (핀 고정 시 무조건 표시)
    function updateMarkerVisibility() {
      if (!map) return;
      
      const currentZoom = map.getZoom();
      const shouldShow = currentZoom >= MIN_ZOOM_FOR_MARKERS;
      
      shelterMarkers.forEach((item) => {
          // 핀 고정된 마커인지 확인 (ID 비교)
          const isPinned = item.shelter.uniqueID && (item.shelter.uniqueID === pinnedShelterID);

          if (isPinned) { 
              // 📌 고정된 마커는 줌 레벨 무시하고 무조건 표시 & 맨 위로 올림
              item.marker.setMap(map); 
              item.marker.setZIndex(1000); 
          } else {
              // 일반 마커는 줌 레벨에 따라 표시/숨김
              item.marker.setMap(shouldShow ? map : null);
              item.marker.setZIndex(100); 
              
              if (!shouldShow) {
                  item.infoWindow.close();
              }
          }
      });
    }

    function handleManualMove() {
      shelterMarkers.forEach(item => item.infoWindow.close());
      isMarkerCurrentlySelected = false;
      window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'map_manual_move'
      }));
    }

    function updateShelters(shelters) {
      if (!map) return;
      
      shelterMarkers.forEach(item => {
          if (item.marker) item.marker.setMap(null);
          if (item.infoWindow) item.infoWindow.close();
      });
      shelterMarkers = []; 

      if (!shelters || shelters.length === 0) return;
      
      shelters.forEach((shelter, index) => {
        try {
          const lat = parseFloat(shelter.LAT || shelter.lat || shelter.latitude);
          const lng = parseFloat(shelter.LOT || shelter.lot || shelter.lng || shelter.longitude);
          const shelterID = shelter.RONA_DADDR || shelter.rdnmadr_nm || shelter.dtl_adres || shelter.REARE_NM || shelter.vt_acmdfclty_nm || \`\${lat}_\${lng}\`;

          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
          
          const location = new naver.maps.LatLng(lat, lng);
          
          const getShelterIcon = (type) => {
              const iconMap = {
                  '지진': { emoji: '🏢', color: '#FF6B6B' },
                  '민방위': { emoji: '🏛️', color: '#4ECDC4' },
                  '화생방': { emoji: '🛡️', color: '#95E1D3' },
                  '대피소': { emoji: '🏠', color: '#a374db' }
              };
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
              calculateDistance(userLocation.lat, userLocation.lng, lat, lng).toFixed(1) : '0.0';

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
              
              const targetZoom = Math.max(map.getZoom(), 16); 
              map.morph(location, targetZoom);
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'user_interaction_start'
              }));
          });

          shelter.uniqueID = shelterID;
          shelterMarkers.push({ marker, infoWindow, shelter });
        
        } catch (error) {
            console.error(\`❌ 마커 생성 오류:\`, error);
        }
      });
      
      // 📍 [수정] 핀 복원 로직
      if (pinnedShelterID && shelterMarkers.length > 0) {
          const newPinnedItem = shelterMarkers.find(item => item.shelter.uniqueID === pinnedShelterID);
          if (newPinnedItem) {
              const newPinnedMarker = newPinnedItem.marker;
              newPinnedMarker.setZIndex(1000); // 핀 마커 우선순위 최상위
          }
      }

      updateMarkerVisibility();
    }

  function requestRoute(lat, lng, name, shelterID) {
      console.log('📬 경로 그리기 요청:', { lat: lat, lng: lng, name: name, shelterID: shelterID });

      clearRoutePolyline();

      if (shelterID) {
          pinnedShelterID = shelterID; // ID 저장
          
          const newPinnedItem = shelterMarkers.find(item => item.shelter.uniqueID === shelterID);
          if (newPinnedItem) {
              const newPinnedMarker = newPinnedItem.marker;
              newPinnedMarker.setMap(map); // 즉시 보임 처리
              newPinnedMarker.setZIndex(1000); // 맨 위로
          }
      } else {
          pinnedShelterID = null;
      }

      // 1. 정보창 닫기
      shelterMarkers.forEach(item => item.infoWindow.close());
      isMarkerCurrentlySelected = false; 
      
      // 📍 [추가] 즉시 가시성 업데이트 호출
      updateMarkerVisibility();

      // 2. React Native로 메시지 전송
      if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'request_route',
              goalLat: lat,
              goalLng: lng,
              goalName: name
          }));
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
          const userPosition = new naver.maps.LatLng(userLocation.lat, userLocation.lng);
          
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
          
          setTimeout(() => applyTheme(currentTheme), 500);
  
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

          setTimeout(() => drawSidoPolygons(), 1000);

          naver.maps.Event.addListener(map, 'dragstart', handleManualMove);
          naver.maps.Event.addListener(map, 'touchstart', handleManualMove); 

          naver.maps.Event.addListener(map, 'idle', sendViewportBounds);
          naver.maps.Event.addListener(map, 'zoom_changed', () => setTimeout(sendViewportBounds, 100));
  
          setTimeout(() => sendMapReady(), 1000);
  
      } catch (error) {
          console.error('지도 생성 오류:', error);
      }
  }
  
  function updateLocationMarker(lat, lng, zoom) {
      if (!map) return;
      try {
          // 한국 좌표 범위 내인지 체크
          if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
              const position = new naver.maps.LatLng(lat, lng);
              userLocation = { lat, lng };
              
              // 1. 마커(보라색 핀) 위치 이동
              if (currentMarker) {
                  currentMarker.setPosition(position);
              }
              
              // 2. 줌 레벨 변경 (값이 넘어왔을 때만)
              if (zoom !== undefined && zoom !== null) {
                  map.setZoom(zoom);
              }

             if (!routePath) {
                  map.panTo(position); 
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
      if (!map) return;
      try {
          if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
              const position = new naver.maps.LatLng(lat, lng);
              userLocation = { lat, lng };
              if (currentMarker) currentMarker.setPosition(position);
              
              if (zoom !== undefined && zoom !== null) map.setZoom(zoom, true);
      
              setTimeout(() => {
                  map.panTo(position);
              }, 500);
          }
      } catch (error) {
          console.error('moveAndZoom 오류:', error);
      }
  }
  
  function zoomIn() {
      if (!map) return;
      try {
          map.setZoom(Math.min(map.getZoom() + 1, 21));
      } catch (error) {}
  }
  
  function zoomOut() {
      if (!map) return;
      try {
          map.setZoom(Math.max(map.getZoom() - 1, 6));
      } catch (error) {}
  }
    
  function drawRoute(routeData) {
      clearRoutePolyline();
      
      if (!routeData || !routeData.route || !routeData.route.trafast || !routeData.route.trafast[0]) return;
      
      try {
          const route = routeData.route.trafast[0];
          const path = route.path;
          
          const routeCoords = [];
          for (let i = 0; i < path.length; i++) {
              routeCoords.push(new naver.maps.LatLng(path[i][1], path[i][0]));
          }

          if (path.length > 0 && currentMarker) {
              const startPos = new naver.maps.LatLng(path[0][1], path[0][0]);
              currentMarker.setPosition(startPos); // 핀 이동
              
              // 내부 변수도 싱크를 맞춰줍니다.
              userLocation = { lat: path[0][1], lng: path[0][0] };
          }

          routePath = new naver.maps.Polyline({
              map: map,
              path: routeCoords,
              strokeColor: '#5347AA',
              strokeWeight: 6,
              strokeOpacity: 0.8,
              strokeLineCap: 'round',
              strokeLineJoin: 'round'
          });
          
          const bounds = new naver.maps.LatLngBounds();
          routeCoords.forEach(coord => bounds.extend(coord));
          if (currentMarker) bounds.extend(currentMarker.getPosition());

          // 📍 [핵심 수정] 경로 그릴 때 마커가 숨겨져 있다면 강제로 다시 표시
          if (pinnedShelterID) {
                const targetItem = shelterMarkers.find(item => item.shelter.uniqueID === pinnedShelterID);
                if (targetItem) {
                    targetItem.marker.setMap(map); // 👈 여기서 강제로 맵에 붙임
                    targetItem.marker.setZIndex(1000); 
                    bounds.extend(targetItem.marker.getPosition());
                }
          }

          map.setCenter(bounds.getCenter());

          const windowHeight = window.innerHeight; 
          const finalBottomPadding = Math.min(350, windowHeight * 0.4);

          map.fitBounds(bounds, {
              padding: { top: 100, right: 50, bottom: finalBottomPadding, left: 50 },
              maxZoom: 17, 
              animate: true 
          });
          
      } catch (error) {
          console.error('경로 그리기 오류:', error);
      }
  }

    // 경로 지우기 함수
    function clearRouteAndPin() {
      if (routePath) {
          routePath.setMap(null);
          routePath = null;
      }
      
      pinnedShelterID = null;
      updateMarkerVisibility();
  }

  function clearRoutePolyline() {
      if (routePath) {
          routePath.setMap(null);
          routePath = null;
      }
  }

  function hideBoundaries() {
    if (!showSidoBoundaries) return; 
    showSidoBoundaries = false;
    sidoPolygons.forEach(polygon => {
        polygon.setMap(null);
        if (polygon.disasterMarker) polygon.disasterMarker.setMap(null);
    });
    sidoLabels.forEach(label => label.setMap(null));
    const button = document.getElementById('boundary-toggle-btn');
    if (button) {
        button.classList.remove('active');
        button.textContent = '경계선 OFF';
    }
  }

  function handleMessage(data) {
      try {
          const message = JSON.parse(data);
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
              case 'updateDisasterMap':
                  updateDisasterStatus(message.payload);
                  break;
              case 'hideBoundaries':
                  hideBoundaries();
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
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'webview_ready' }));
          }
      }, 500);
  }
  
  setupMessageListeners();
  
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