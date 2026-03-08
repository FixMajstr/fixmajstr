# FixMajstr Frontend - Mobilna Aplikacija

Mobilna aplikacija za projekt **FixMajstr**, narejena v **React Native** s pomočjo **Expo** frameworka.

---

## 1. Struktura projekta

Projekt je razdeljen po mapah za boljšo organizacijo in lažje vzdrževanje:

    src/
    ├── components/    # Reusable UI komponente
    ├── navigation/    # Konfiguracija navigacije (React Navigation)
    ├── screens/       # Zasloni aplikacije
    ├── services/      # API klici in zunanje storitve
    └── utils/         # Helper funkcije in konstante

---

## 2. Priprava okolja

Preden začnete, se prepričajte, da imate nameščen **Node.js**.

### Namestitev odvisnosti

V mapi `frontend/mobile-app` zaženite:

```bash
npm install
```

To bo namestilo vse potrebne knjižnice, vključno z `expo`, `react-navigation` in `axios`.

---

## 3. Konfiguracija API povezave

Aplikacija se povezuje na backend preko `axios`. Za pravilno delovanje na mobilnih napravah (emulatorjih in fizičnih napravah) aplikacija uporablja dinamično zaznavanje IP naslova vašega računalnika.

Preverite datoteko `src/services/api.js`, kjer je konfiguriran `baseURL`.

**Pomembno:** Backend mora biti zagnan z ukazom `fastapi dev --host 0.0.0.0`, da je dosegljiv preko omrežja.

Trenutno aplikacija naredi request za test/healthcheck backend pa vrne 500 HTTP status kodo. Vemo da se klic izveda iz logov na backendu.

INFO   192.168.0.12:35232 - "GET /test/healthcheck HTTP/1.1" 500

ERROR   Exception in ASGI application

---

## 4. Zagon aplikacije

Aplikacijo zaženete z ukazom:

```bash
npx expo start
```

Po zagonu se bo prikazala QR koda, ki jo lahko skenirate z aplikacijo **Expo Go** na vaši mobilni napravi, ali pa pritisnete:
- `a` za Android emulator
- `i` za iOS simulator (samo na macOS)
- `w` za spletni preglednik

---

## 5. Navigacija

Aplikacija uporablja **React Navigation** za premikanje med zasloni. Trenutna konfiguracija se nahaja v `src/navigation/AppNavigator.js`.

To vse so samo placeholderi,

Glavni zasloni vključujejo:
- **Home**: Testni zaslon za preverjanje povezave z API-jem.
- **Login**: Prijava (placeholder).
- **Search**: Iskanje (placeholder).
- **Profile**: Profil uporabnika (placeholder).
- **Inquiries**: Povpraševanja (placeholder).
- **Ratings**: Ocene (placeholder).

---

## 6. Razvoj

Če dodajate nove knjižnice, uporabite `npx expo install`, da zagotovite kompatibilnost z vašo verzijo Expo SDK:

```bash
npx expo install ime_knjiznice
```
