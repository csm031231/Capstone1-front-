// src/components/Shelter/ShelterItem.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator } from 'react-native';
import { utils, getDirections } from '../../services/ApiService';

export default function ShelterItem({ shelter, currentLocation, onPress, mapRef }) {
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const getTypeIcon = (type) => {
    if (type?.includes('학교') || type?.includes('교육')) return '🏫';
    if (type?.includes('체육관') || type?.includes('운동') || type?.includes('체육')) return '🏟️';
    if (type?.includes('문화') || type?.includes('공연')) return '🎭';
    if (type?.includes('종교') || type?.includes('교회') || type?.includes('성당')) return '⛪';
    if (type?.includes('공공') || type?.includes('청사')) return '🏢';
    return '🏠';
  };
  
  // 🗺️ 네이버 지도 앱으로 길찾기
  const openNaverMap = () => {
    if (!currentLocation || !shelter.latitude || !shelter.longitude) {
      Alert.alert('알림', '위치 정보를 확인할 수 없습니다.');
      return;
    }

    // 네이버 지도 앱 URL 스킴
    const naverMapUrl = `nmap://route/car?slat=${currentLocation.latitude}&slng=${currentLocation.longitude}&sname=현재위치&dlat=${shelter.latitude}&dlng=${shelter.longitude}&dname=${encodeURIComponent(shelter.REARE_NM)}&appname=com.disasteralert`;
    
    console.log('🗺️ 네이버 지도 앱 열기 시도');
    
    Linking.canOpenURL(naverMapUrl)
      .then(supported => {
        if (supported) {
          console.log('✅ 네이버 지도 앱 열기 성공');
          return Linking.openURL(naverMapUrl);
        } else {
          console.warn('⚠️ 네이버 지도 앱이 설치되어 있지 않습니다');
          Alert.alert('알림', '네이버 지도 앱이 설치되어 있지 않습니다.');
        }
      })
      .catch(err => {
        console.error('❌ 네이버 지도 열기 오류:', err);
        Alert.alert('오류', '네이버 지도를 열 수 없습니다.');
      });
  };
  
  // 🆕 백엔드 API + 지도에 경로 그리기 (개선된 버전)
  const showRouteOnMap = async () => {
    // 1. 현재 위치 확인
    if (!currentLocation) {
      Alert.alert('알림', '현재 위치를 확인할 수 없습니다.');
      return;
    }

    // 2. 지도 ref 확인
    if (!mapRef || !mapRef.current) {
      Alert.alert('알림', '지도를 사용할 수 없습니다.');
      return;
    }

    // 3. 대피소 좌표 확인
    if (!shelter.latitude || !shelter.longitude) {
      Alert.alert('알림', '대피소의 위치 정보가 없습니다.');
      return;
    }

    setIsLoadingRoute(true);

    try {
      console.log('🛣️ 경로 검색 시작:', {
        from: { lat: currentLocation.latitude, lng: currentLocation.longitude },
        to: { lat: shelter.latitude, lng: shelter.longitude },
        shelterName: shelter.REARE_NM
      });

      // 4. 백엔드 API로 경로 정보 가져오기
      const routeData = await getDirections(
        currentLocation.longitude,
        currentLocation.latitude,
        shelter.longitude,
        shelter.latitude
      );

      console.log('✅ 경로 데이터 수신 성공');
      console.log('📊 선택된 경로 옵션:', routeData.selectedOption);

      // 5. 경로 데이터 유효성 재확인 (ApiService에서 이미 검증했지만 안전장치)
      if (!routeData || !routeData.route || !routeData.route.trafast) {
        throw new Error('경로 데이터가 올바르지 않습니다');
      }

      const route = routeData.route.trafast[0];
      const summary = route.summary;
      
      // 6. 경로 정보 로그
      console.log('📊 경로 정보:', {
        distance: summary.distance,
        duration: summary.duration,
        tollFare: summary.tollFare,
        pathPoints: route.path?.length / 2 || 0
      });
      
      // 7. 지도에 경로 그리기
      console.log('🗺️ 지도에 경로 그리기 시작');
      mapRef.current.drawRoute(routeData);
      console.log('✅ 지도에 경로 그리기 완료');
      
      // 8. 경로 정보를 Alert로 표시
      Alert.alert(
        `📍 ${shelter.REARE_NM} 경로`,
        `거리: ${utils.formatDistance(summary.distance)}\n소요시간: ${utils.formatDuration(summary.duration)}\n통행료: ${summary.tollFare > 0 ? summary.tollFare.toLocaleString() + '원' : '무료'}`,
        [
          {
            text: '확인',
            style: 'cancel',
          },
        ]
      );

      console.log('✅ 경로 표시 완료');
      
    } catch (error) {
      console.error('❌ 길찾기 오류:', error);
      console.error('❌ 오류 메시지:', error.message);
      
      // 에러 타입별 메시지 분류
      let errorTitle = '길찾기 오류';
      let errorMessage = '경로를 표시할 수 없습니다.';
      
      if (error.message.includes('시간 초과')) {
        errorTitle = '연결 시간 초과';
        errorMessage = '서버 응답 시간이 초과되었습니다.\n잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('HTTP error')) {
        errorTitle = '서버 오류';
        errorMessage = '서버에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('네이버 API 오류')) {
        errorTitle = '경로 찾기 실패';
        errorMessage = error.message.replace('네이버 API 오류: ', '') + '\n\n좌표가 올바른지 확인해주세요.';
      } else if (error.message.includes('경로 데이터')) {
        errorTitle = '데이터 오류';
        errorMessage = '경로 데이터를 처리할 수 없습니다.';
      } else if (error.message.includes('경로를 찾을 수 없습니다')) {
        errorTitle = '경로 없음';
        errorMessage = '해당 위치까지의 경로를 찾을 수 없습니다.';
      }
      
      // 에러 발생 시 네이버 지도 앱으로 이동 제안
      Alert.alert(
        errorTitle,
        `${errorMessage}\n\n네이버 지도 앱으로 이동하시겠습니까?`,
        [
          {
            text: '네',
            onPress: () => openNaverMap(),
          },
          {
            text: '아니오',
            style: 'cancel',
          },
        ]
      );
      
    } finally {
      setIsLoadingRoute(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress && onPress(shelter)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{getTypeIcon(shelter.SHLT_SE_NM)}</Text>
        <View style={styles.titleContent}>
          <Text style={styles.name} numberOfLines={1}>
            {shelter.REARE_NM}
          </Text>
          <Text style={styles.type}>{shelter.SHLT_SE_NM}</Text>
        </View>
      </View>
      
      <Text style={styles.address} numberOfLines={2}>
        {shelter.RONA_DADDR}
      </Text>
      
      <View style={styles.info}>
          <Text style={styles.distance}>
           거리: {utils.formatDistance(shelter.distance)}
          </Text>
      </View>

      {shelter.facilities && shelter.facilities.length > 0 && (
        <View style={styles.facilitiesContainer}>
          <Text style={styles.facilitiesTitle}>편의시설:</Text>
          <View style={styles.facilitiesList}>
            {shelter.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityTag}>
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.navigationButton, isLoadingRoute && styles.navigationButtonDisabled]}
          onPress={showRouteOnMap}
          disabled={isLoadingRoute}
        >
          {isLoadingRoute ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.navigationButtonText}>길찾기</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#666',
  },
  distanceContainer: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  info: {
    marginBottom: 12,
  },
  capacity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: '#333',
  },
  facilitiesContainer: {
    marginBottom: 16,
  },
  facilitiesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  navigationButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  navigationButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});