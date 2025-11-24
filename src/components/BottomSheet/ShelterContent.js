// src/components/BottomSheet/ShelterContent.js
import React from 'react';
import ShelterContainer from '../Shelter/ShelterContainer';

export default function ShelterContent({ isVisible, mapRef }) {
  if (!isVisible) return null;
  
  return <ShelterContainer mapRef={mapRef} />;
}