// src/types/api.types.ts

import { Listing, ListingImage } from '@/generated/client';

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
    | 'id'
    | 'asariId'
    | 'urlNormal'
    | 'urlThumbnail'
    | 'urlOriginal'
    | 'description'
    | 'order'
    | 'isScheme'
    | 'dbCreatedAt'
    | 'dbUpdatedAt'
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

/**
 * Typ dla informacji o agencie z odpowiedzi API
 */
export type AgentInfo = {
  asariId: number;
  name: string;
  surname: string;
  fullName: string;
  slug: string;
  phone: string | null;
  email: string | null;
  imagePath: string | null;
};

/**
 * Typ dla artykułu z Sanity (uproszczony)
 */
export type AgentArticle = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string | null;
  coverImage?: {
    url: string;
    alt: string;
  };
};

/**
 * Główny typ dla odpowiedzi API dotyczącej strony agenta
 */
export type AgentPageApiResponse = {
  agent: AgentInfo;
  listings: ListingApiResponse[];
  articles: AgentArticle[];
};
