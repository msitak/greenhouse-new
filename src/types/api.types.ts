// src/types/api.types.ts

import { Listing, ListingImage, AsariStatus } from '@prisma/client';

type WithStringDates<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

/**
 * Typ dla pojedynczego obiektu zdjęcia w odpowiedzi z API.
 * 
 * POPRAWKA: Jawnie wybieramy (Pick) tylko te pola z ListingImage,
 * które faktycznie chcemy zwracać w API, a następnie konwertujemy daty.
 * Pomijamy pola, które są niepotrzebne na frontendzie, jak `listingId`.
 */
export type ListingImageApiResponse = WithStringDates<
  Pick<
    ListingImage,
    'id' | 'asariId' | 'urlNormal' | 'urlThumbnail' | 'description' | 'order' | 'dbCreatedAt' | 'dbUpdatedAt'
  >
>;

/**
 * Główny typ dla odpowiedzi API dotyczącej pojedynczej oferty.
 *
 * Logika pozostaje ta sama: bierzemy typ Listing, konwertujemy daty,
 * a następnie nadpisujemy pole `images` naszą nową, bardziej precyzyjną definicją.
 */
export type ListingApiResponse = Omit<WithStringDates<Listing>, 'images'> & {
  images: ListingImageApiResponse[];
};