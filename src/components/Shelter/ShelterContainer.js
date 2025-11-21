// src/components/Shelter/ShelterContainer.js
import React from 'react';
import { useAppState } from '../../store/AppContext';
import ShelterPresentation from './ShelterPresentation';

export default function ShelterContainer({ mapRef }) {
  const { shelters, loading, error, currentLocation } = useAppState();

  // ✅ 데이터 로드 로직 없음! 그냥 표시만!
  return (
    <ShelterPresentation
      shelters={shelters}
      loading={loading.shelters}
      error={error}
      currentLocation={currentLocation}
      mapRef={mapRef}
    />
  );
}