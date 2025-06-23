// src/tests/api/listing.single.test.ts
import request from 'supertest';
import { prisma } from '@/services/prisma';
import { Listing, ListingImage } from '@prisma/client'; // Importuj typy dla lepszej kontroli

const API_BASE_URL = 'http://localhost:3000/api';

describe('GET /api/listing/:id (rozbudowane testy pojedynczej oferty)', () => {
  let testListing1: Listing & { images: ListingImage[] }; // Typujemy, aby mieć dostęp do pól
  let testListing2_noImages: Listing;

  const uniqueAsariId1 = Math.floor(Math.random() * -100000) - 1;
  const uniqueAsariId2 = Math.floor(Math.random() * -100000) - 100001; // Inne unikalne ID

  beforeAll(async () => {
    // Oferta 1: Z pełnymi danymi i zdjęciami
    testListing1 = await prisma.listing.create({
      data: {
        asariId: uniqueAsariId1,
        title: 'Szczegółowa Oferta Testowa 1',
        price: 750000,
        area: 120.5,
        locationCity: 'MiastoTestoweGłówne',
        locationDistrict: 'Dzielnica Centralna',
        locationStreet: 'Ulica Testowa 123',
        offerType: 'HouseSale',
        description: 'Pełny opis oferty testowej numer jeden ze zdjęciami.',
        roomsCount: 5,
        floor: 1,
        floorCount: 2,
        latitude: 50.800,
        longitude: 19.100,
        // Dodaj więcej pól, które chcesz testować
        // slug: `szczegolowa-oferta-testowa-1-${uniqueAsariId1}`, // Jeśli masz już pole slug
        images: {
          create: [
            { asariId: 201, urlNormal: 'normal_a.jpg', urlThumbnail: 'thumb_a.jpg', description: 'Główne zdjęcie domu' },
            { asariId: 202, urlNormal: 'normal_b.jpg', urlThumbnail: 'thumb_b.jpg', description: 'Widok na ogród' },
            { asariId: 203, urlNormal: 'normal_c.jpg', urlThumbnail: 'thumb_c.jpg', description: 'Wnętrze salonu' },
          ],
        },
      },
      include: { images: true }, // Od razu dołączamy zdjęcia do obiektu testListing1
    });

    // Oferta 2: Minimalne dane, bez zdjęć
    testListing2_noImages = await prisma.listing.create({
      data: {
        asariId: uniqueAsariId2,
        title: 'Minimalna Oferta Testowa 2 (bez zdjęć)',
        price: 150000,
        area: 30.0,
        offerType: 'StudioRental',
        locationCity: 'InneMiasto',
        // slug: `minimalna-oferta-testowa-2-${uniqueAsariId2}`,
      },
    });
  });

  afterAll(async () => {
    // Usuwanie w odwrotnej kolejności lub bardziej selektywnie
    await prisma.listingImage.deleteMany({ where: { listingId: testListing1.id } });
    await prisma.listing.deleteMany({
      where: {
        id: { in: [testListing1.id, testListing2_noImages.id] },
      },
    });
    await prisma.$disconnect();
  });

  it('SINGLE-001: powinien zwrócić pełne dane oferty dla poprawnego ID, w tym wszystkie zdjęcia', async () => {
    const response = await request(API_BASE_URL).get(`/listing/${testListing1.id}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    const data: Listing & { images: ListingImage[] } = response.body; // Typujemy odpowiedź

    expect(data.id).toBe(testListing1.id);
    expect(data.asariId).toBe(uniqueAsariId1);
    expect(data.title).toBe('Szczegółowa Oferta Testowa 1');
    expect(data.price).toBe(750000);
    expect(data.area).toBe(120.5);
    expect(data.locationCity).toBe('MiastoTestoweGłówne');
    expect(data.offerType).toBe('HouseSale');
    expect(data.roomsCount).toBe(5);

    expect(data).toHaveProperty('images');
    expect(Array.isArray(data.images)).toBe(true);
    expect(data.images.length).toBe(3); // Sprawdzamy, czy są 3 zdjęcia

    // Sprawdź szczegóły pierwszego zdjęcia
    const firstImage = data.images.find(img => img.asariId === 201);
    expect(firstImage).toBeDefined();
    expect(firstImage?.urlNormal).toBe('normal_a.jpg');
    expect(firstImage?.urlThumbnail).toBe('thumb_a.jpg');
    expect(firstImage?.description).toBe('Główne zdjęcie domu');
  });

  it('SINGLE-002: powinien zwrócić ofertę bez zdjęć, jeśli oferta ich nie posiada', async () => {
    const response = await request(API_BASE_URL).get(`/listing/${testListing2_noImages.id}`);

    expect(response.status).toBe(200);
    const data: Listing & { images: ListingImage[] } = response.body;

    expect(data.id).toBe(testListing2_noImages.id);
    expect(data.asariId).toBe(uniqueAsariId2);
    expect(data.title).toBe('Minimalna Oferta Testowa 2 (bez zdjęć)');
    expect(data).toHaveProperty('images');
    expect(Array.isArray(data.images)).toBe(true);
    expect(data.images.length).toBe(0); // Oczekujemy pustej tablicy zdjęć
  });


  it('SINGLE-003: powinien zwrócić status 404 dla nieistniejącego ID oferty', async () => {
    const nonExistentId = 'nieistniejace-cuid-id-1234567890abcdef'; // Bardziej przypomina CUID
    const response = await request(API_BASE_URL).get(`/listing/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Nie znaleziono oferty');
  });

  it('SINGLE-004: powinien zwrócić status 404 dla ID w potencjalnie niepoprawnym formacie CUID (Prisma może po prostu nie znaleźć)', async () => {
    const malformedId = 'to-na-pewno-nie-jest-prawidlowy-cuid-format';
    const response = await request(API_BASE_URL).get(`/listing/${malformedId}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Nie znaleziono oferty');
  });

  // Dodatkowy test: Sprawdzenie obecności wszystkich kluczowych pól, w tym tych, które mogą być null
  it('SINGLE-005: powinien zwrócić wszystkie zdefiniowane pola w modelu, nawet jeśli są null', async () => {
    // Użyjemy testListing2_noImages, która ma wiele pól null
    const response = await request(API_BASE_URL).get(`/listing/${testListing2_noImages.id}`);
    expect(response.status).toBe(200);
    const data = response.body;

    // Sprawdź obecność pól, które mogą być null w testListing2_noImages
    expect(data).toHaveProperty('description', null); // Zakładając, że nie ustawiliśmy
    expect(data).toHaveProperty('locationDistrict', null);
    expect(data).toHaveProperty('locationStreet', null);
    expect(data).toHaveProperty('roomsCount', null);
    expect(data).toHaveProperty('floor', null);
    expect(data).toHaveProperty('floorCount', null);
    expect(data).toHaveProperty('latitude', null);
    expect(data).toHaveProperty('longitude', null);
    // ... i tak dalej dla innych opcjonalnych pól
  });

  // Testowanie pól, które powinny być zawsze obecne (non-nullable w Prisma, z wyjątkiem @id, @default, @updatedAt)
  it('SINGLE-006: powinien zawsze zwracać kluczowe, nie-nullujące się pola (na podstawie modelu)', async () => {
    const response = await request(API_BASE_URL).get(`/listing/${testListing1.id}`);
    expect(response.status).toBe(200);
    const data = response.body;

    expect(data.id).toBeDefined();
    expect(data.asariId).toBeDefined();
    // Zakładając, że 'offerType' jest obowiązkowe w Twoim modelu (String, nie String?)
    expect(data.offerType).toBeDefined();
    // expect(data.slug).toBeDefined(); // Jeśli slug jest obowiązkowy
    expect(data.dbCreatedAt).toBeDefined(); // Pole Prisma @default(now())
    expect(data.dbUpdatedAt).toBeDefined(); // Pole Prisma @updatedAt
  });
});