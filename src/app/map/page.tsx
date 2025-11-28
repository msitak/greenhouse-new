'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => <Skeleton className='w-screen h-screen' />,
});

const MapPage = () => {
  return <MapComponent />;
};

export default MapPage;
