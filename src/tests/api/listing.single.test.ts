import request from 'supertest';
import { prisma } from '@/services/prisma';
import { Listing, ListingImage, AsariStatus } from '@prisma/client'; // Upewnij się, że AsariStatus jest importowane

const API_BASE_URL = 'http://localhost:3000/api';

describe('GET /api/listing/:id (rozbudowane testy pojedynczej oferty)', () => {
  let testListing1: Listing & { images: ListingImage[] };
  let testListing2_noImages: Listing;

  // Generowanie unikalnych ID dla testów, aby uniknąć konfliktów
  const uniqueAsariId1 = Math.floor(Math.random() * -100000) - 1;
  const uniqueAsariId2 = Math.floor(Math.random() * -100000) - 100001;

  // Tworzenie danych testowych przed uruchomieniem wszystkich testów
  beforeAll(async () => {
    // Oferta 1: Z pełnymi danymi, zdjęciami i statusem ACTIVE
    testListing1 = await prisma.listing.create({
      data: {
        asariId: uniqueAsariId1,
        asariStatus: AsariStatus.Active, // <-- KLUCZOWA POPRAWKA
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
        latitude: 50.8,
        longitude: 19.1,
        images: {
          create: [
            {
              asariId: 201,
              urlNormal: 'normal_a.jpg',
              urlThumbnail: 'thumb_a.jpg',
              description: 'Główne zdjęcie domu',
              order: 1,
            },
            {
              asariId: 202,
              urlNormal: 'normal_b.jpg',
              urlThumbnail: 'thumb_b.jpg',
              description: 'Widok na ogród',
              order: 2,
            },
            {
              asariId: 203,
              urlNormal: 'normal_c.jpg',
              urlThumbnail: 'thumb_c.jpg',
              description: 'Wnętrze salonu',
              order: 3,
            },
          ],
        },
      },
      include: { images: true },
    });

    // Oferta 2: Minimalne dane, bez zdjęć, ale również ze statusem ACTIVE
    testListing2_noImages = await prisma.listing.create({
      data: {
        asariId: uniqueAsariId2,
        asariStatus: AsariStatus.Active, // <-- KLUCZOWA POPRAWKA
        title: 'Minimalna Oferta Testowa 2 (bez zdjęć)',
        price: 150000,
        area: 30.0,
        offerType: 'StudioRental',
        locationCity: 'InneMiasto',
      },
    });
  });

  // Czyszczenie bazy danych po zakończeniu wszystkich testów
  afterAll(async () => {
    // Najpierw usuwamy rekordy zależne (obrazy)
    if (testListing1 && testListing1.id) {
      await prisma.listingImage.deleteMany({
        where: { listingId: testListing1.id },
      });
    }
    // Następnie usuwamy główne rekordy (oferty)
    await prisma.listing.deleteMany({
      where: {
        id: {
          in: [testListing1?.id, testListing2_noImages?.id].filter(
            Boolean
          ) as string[],
        },
      },
    });
    await prisma.$disconnect();
  });

  it('SINGLE-001: powinien zwrócić dane oferty dla poprawnego ID, w tym wszystkie zdjęcia', async () => {
    const response = await request(API_BASE_URL).get(
      `/listing/${testListing1.id}`
    );

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    const data = response.body;

    expect(data.id).toBe(testListing1.id);
    expect(data.asariId).toBe(uniqueAsariId1);
    expect(data.title).toBe('Szczegółowa Oferta Testowa 1');
    expect(data.price).toBe(750000);
    expect(data.images.length).toBe(3);

    const firstImage = data.images.find((img: any) => img.asariId === 201);
    expect(firstImage).toBeDefined();
    expect(firstImage?.description).toBe('Główne zdjęcie domu');
  });

  it('SINGLE-002: powinien zwrócić ofertę bez zdjęć, jeśli oferta ich nie posiada', async () => {
    const response = await request(API_BASE_URL).get(
      `/listing/${testListing2_noImages.id}`
    );

    expect(response.status).toBe(200);
    const data = response.body;

    expect(data.id).toBe(testListing2_noImages.id);
    expect(data.title).toBe('Minimalna Oferta Testowa 2 (bez zdjęć)');
    expect(data.images.length).toBe(0);
  });

  it('SINGLE-003: powinien zwrócić status 404 dla nieistniejącego ID oferty', async () => {
    const nonExistentId = 'nieistniejace-cuid-id-1234567890abcdef';
    const response = await request(API_BASE_URL).get(
      `/listing/${nonExistentId}`
    );

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Nie znaleziono oferty');
  });

  it('SINGLE-004: powinien zwrócić status 404 dla ID w potencjalnie niepoprawnym formacie CUID', async () => {
    const malformedId = 'to-na-pewno-nie-jest-prawidlowy-cuid-format';
    const response = await request(API_BASE_URL).get(`/listing/${malformedId}`);

    // Oczekujemy 400 lub 404, w zależności od obsługi błędu w API
    expect([400, 404]).toContain(response.status);
  });

  it('SINGLE-005: powinien zwrócić wszystkie zdefiniowane pola w modelu, nawet jeśli są null', async () => {
    const response = await request(API_BASE_URL).get(
      `/listing/${testListing2_noImages.id}`
    );
    expect(response.status).toBe(200);
    const data = response.body;

    expect(data).toHaveProperty('description', null);
    expect(data).toHaveProperty('locationDistrict', null);
    expect(data).toHaveProperty('roomsCount', null);
  });

  it('SINGLE-006: powinien zawsze zwracać kluczowe, nie-nullujące się pola (na podstawie modelu)', async () => {
    const response = await request(API_BASE_URL).get(
      `/listing/${testListing1.id}`
    );
    expect(response.status).toBe(200);
    const data = response.body;

    expect(data.id).toBeDefined();
    expect(data.asariId).toBeDefined();
    expect(data.offerType).toBeDefined();
    expect(data.dbCreatedAt).toBeDefined();
    expect(data.dbUpdatedAt).toBeDefined();
  });
});
