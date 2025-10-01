// src/components/BottomSheet/NewsContent.js
import React from 'react';
import NewsContainer from '../News/NewsContainer';

export default function NewsContent({ isVisible, currentRegion }) {
  if (!isVisible) return null;
  
  return <NewsContainer />;
}