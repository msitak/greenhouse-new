# 🗺️ Roadmapa Rozwoju: Nowa Strona Green House

> **⭐ Gwiazda Polarna:** Budujemy **Zaufanie**, dając **Prostotę** i **Bezpieczeństwo**.
> *Każde zadanie i każda nowa "błyskotka" musi przejść test tego jednego zdania.*

---

## ✅ FAZA 0: FUNDAMENTY STRATEGICZNE
*Cel: Zdefiniowanie "DLACZEGO" i "JAK" działamy, zanim napiszemy pierwszą linijkę kodu produkcyjnego.*

- [x] **Persony Klientów:** Zdefiniowane i przeanalizowane (Sprzedający, Kupujący Kredytowy, Kupujący Gotówkowy, Inwestor).
- [x] **USP (Unikalna Propozycja Sprzedaży):** Zidentyfikowane kluczowe filary: Bezpieczeństwo, Ekspertyza oparta na danych, Partnerskie doradztwo.
- [ ] **Architektura Informacji i Makiety (Hi-Fi):**
  - [ ] 🗺️ Mapa strony i kluczowe ścieżki użytkownika.
  - [ ] 🎨 Finalny projekt graficzny wszystkich kluczowych widoków w Figmie (praca z Oskarem).
- [ ] **Przygotowanie "Surowych Treści":**
  - [ ] ✍️ Kluczowe przekazy w punktach dla sekcji "O nas", "Dlaczego my?".
  - [ ] 📖 Spisanie 2-3 historii sukcesu klientów.
  - [ ] ⭐ Zebranie 10+ najlepszych opinii od klientów.

---

## 🚀 FAZA 1: MVP - WERSJA STARTOWA
*Cel: Jak najszybsze uruchomienie w pełni funkcjonalnej, szybkiej i generującej leady strony.*
***(Skup się tylko na tej fazie, dopóki wszystko nie będzie gotowe)***

### 💻 Backend (API)
- [x] `✅ /api/listing`: Endpoint listy ofert (przetestowany).
- [x] `✅ /api/listing/:id`: Endpoint szczegółów oferty (przetestowany).
- [ ] `📝 /api/contact`: Prosty endpoint do obsługi formularza kontaktowego.

### 🎨 Frontend (Kod)
- [ ] 📱 **Mobile First:** Wszystkie widoki tworzone najpierw z myślą o telefonach.
- [ ] 📄 **Strona Szczegółów Oferty:** Perfekcyjnie zakodowana, szybka, z galerią zdjęć i jasnym CTA.
- [ ] 📑 **Strona Listy Ofert:** Podstawowe filtry (cena, metraż, pokoje, dzielnica). **BEZ** zaawansowanej mapy interaktywnej na start.
- [ ] 🏠 **Strona Główna:** Skupiona na wyszukiwarce, USP i kilku wyróżnionych ofertach.
- [ ] ℹ️ **Proste Strony Statyczne:** "O nas", "Kontakt".

### 🤖 Automatyzacje (n8n)
- [x] `✅ Synchronizacja z ASARI`: Działa w nowej, bezpiecznej wersji.
- [ ] `🔔 Powiadomienia o Leadach`: Natychmiastowe powiadomienie na Slack/email i potwierdzenie do klienta.

---

## ✨ FAZA 2: WYRÓŻNIKI I BUDOWANIE ZAUFANIA
*Cel: Rozbudowa strony o funkcje "gamechanger", które wzmacniają nasze USP i zostawiają konkurencję w tyle.*
***(Nie dotykaj tej fazy, dopóki Faza 1 nie jest w 100% ukończona i wdrożona)***

### 🗺️ Mapa 2.0
- [ ] **Interaktywna Mapa:** Wdrożenie płynnej mapy jako głównego widoku wyszukiwania.
- [ ] **Rysowanie Obszaru:** Funkcja "narysuj na mapie", gdzie chcesz szukać.
- [ ] **Warstwy Kontekstowe:** Dodanie warstw (szkoły, parki) dla kluczowych person.

### 🤖 Automatyzacje (n8n)
- [ ] **Raport dla Sprzedającego:** Cotygodniowy, automatyczny raport o statystykach oferty.
- [ ] **Kalendarz Prezentacji:** Integracja z Kalendarzem Google do samodzielnej rezerwacji spotkań.

### 📈 Content Marketing i SEO
- [ ] **Blog:** Regularne publikowanie artykułów opartych na potrzebach person.
- [ ] **Link Building:** Uruchomienie comiesięcznego, strategicznego pozyskiwania 1-2 linków.

---

## 💎 FAZA 3: INNOWACJE I SKALOWANIE
*Cel: Eksploracja nowych technologii i ugruntowanie pozycji lidera technologicznego na rynku.*
***(To są błyskotki na przyszłość. Zapisuj tu pomysły i wracaj do nich co kwartał)***

- [ ] **Treści Wideo AI:** Eksperymenty z Veo 3 / ElevenLabs, być może automatyczne generowanie wideo dla ofert.
- [ ] **Analizy Rynku:** Dedykowana sekcja na stronie z raportami opartymi na naszej historycznej bazie danych.
- [ ] **Panel Klienta:** Strefa logowania dla sprzedających i kupujących do śledzenia postępów i zarządzania ofertami.
- [ ] **Zaawansowane Automatyzacje:** np. "Asystent Poszukiwań 24/7" wysyłający spersonalizowane alerty.