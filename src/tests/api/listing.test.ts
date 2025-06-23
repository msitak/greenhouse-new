// tests/api/listing.list.test.ts
import request from 'supertest';

const API_BASE_URL = 'http://localhost:3000/api';

describe('GET /api/listing (rozbudowane testy listy ofert)', () => {
  // --- Testy Podstawowe ---
  it('POW-001: powinien zwrócić domyślną listę ofert z poprawną paginacją i strukturą', async () => {
    const response = await request(API_BASE_URL).get('/listing');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);

    if (response.body.pagination) {
      expect(response.body.pagination.pageSize).toBe(10); // Domyślny rozmiar strony
      expect(response.body.pagination.currentPage).toBe(1); // Domyślna strona
      expect(response.body.pagination.totalItems).toBeGreaterThanOrEqual(0);
      expect(response.body.pagination.totalPages).toBe(Math.ceil(response.body.pagination.totalItems / 10));
    }

    response.body.data.forEach((item: any) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('asariId');
      // Możesz dodać więcej asercji na temat struktury każdego elementu oferty
      expect(item).toHaveProperty('images');
      expect(Array.isArray(item.images)).toBe(true);
      if (item.images.length > 0) {
        expect(item.images[0]).toHaveProperty('urlThumbnail');
        expect(typeof item.images[0].urlThumbnail).toBe('string');
      }
    });
  });

  // --- Testy Paginacji ---
  describe('Paginacja', () => {
    it('PAG-001: powinien poprawnie obsługiwać parametry page i limit', async () => {
      const response = await request(API_BASE_URL).get('/listing?page=2&limit=3');
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
      if (response.body.pagination) {
        expect(response.body.pagination.currentPage).toBe(2);
        expect(response.body.pagination.pageSize).toBe(3);
      }
    });

    it('PAG-002: powinien obsłużyć limit większy niż liczba wszystkich ofert', async () => {
        const countResponse = await request(API_BASE_URL).get('/listing?limit=1'); // Pobierz jedną, aby dostać totalItems
        const totalItems = countResponse.body.pagination.totalItems;

        const response = await request(API_BASE_URL).get(`/listing?limit=${totalItems + 5}`);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(totalItems);
        if (response.body.pagination) {
            expect(response.body.pagination.pageSize).toBe(totalItems + 5);
            expect(response.body.pagination.totalPages).toBe(1);
        }
    });

    it('PAG-003: powinien obsłużyć żądanie strony poza zakresem (zwrócić pustą listę)', async () => {
      const response = await request(API_BASE_URL).get('/listing?page=9999'); // Zakładając, że nie masz tylu stron
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      if (response.body.pagination) {
        expect(response.body.pagination.currentPage).toBe(9999);
      }
    });

    it('PAG-004: powinien obsłużyć niepoprawne (nieliczbowe) wartości page i limit, używając domyślnych', async () => {
      const response = await request(API_BASE_URL).get('/listing?page=abc&limit=xyz');
      expect(response.status).toBe(200);
      if (response.body.pagination) {
        expect(response.body.pagination.currentPage).toBe(1); // Powinno wrócić do domyślnej
        expect(response.body.pagination.pageSize).toBe(10); // Powinno wrócić do domyślnej
      }
    });
     it('PAG-005: powinien obsłużyć ujemne wartości page i limit, używając bezpiecznych wartości (np. 1)', async () => {
      const response = await request(API_BASE_URL).get('/listing?page=-1&limit=-5');
      expect(response.status).toBe(200);
      if (response.body.pagination) {
        expect(response.body.pagination.currentPage).toBe(1);
        expect(response.body.pagination.pageSize).toBe(10); // Lub inna bezpieczna wartość >0, którą ustawiłeś
      }
    });
  });

  // --- Testy Sortowania ---
  describe('Sortowanie', () => {
    const sortableFields: { field: string, type: 'string' | 'number' | 'date' }[] = [
      { field: 'price', type: 'number' },
      { field: 'pricePerM2', type: 'number' },
      { field: 'area', type: 'number' },
      { field: 'roomsCount', type: 'number'},
      { field: 'createdAtSystem', type: 'date' }, // Domyślne sortowanie
    ];

    sortableFields.forEach(sortInfo => {
      ['asc', 'desc'].forEach(order => {
        it(`SORT-001: powinien sortować po ${sortInfo.field} ${order}`, async () => {
          const response = await request(API_BASE_URL).get(`/listing?sortBy=${sortInfo.field}&order=${order}&limit=5`);
          expect(response.status).toBe(200);
          const items = response.body.data;
          if (items.length > 1) {
            for (let i = 0; i < items.length - 1; i++) {
              const val1 = items[i][sortInfo.field];
              const val2 = items[i + 1][sortInfo.field];

              // Pomijamy porównanie, jeśli któreś z pól jest null (szczególnie dla opcjonalnych pól liczbowych)
              if (val1 === null || val2 === null) continue;

              if (sortInfo.type === 'date') { // Dla dat konwertujemy na obiekty Date
                const date1 = new Date(val1);
                const date2 = new Date(val2);
                if (order === 'asc') {
                  expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
                } else {
                  expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
                }
              } else { // Dla stringów i liczb
                if (order === 'asc') {
                  expect(val1).toBeLessThanOrEqual(val2);
                } else {
                  expect(val1).toBeGreaterThanOrEqual(val2);
                }
              }
            }
          }
        });
      });
    });

    it('SORT-002: powinien użyć domyślnego sortowania, gdy sortBy jest niepoprawne', async () => {
        const responseDefault = await request(API_BASE_URL).get('/listing?limit=5'); // createdAtSystem desc
        const responseInvalid = await request(API_BASE_URL).get('/listing?sortBy=invalidField&limit=5');

        expect(responseInvalid.status).toBe(200);
        // Porównaj ID pierwszych elementów - powinny być takie same, jeśli sortowanie jest identyczne
        if (responseDefault.body.data.length > 0 && responseInvalid.body.data.length > 0) {
            expect(responseInvalid.body.data[0].id).toEqual(responseDefault.body.data[0].id);
        }
        // Bardziej rygorystyczne byłoby porównanie całej tablicy ID
    });
  });


  // --- Testy Filtrowania ---
  describe('Filtrowanie', () => {
    // Załóżmy, że masz w bazie oferty pasujące do tych kryteriów
    const cityForTest = 'Częstochowa'; // Zmień na miasto, które masz w danych
    const offerTypeForTest = 'ApartmentSale'; // Zmień na typ, który masz
    const minPriceForTest = 200000;
    const maxPriceForTest = 400000;
    const minRoomsForTest = 2;
    const maxRoomsForTest = 3;

    it('FILT-001: powinien filtrować po mieście', async () => {
        const response = await request(API_BASE_URL).get(`/listing?city=${cityForTest}`);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0); // Upewniamy się, że data jest tablicą
      
        response.body.data.forEach((item: any) => {
          expect(item.locationCity?.toLowerCase()).toContain(cityForTest.toLowerCase());
        });
      
        // Sprawdź, czy totalItems jest co najmniej tak duże jak liczba zwróconych ofert
        // i że jest większe od 0, jeśli faktycznie zwrócono jakieś dane.
        if (response.body.pagination) {
          expect(response.body.pagination.totalItems).toBeGreaterThanOrEqual(response.body.data.length);
          if (response.body.data.length > 0) {
            expect(response.body.pagination.totalItems).toBeGreaterThan(0);
          }
          // Jeśli nie ma wyników, totalItems powinno być 0
          if (response.body.data.length === 0) {
              expect(response.body.pagination.totalItems).toBe(0);
          }
        }
    });

    it('FILT-002: powinien filtrować po typie oferty', async () => {
      const response = await request(API_BASE_URL).get(`/listing?offerType=${offerTypeForTest}`);
      expect(response.status).toBe(200);
      response.body.data.forEach((item: any) => {
        expect(item.offerType).toEqual(offerTypeForTest);
      });
    });

    it('FILT-003: powinien filtrować po zakresie cenowym', async () => {
      const response = await request(API_BASE_URL).get(`/listing?priceMin=${minPriceForTest}&priceMax=${maxPriceForTest}`);
      expect(response.status).toBe(200);
      response.body.data.forEach((item: any) => {
        expect(item.price).toBeGreaterThanOrEqual(minPriceForTest);
        expect(item.price).toBeLessThanOrEqual(maxPriceForTest);
      });
    });

    it('FILT-004: powinien filtrować po zakresie liczby pokoi', async () => {
        const response = await request(API_BASE_URL).get(`/listing?roomsMin=${minRoomsForTest}&roomsMax=${maxRoomsForTest}`);
        expect(response.status).toBe(200);
        response.body.data.forEach((item: any) => {
          if (item.roomsCount !== null) { // roomsCount może być null
            expect(item.roomsCount).toBeGreaterThanOrEqual(minRoomsForTest);
            expect(item.roomsCount).toBeLessThanOrEqual(maxRoomsForTest);
          }
        });
      });


    it('FILT-005: powinien poprawnie łączyć wiele filtrów', async () => {
      const response = await request(API_BASE_URL)
        .get(`/listing?city=${cityForTest}&offerType=${offerTypeForTest}&priceMin=${minPriceForTest}&roomsMin=${minRoomsForTest}`);
      expect(response.status).toBe(200);
      response.body.data.forEach((item: any) => {
        expect(item.locationCity?.toLowerCase()).toContain(cityForTest.toLowerCase());
        expect(item.offerType).toEqual(offerTypeForTest);
        expect(item.price).toBeGreaterThanOrEqual(minPriceForTest);
        if (item.roomsCount !== null) {
            expect(item.roomsCount).toBeGreaterThanOrEqual(minRoomsForTest);
        }
      });
    });

    it('FILT-006: powinien zwrócić pustą listę, gdy filtry nie pasują do żadnej oferty', async () => {
      const response = await request(API_BASE_URL).get('/listing?city=MiastoKtoregoNieMaNaPewno&priceMin=999999999');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      if (response.body.pagination) {
        expect(response.body.pagination.totalItems).toBe(0);
        expect(response.body.pagination.totalPages).toBe(0); // Lub 1 jeśli tak jest liczone (ceil(0/limit))
      }
    });
  });

  // --- Testy Przypadków Brzegowych / Niepoprawnych Danych ---
  describe('Przypadki brzegowe', () => {
    it('EDGE-001: powinien obsłużyć bardzo długi string jako parametr city', async () => {
        const longCity = 'a'.repeat(500);
        const response = await request(API_BASE_URL).get(`/listing?city=${longCity}`);
        expect(response.status).toBe(200); // Zakładamy, że API sobie z tym radzi (np. nie znajduje nic)
        expect(response.body.data).toEqual([]);
    });

    // Można dodać więcej testów, np. dla parametrów, które nie są oczekiwane
    it('EDGE-002: powinien zignorować nieznane parametry zapytania', async () => {
        const responseValid = await request(API_BASE_URL).get('/listing?limit=2');
        const responseWithUnknown = await request(API_BASE_URL).get('/listing?limit=2&nieznanyParametr=wartosc');

        expect(responseWithUnknown.status).toBe(200);
        // Wyniki powinny być takie same, jak bez nieznanego parametru
        expect(responseWithUnknown.body.data).toEqual(responseValid.body.data);
        expect(responseWithUnknown.body.pagination).toEqual(responseValid.body.pagination);
    });
  });
});