# Bug Report — FixMajstr: Inquiries & Status Flow

---

## 📋 Povzetek

Med QA testiranjem endpointov za povpraševanja (`/inquiries/`) smo izvedli osnovno testiranje (happy path + validacija), varnostno testiranje (kdo sme kaj) in E2E testiranje (cel flow od ustvarjanja do zaključka).

Ni nekih kritičnih bugov — vse kar smo našli se bolj ali manj navezuje na status. Manjka dodatna logika za preverjanje statusov, verjetno zaradi pomanjkanja časa backend na to ni pomislil.

---

## ✅ Kaj deluje

- Client uspešno ustvari povpraševanje
- Podatki (client_id, master_id, message, status) se pravilno shranijo v bazo
- Client vidi svoja povpraševanja (`/inquiries/my-inquiries`)
- Master vidi prejeta povpraševanja (`/inquiries/received`)
- Master lahko sprejme povpraševanje → `accepted`
- Master lahko zavrne povpraševanje → `rejected`
- Master lahko zaključi povpraševanje → `completed`
- Client lahko prekliče svoje povpraševanje → `cancelled`
- Tretja oseba ne more videti tujega povpraševanja
- Registracija mojstra + email potrditev → zapis v `public.masters` se ustvari pravilno

---

## ⚠️ Potencialni bugi

### P1 — Client lahko spreminja statuse, ki so rezervirani za masterja
**Endpoint:** `PATCH /inquiries/{inquiry_id}/status`  
**Opomba:** Ni nujno bug — odvisno od tega kakšno logiko je backend imel v mislih. Možno je da je bila ta funkcionalnost namerna. Priporočamo pojasnitev z razvijalcem.  
**Trenutno obnašanje:** Client lahko nastavi `accepted`, `completed` in `rejected` brez omejitev.  
**Dobljeno:** `200 OK`

Če je namera da samo master spreminja te statuse, bi moralo biti:
- **master** → `accepted`, `rejected`, `completed`
- **client** → samo `cancelled`

---

### P2 — Ni workflow validacije za status
**Endpoint:** `PATCH /inquiries/{inquiry_id}/status`  
**Opomba:** Ni nujno bug — odvisno od poslovne logike. Možno da je backend nameravno pustil status odprt. Priporočamo pojasnitev z razvijalcem.  
**Trenutno obnašanje:** Status se lahko nastavi na katerokoli vrednost ne glede na trenutni status. Primer: `completed` → `pending` → `accepted`. Logičen vrstni red ni uveljavljen.  
**Dobljeno:** `200 OK`

Če je namera da se uveljavlja vrstni red, predlagani dovoljeni prehodi:
```
pending  → accepted
pending  → rejected
pending  → cancelled  (samo client)
accepted → completed
accepted → cancelled  (samo client)
```

---

## 🟠 Srednji bugi

### S1 — Prazen message je sprejet
**Endpoint:** `POST /inquiries/`  
**Problem:** Client lahko pošlje povpraševanje s praznim sporočilom (`"message": ""`). Mojster dobi povpraševanje brez opisa problema — ne ve kaj stranka sploh hoče.  
**Pričakovano:** `422 Unprocessable Entity`  
**Dobljeno:** `200 OK`

---

### S2 — Katerikoli status string je sprejet
**Endpoint:** `PATCH /inquiries/{inquiry_id}/status`  
**Problem:** Backend ne validira vrednosti statusa. Sprejme `"random_status"`, `"banana"` ali kar koli drugega.  
**Pričakovano:** `422 Unprocessable Entity`  
**Dobljeno:** `200 OK`, status se shrani kot `"random_status"` v bazo  
---

### S3 — Duplikat povpraševanja je dovoljen
**Endpoint:** `POST /inquiries/`  
**Problem:** Client lahko pošlje neomejeno povpraševanj istemu mojstru, tudi ko je eno že aktivno (`pending` ali `accepted`). Mojster bo zasut z duplikati.  
**Pričakovano:** `409 Conflict`  
**Dobljeno:** `200 OK`, duplikat se ustvari

---



## 📋 Preglednica bugov

| ID | Endpoint | Opis | Resnost | Pričakovano | Dobljeno |
|----|----------|------|---------|-------------|----------|
| P1 | PATCH /inquiries/{id}/status | Client spreminja master statuse | ⚠️ Potencialno | 403 | 200 |
| P2 | PATCH /inquiries/{id}/status | Ni workflow validacije | ⚠️ Potencialno | 409 | 200 |
| S1 | POST /inquiries/ | Prazen message sprejet | 🟠 Srednje | 422 | 200 |
| S2 | PATCH /inquiries/{id}/status | Neveljaven status string sprejet | 🟠 Srednje | 422 | 200 |
| S3 | POST /inquiries/ | Duplikat povpraševanja dovoljen | 🟠 Srednje | 409 | 200 |

---
---
