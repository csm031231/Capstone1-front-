export default {
  expo: {
    name: "my_map",
    slug: "my_map",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    
    // 환경변수를 extra에 추가
    extra: {
      naverMapClientId: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID,
    },
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.krlc.my_map",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.krlc.my_map",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ],
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "이 앱은 재해 정보를 제공하기 위해 위치 권한이 필요합니다."
        }
      ]
    ]
  }
};