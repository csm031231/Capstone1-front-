// src/constants/colors.js
export const COLORS = {
    // 🎨 새로운 보라색 메인 테마 (#a374db)
    primary: '#a374db',           // 메인 보라색
    primaryDark: '#8355c4',       // 어두운 보라색
    primaryLight: '#c199ed',      // 밝은 보라색
    
    // 강조 색상
    accent: '#b98ef0',            // 강조 보라색
    accentDark: '#9664d8',        // 어두운 강조색
    
    // 배경색
    background: '#F7F4FB',        // 연한 보라빛 배경
    surface: '#FFFFFF',           // 흰색 표면
    surfaceDark: '#2D2438',       // 어두운 표면 (다크모드용)
    
    // 텍스트 색상
    textPrimary: '#2D2438',       // 주요 텍스트
    textSecondary: '#6B5B7B',     // 보조 텍스트
    textLight: '#A08BB0',         // 연한 텍스트
    textWhite: '#FFFFFF',         // 흰색 텍스트
    
    // 상태 색상
    success: '#4CAF50',           // 성공
    warning: '#FF9800',           // 경고
    error: '#F44336',             // 에러
    info: '#2196F3',              // 정보
    
    // 테두리/구분선
    border: '#E8DDF5',            // 연한 보라빛 테두리
    divider: '#D8C9E8',           // 구분선
    
    // 그림자
    shadow: 'rgba(163, 116, 219, 0.3)',  // 보라빛 그림자
    
    // 그라데이션용
    gradientStart: '#b98ef0',
    gradientEnd: '#8355c4',
    
    // 오버레이
    overlay: 'rgba(45, 36, 56, 0.5)',   // 어두운 오버레이
    overlayLight: 'rgba(163, 116, 219, 0.1)',  // 밝은 오버레이
  };
  
  // 다크모드 색상 (선택사항)
  export const DARK_COLORS = {
    primary: '#a374db',
    primaryDark: '#8355c4',
    primaryLight: '#c199ed',
    
    background: '#1A1522',
    surface: '#2D2438',
    surfaceDark: '#1A1522',
    
    textPrimary: '#E8DDF5',
    textSecondary: '#C199ED',
    textLight: '#A08BB0',
    
    border: '#3D3448',
    divider: '#2D2438',
    
    shadow: 'rgba(0, 0, 0, 0.5)',
  };
  
  export default COLORS;