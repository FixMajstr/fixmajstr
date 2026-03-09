# FixMajstr Backend

Backend za projekt **FixMajstr**, narejen v **FastAPI**.

---

## Struktura projekta

Projekt je razdeljen po layerjih, da je koda pregledna in da ima vsak
del aplikacije svojo odgovornost.

    app/
    ├── api/
    │   ├── router.py
    │   └── routes/
    ├── core/
    ├── dependencies/
    ├── repositories/
    ├── schemas/
    ├── services/
    ├── models/
    └── main.py

---

# Kako aplikacija deluje

Ko pride request v backend, gre običajno skozi naslednje korake:

    Route -> Service -> Repository -> Database

**Pomen posameznih layerjev:**

- **Route** sprejme HTTP request
- **Service** vsebuje business logiko
- **Repository** naredi query na bazo
- **Database** vrne podatke

Dodatno:

- **Schemas** določajo format requestov in responseov
- **Models** predstavljajo strukturo tabel v bazi

---

# Opis map

## /app/api

API layer aplikacije.

### router.py

Glavni router aplikacije. Tukaj določimo katere routerje vključimo.

Primer:

```python
from fastapi import APIRouter
from app.api.routes.test import test_router

api_router = APIRouter()
api_router.include_router(test_router)
```

---

## /app/api/routes

Tukaj so posamezni routerji.

Vsak router predstavlja en modul aplikacije.

Primer:

    routes/
    ├── test_router.py
    ├── users_router.py
    ├── jobs_router.py

Primer `test.py`:

```python
from fastapi import APIRouter
from app.schemas.test import HelloResponse
from app.services.test_service import TestService

test_router = APIRouter(prefix="/test", tags=["Test"])

@test_router.get(
    "/hello",
    response_model=HelloResponse,
    summary="Test endpoint"
)
def hello():
    service = TestService()
    return service.get_hello()
```

Route naj vsebuje samo stvari povezane z HTTP:

- endpoint
- parametre
- request body
- response model

---

## /app/core

Osnovna konfiguracija aplikacije.

### config.py

Tukaj hranimo konfiguracijo projekta.

Primer:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str

settings = Settings()
```

---

## /app/dependencies

### supabase.py

Ustvari Supabase client.

```python
from supabase import create_client
from app.core.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
```

---

## /app/repositories

Repository layer skrbi za dostop do baze.

Primer:

```python
from app.dependencies.supabase import supabase

class TestRepository:
    def get_healthcheck(self):
        result = (
            supabase
            .table("healthcheck")
            .select("message")
            .limit(1)
            .execute()
        )
        return result.data
```

Repository vsebuje samo query-e.

---

## /app/services

Service layer vsebuje business logiko.

Primer:

```python
from app.repositories.test_repository import TestRepository
from app.schemas.test import HelloResponse

class TestService:

    def __init__(self):
        self.repository = TestRepository()

    def get_hello(self) -> HelloResponse:

        data = self.repository.get_healthcheck()

        if not data:
            return HelloResponse(message="No message")

        return HelloResponse(message=data[0]["message"])
```

Service je odgovoren za:

- preverjanje pravic
- validacijo logike
- kombiniranje več query-ev

---

## /app/schemas

Schemas so **Pydantic modeli**, ki definirajo format requestov in
responseov.

Primer response schema:

```python
from pydantic import BaseModel

class HelloResponse(BaseModel):
    message: str
```

Ta schema pomeni, da API vrne:

    {
      "message": "Hello"
    }

Primer request schema:

```python
from pydantic import BaseModel

class CreateUserRequest(BaseModel):
    email: str
    password: str
    full_name: str
```

Schemas omogočajo:

- validacijo requestov
- serializacijo responseov
- avtomatsko Swagger dokumentacijo

---

## /app/models

Models predstavljajo strukturo tabel v bazi.

Primer:

```python
class UserModel:
    id: int
    email: str
    password_hash: str
    full_name: str
```

Primer z ORM:

```python
class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String)
    password_hash = Column(String)
    full_name = Column(String)
```

Razlika:

- **Model** = struktura baze
- **Schema** = struktura API response/request

---

## main.py

Entry point aplikacije.

```python
from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(title="FixMajstr", version="0.0.1")

app.include_router(api_router)
```

Ta datoteka inicializira FastAPI aplikacijo.

---

# Primer flowa

Če klient pokliče:

    GET /test/hello

Flow:

    Route -> Service -> Repository -> Database

Na koncu API vrne:

    {
      "message": "Hello, World!"
    }

---

# Protected routes (avtentikacija)

## Kako deluje zaščita endpointa

Za preverjanje uporabnika uporabljamo dependency `get_current_user`.

### Flow

```
Request
   ↓
Authorization header
   ↓
get_current_user dependency
   ↓
Supabase preveri access token
   ↓
Route dobi current_user
```

Če je token:

- **veljaven** → route se izvede
- **neveljaven ali manjka** → API vrne **401 Unauthorized**

---

# get_current_user dependency

Ta funkcija preveri access token in vrne trenutnega uporabnika.

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.dependencies.supabase import get_supabase
from app.schemas.schemas import CurrentUser

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase=Depends(get_supabase),
) -> CurrentUser:

    token = credentials.credentials

    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")

    try:
        user_response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")

    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="User not found")

    return CurrentUser(
        id=user_response.user.id,
        email=user_response.user.email,
        role=user_response.user.role,
    )
```

---

# Primer protected route

Protected route uporablja `Depends(get_current_user)`.

```python
from fastapi import APIRouter, Depends
from app.schemas.schemas import CurrentUser
from app.dependencies.auth import get_current_user

users_router = APIRouter(prefix="/users", tags=["Users"])

@users_router.get("/me")
def get_me(current_user: CurrentUser = Depends(get_current_user)):
    return current_user
```

Če request nima veljavnega tokena, endpoint vrne:

```
401 Unauthorized
```

---

# Primer requesta

```
GET /users/me
```

Header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user"
}
```

---

# Kako protected route deluje v strukturi projekta

Protected route še vedno sledi isti arhitekturi:

```
Route -> Service -> Repository -> Database
```

Primer:

```
Route (/users/me)
    ↓
get_current_user dependency
    ↓
Service
    ↓
Repository
    ↓
Database
```

Dependency samo **preveri uporabnika**, preden se izvede business logika.

---

# Povzetek

Protected route uporablja:

```
Depends(get_current_user)
```

Uporabnik mora poslati:

```
Authorization: Bearer <access_token>
```

Če token ni veljaven:

```
401 Unauthorized
```

---

# Development

Ta sekcija opisuje, kako lokalno zagnati backend za razvoj.

## 1. Kloniranje repozitorija

```bash
git clone <repo-url>
cd backend
```

---

## 2. Ustvarjanje virtualnega okolja

Priporočeno je uporabljati **Python virtual environment**, da so knjižnice izolirane od sistema.

### Windows

Ustvarimo virtualno okolje:

```bash
python -m venv venv
```

Aktiviramo okolje:

```bash
venv\Scripts\activate
```

---

### Linux / MacOS

Ustvarimo virtualno okolje:

```bash
python3 -m venv venv
```

Aktiviramo okolje:

```bash
source venv/bin/activate
```

Ko je okolje aktivno, bi moral terminal kazati nekaj takega:

```
(venv)
```

---

## 3. Namestitev odvisnosti

Ko je virtual environment aktiven, namestimo vse potrebne knjižnice:

```bash
pip install -r requirements.txt
```

---

## 4. Zagon development serverja

Backend zaženemo z:

```bash
fastapi dev
```

Server se bo zagnal na:

```
http://127.0.0.1:8000
```

Swagger dokumentacija je dostopna na:

```
http://127.0.0.1:8000/docs
```

---

## 5. Dodajanje novih knjižnic

Če dodamo novo knjižnico, jo najprej namestimo:

```bash
pip install ime_knjiznice
```

Nato posodobimo `requirements.txt`:

```bash
pip freeze > requirements.txt
```

To je pomembno, da lahko ostali razvijalci namestijo enake verzije knjižnic.

---

## 6. Deaktivacija virtualnega okolja

Ko končamo z delom, lahko virtual environment deaktiviramo:

```bash
deactivate
```

---

# Povzetek layerjev

**Route** - HTTP endpointi

**Service** - business logika

**Repository** - queryi na bazo

**Schema** - API request/response format

**Model** - struktura tabel v bazi
