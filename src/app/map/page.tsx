'use client';

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

// Definicja typów
type ApiListing = {
  id: string;
  title: string | null;
  offerType: string | null;
  latitude: number | null;
  longitude: number | null;
};

type MapPoint = {
  id: string;
  name: string;
  category: string;
  position: {
    lat: number;
    lng: number;
  };
};

// --- KROK 1: Definiujemy mapowanie kolorów ---
// Możesz tu użyć dowolnych kolorów w formacie HEX, RGB itp.
const CATEGORY_COLORS: { [key: string]: string } = {
  apartmentsale: '#EA4335', // Czerwony dla mieszkań na sprzedaż
  apartmentrental: '#FBBC04', // Żółty dla mieszkań na wynajem
  housesale: '#34A853', // Zielony dla domów na sprzedaż
  houserental: '#137333', // Ciemniejszy zielony dla domów na wynajem
  lotsale: '#4285F4', // Niebieski dla działek
  // Dodaj więcej kategorii, jeśli potrzebujesz (np. 'commercialsale')
  unknown: '#9AA0A6', // Szary dla nieznanych
};

// --- KROK 2: Tworzymy prosty komponent dla niestandardowej ikony markera ---
const MarkerIcon = ({ color }: { color: string }) => (
  <div
    style={{
      width: '24px',
      height: '24px',
      backgroundColor: color,
      borderRadius: '50%',
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transform: 'translate(-50%, -50%)',
    }}
  />
);

const MapPage = () => {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAndTransformListings() {
      try {
        const response = await fetch('/api/listing?limit=200');
        const apiResponse = await response.json();
        const listings: ApiListing[] = apiResponse.data;

        const transformedPoints = listings
          .filter(
            listing => listing.latitude !== null && listing.longitude !== null
          )
          .map(listing => ({
            id: listing.id,
            name: listing.title || 'Brak tytułu',
            // Zapisujemy offerType w małych literach, aby pasował do kluczy w CATEGORY_COLORS
            category: listing.offerType?.toLowerCase() || 'unknown',
            position: {
              lat: listing.latitude!,
              lng: listing.longitude!,
            },
          }));

        setPoints(transformedPoints);
      } catch (error) {
        console.error('Błąd podczas pobierania danych dla mapy:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndTransformListings();
  }, []);

  if (isLoading) {
    return <div>Ładowanie mapy i ofert...</div>;
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!}
        style={{ width: '100vw', height: '100vh' }}
        defaultCenter={{ lat: 50.8115, lng: 19.1203 }}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
      >
        {points.map(point => {
          // --- KROK 3: Przypisujemy kolor na podstawie kategorii ---
          const color =
            CATEGORY_COLORS[point.category] || CATEGORY_COLORS.unknown;

          return (
            <AdvancedMarker
              key={point.id}
              position={point.position}
              title={point.name}
            >
              <MarkerIcon color={color} />
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
};

export default MapPage;
