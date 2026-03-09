# FixMajstr – QA Testing Report
## FM-117: Testiranje Avtentikacije

**Avtor:** Arnož Siljan  
**Datum testiranja:** 09.03.2026  
**Backend URL:** http://localhost:8000  
**Branch:** feature/FM-117-testiranje-avtentikacije  

---

## Povzetek

| Epic | Jira Task | Status |
|------|-----------|--------|
| FM-117 | Testiranje Avtentikacije | Zaključeno |
| FM-118 | Testiranje registracije uporabnika | PASS |
| FM-119 | Testiranje login sistema | PASS |
| FM-120 | Testiranje validacije podatkov | PASS |
| FM-121 | Bug report | 1 bug najden |

---

## FM-118 – Testiranje registracije uporabnika

### TC-001: Registracija brez obveznih polj
- **Endpoint:** `POST /auth/register`
- **Payload:**
```json
{
  "email": "test@test.com",
  "password": "Test1234!"
}
```
- **Pričakovan rezultat:** 422 Unprocessable Entity
- **Dejanski rezultat:** 422 Unprocessable Entity – manjkata polji `full_name` in `role`
- **Status: PASS**

---

### TC-002: Uspešna registracija
- **Endpoint:** `POST /auth/register`
- **Payload:**
```json
{
  "email": "test@test.com",
  "password": "Test1234!",
  "full_name": "Test User",
  "role": "client"
}
```
- **Pričakovan rezultat:** 200 OK z `user_id`
- **Dejanski rezultat:** 200 OK
```json
{
  "message": "User registered!",
  "user_id": "410a1c04-9076-41a0-b462-c24078e1816f"
}
```
- **Status: PASS**

---

### TC-003: Registracija z že obstoječim emailom
- **Endpoint:** `POST /auth/register`
- **Payload:**
```json
{
  "email": "test@test.com",
  "password": "Test1234!",
  "full_name": "Test User",
  "role": "client"
}
```
- **Pričakovan rezultat:** 400/409
- **Dejanski rezultat:** 400 Bad Request – `"Register error: User already registered"`
- **Status: PASS**

---

## FM-119 – Testiranje login sistema

### TC-004: Login z veljavnimi kredencialami
- **Endpoint:** `POST /auth/login`
- **Payload:**
```json
{
  "email": "test@test.com",
  "password": "Test1234!"
}
```
- **Pričakovan rezultat:** 200 OK z `access_token`
- **Dejanski rezultat:** 200 OK
```json
{
  "user_id": "410a1c04-9076-41a0-b462-c24078e1816f",
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "message": "User logged in!"
}
```
- **Status: PASS**

---

### TC-005: Login z napačnim geslom
- **Endpoint:** `POST /auth/login`
- **Payload:**
```json
{
  "email": "test@test.com",
  "password": "NapačnoGeslo123!"
}
```
- **Pričakovan rezultat:** 400/401
- **Dejanski rezultat:** 400 Bad Request – `"Invalid email or password"`
- **Status: PASS**

---

### TC-006: Login z neobstoječim uporabnikom
- **Endpoint:** `POST /auth/login`
- **Payload:**
```json
{
  "email": "neobstoji@test.com",
  "password": "Test1234!"
}
```
- **Pričakovan rezultat:** 400/401
- **Dejanski rezultat:** 400 Bad Request – `"Invalid email or password"`
- **Status: PASS**

---

### TC-007: Pridobitev podatkov prijavljenega uporabnika
- **Endpoint:** `GET /auth/me`
- **Auth:** Bearer Token
- **Pričakovan rezultat:** 200 OK z podatki uporabnika
- **Dejanski rezultat:** 200 OK
```json
{
  "id": "410a1c04-9076-41a0-b462-c24078e1816f",
  "email": "test@test.com",
  "role": "client",
  "phone": null,
  "full_name": "Test User",
  "avatar_url": null
}
```
- **Status: PASS**

---

### TC-008: Logout
- **Endpoint:** `GET /auth/logout`
- **Status: SKIP**
- **Razlog:** Endpoint še ni implementiran. Ni naveden v uradnem seznamu implementiranih endpointov (login, register, refresh, me).

---

## FM-120 – Testiranje validacije podatkov

### TC-009: Neveljaven email format
- **Endpoint:** `POST /auth/register`
- **Payload:**
```json
{
  "email": "notanemail",
  "password": "Test1234!",
  "full_name": "Test User",
  "role": "client"
}
```
- **Pričakovan rezultat:** 400/422
- **Dejanski rezultat:** 400 Bad Request – `"Register error: Unable to validate email address: invalid format"`
- **Status: PASS**

---

### TC-010: Prekratko geslo (manj kot 6 znakov)
- **Endpoint:** `POST /auth/register`
- **Payload:**
```json
{
  "email": "test2@test.com",
  "password": "123",
  "full_name": "Test User",
  "role": "client"
}
```
- **Pričakovan rezultat:** 400/422
- **Dejanski rezultat:** 400 Bad Request – `"Register error: Password should be at least 6 characters."`
- **Status: PASS**

---

### TC-011: Prazna polja (email in geslo)
- **Endpoint:** `POST /auth/register`
- **Payload:**
```json
{
  "email": "",
  "password": "",
  "full_name": "",
  "role": "client"
}
```
- **Pričakovan rezultat:** 400/422
- **Dejanski rezultat:** 400 Bad Request – `"Register error: You must provide either an email or phone number and a password"`
- **Status: PASS**

---

### TC-012: Protected route brez tokena
- **Endpoint:** `GET /test/healthcheck-protected`
- **Auth:** No Auth
- **Pričakovan rezultat:** 401 Unauthorized
- **Dejanski rezultat:** 401 Unauthorized – `"Not authenticated"`
- **Status: PASS**

---

### TC-013: Protected route z veljavnim tokenom
- **Endpoint:** `GET /test/healthcheck-protected`
- **Auth:** Bearer Token
- **Pričakovan rezultat:** 200 OK
- **Dejanski rezultat:** 200 OK – `"Supabase connected, but healthcheck table is empty."`
- **Status: PASS**

---

## FM-121 – Bug Report

### BUG-001: Healthcheck tabela ne obstaja v Supabase

| Polje | Vrednost |
|-------|----------|
| **ID** | BUG-001 |
| **Endpoint** | `GET /test/healthcheck` |
| **Resnost** | Low |
| **Prioriteta** | Low |
| **Komponenta** | Backend / Database |

**Opis:**  
Endpoint `/test/healthcheck` vrne sporočilo `"Supabase connected, but healthcheck table is empty."` namesto pričakovanega uspešnega odgovora. Tabela `healthcheck` ne obstaja ali je prazna v Supabase bazi.

**Koraki za reprodukcijo:**
1. Zaženi backend (`fastapi dev`)
2. Pošlji `GET http://localhost:8000/test/healthcheck` brez autentikacije
3. Opazuj odgovor

**Pričakovan rezultat:** 200 OK z potrditvijo Supabase povezave  
**Dejanski rezultat:** 200 OK z opozorilom `"healthcheck table is empty"`  
**Opomba:** Ne vpliva na delovanje avtentikacije. Potrebna je kreacija tabele ali vstavitev testnega zapisa s strani DB ekipe.

---

## Zaključek

Avtentikacijski sistem deluje pravilno. Vsi testi registracije, logina in validacije so uspešno opravljeni (13 testov, 1 skip, 1 bug). Bug ne vpliva na delovanje avtentikacije.

**Naslednji korak:** Regression testing (FM-122) – po popravku BUG-001
