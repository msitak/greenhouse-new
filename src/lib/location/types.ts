// lib/location/types.ts
export type BBox = {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
};

export type LocationValue = {
  label: string;
  placeId: string;
  lat: number;
  lng: number;
  viewport?: BBox;
};
