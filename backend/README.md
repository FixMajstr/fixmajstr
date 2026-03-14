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
    supabase=Depends(get_supabase_client),
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
        role=user_response.user.user_metadata.get("role"),
        phone=user_response.user.user_metadata.get("phone"),
        full_name=user_response.user.user_metadata.get("full_name"),
        avatar_url=user_response.user.user_metadata.get("avatar_url"),
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
  "role": "client",
  "phone": "123123123",
  "full_name": "Janez Novak",
  "avatar_url": "https://fixmajstr.com/img/neki.png"
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

# Protected routes (avtorizacija)

## Kako deluje avtorizacija endpointa

Avtorizacija preverja **ali ima prijavljen uporabnik dovoljenje za dostop do določenega endpointa**.

Avtorizacija se izvaja **po avtentikaciji**, kar pomeni:

1. Najprej preverimo uporabnika (`get_current_user`)
2. Nato preverimo njegovo **vlogo (role)**

### Flow

```
Request
   ↓
Authorization header
   ↓
get_current_user dependency
   ↓
require_role dependency
   ↓
Route dobi current_user
```

Če uporabnik:

- **ima dovoljene pravice** → route se izvede
- **nima dovoljene vloge** → API vrne **403 Forbidden**

---

# Role authorization dependency

Za preverjanje vlog uporabljamo funkcijo `_requires_role`, ki sprejme dovoljene vloge.

```python
from fastapi import Depends, HTTPException
from app.dependencies.auth import get_current_user
from app.schemas.schemas import CurrentUser


def _requires_role(*allowed_roles: str):
    def role_dependency(current_user: CurrentUser = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user

    return role_dependency
```

Ta funkcija omogoča, da enostavno definiramo različne nivoje dostopa.

---

# Definicija role dependencies

Na podlagi `_requires_role` lahko definiramo različne nivoje dostopa.

```python
from app.core.common import Role

require_master_role = _requires_role(Role.MASTER.value, Role.ADMIN.value)
require_admin_role = _requires_role(Role.ADMIN.value)
```

## Pravila dostopa

| Role   | require_master_role | require_admin_role |
| ------ | ------------------- | ------------------ |
| client | ❌                  | ❌                 |
| master | ✅                  | ❌                 |
| admin  | ✅                  | ✅                 |

---

# Primer route z avtorizacijo

Route lahko zahteva določeno vlogo.

```python
from fastapi import APIRouter, Depends
from app.schemas.schemas import CurrentUser
from app.dependencies.roles import require_master_role

router = APIRouter()

@router.get("/admin-data")
def get_admin_data(current_user: CurrentUser = Depends(require_master_role)):
    return {"message": "Only master or admin can access this"}
```

Če uporabnik nima ustrezne vloge, endpoint vrne:

```
403 Forbidden
```

---

# Primer requesta

```
GET /admin-data
```

Header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Če ima uporabnik vlogo `master` ali `admin`, bo response:

```json
{
  "message": "Only master or admin can access this"
}
```

Če ima uporabnik vlogo `client`, API vrne:

```
403 Forbidden
```

---

# Kako avtorizacija deluje v arhitekturi projekta

Avtorizacija se izvede **pred business logiko**.

```
Route
   ↓
get_current_user (avtentikacija)
   ↓
require_role (avtorizacija)
   ↓
Service
   ↓
Repository
   ↓
Database
```

`get_current_user` preveri **identiteto uporabnika**, `require_role` pa preveri **njegove pravice**.

Business logika v `Service` sloju se izvede samo, če uporabnik uspešno prestane obe preverjanji.

---

# Testing

Ta sekcija opisuje, kako poganjati teste v projektu, kako so testi organizirani in na kaj je treba paziti pri testih, ki uporabljajo pravi Supabase backend.

---

## Namen testov

V projektu uporabljamo dve osnovni vrsti testov:

### Unit testi

Unit testi preverjajo posamezne funkcije ali razrede ločeno od zunanjih sistemov.

Pri teh testih običajno:

- mockamo klice na Supabase
- preverjamo business logiko v service layerju
- preverjamo, da repository pravilno kliče query chain

Unit testi naj bodo:

- hitri
- neodvisni od interneta
- ponovljivi

---

### Integration testi

Integration testi preverjajo delovanje z dejansko bazo oziroma z realnim Supabase okoljem.

Pri teh testih običajno:

- ustvarimo testnega uporabnika
- ustvarimo zapis v bazi
- preverimo branje, posodobitev in brisanje
- na koncu pobrišemo testne podatke

Integration testi so počasnejši, vendar preverijo, da celoten flow res deluje:

```text
Repository -> Supabase -> Database
```

---

## Struktura testov

Priporočena struktura testov:

```text
test/
├── conftest.py
├── repositories/
│   ├── test_master_repository.py
│   ├── test_inquiries_repository.py
│   └── ...
├── services/
│   └── ...
└── api/
    └── ...
```

### Pomen map

- `test/repositories/` vsebuje teste repository layerja
- `test/services/` vsebuje teste service layerja
- `test/api/` vsebuje teste endpointov
- `test/conftest.py` vsebuje skupno konfiguracijo za pytest

---

## Konfiguracija pytest

V root mapi projekta dodamo datoteko `pytest.ini`.

Primer:

```ini
[pytest]
testpaths = test
python_files = test_*.py
python_classes = Test*
python_functions = test_*

markers =
    integration: tests that hit the real Supabase backend

filterwarnings =
    ignore:The 'timeout' parameter is deprecated.*:DeprecationWarning
    ignore:The 'verify' parameter is deprecated.*:DeprecationWarning
```

To omogoča:

- da pytest ve, kje išče teste
- da prepozna `@pytest.mark.integration`
- da skrijemo nepomembna opozorila iz knjižnice Supabase

---

## conftest.py

Če pytest ne najde `app` modula, lahko v `test/conftest.py` dodamo root mapo projekta v Python path.

Primer:

```python
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))
```

To omogoča importe, kot na primer:

```python
from app.repositories.master_repository import MastersRepository
```

---

## Zagon testov

### Zagon vseh testov

```bash
pytest -v
```

### Zagon samo integration testov

```bash
pytest -m integration -v
```

### Zagon vseh testov razen integration

```bash
pytest -m "not integration" -v
```

### Zagon posamezne datoteke

```bash
pytest test/repositories/test_master_repository.py -v
```

### Zagon posameznega testa

```bash
pytest test/repositories/test_master_repository.py::test_masters_repository_crud_with_real_supabase -v
```

---

## Zahteve za integration teste

Ker integration testi uporabljajo pravi Supabase backend, morajo biti pravilno nastavljene okoljske spremenljivke.

Primer v `.env` datoteki:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

### Pomembno

Za integration teste običajno potrebujemo `service role` ključ, ne samo anon ključ.

Razlog:

- ustvarjanje uporabnikov v `auth.users`
- brisanje uporabnikov po testu
- izvajanje insert/update/delete operacij, če je vklopljen RLS

Če uporabljamo anon key in so politike stroge, bodo integration testi lahko padli zaradi `401`, `403` ali zaradi RLS omejitev.

---

## Priporočilo za testno okolje

Priporočeno je, da integration testov ne poganjamo proti produkcijski bazi.

Najboljša praksa je uporaba:

- ločenega Supabase projekta za development/test
  ali
- ločene testne sheme in testnih podatkov

Tako se izognemo:

- onesnaževanju produkcijskih podatkov
- testnim uporabnikom v produkciji
- nenamernemu brisanju pravih zapisov

---

## Cleanup testnih podatkov

Vsak integration test mora za sabo pobrisati podatke, ki jih ustvari.

To običajno pomeni:

- pobrisati zapis v public tabeli
- pobrisati testnega uporabnika iz `auth.users`

Priporočeno je uporabiti `try/finally`, da cleanup teče tudi, če test pade.

Primer:

```python
try:
    # create test data
    pass
finally:
    # cleanup test data
    pass
```

---

## Primer vrste testov po layerjih

### Repository testi

Preverjajo:

- create
- get by id
- list/get all
- update
- delete

### Service testi

Preverjajo:

- validacijo poslovne logike
- preverjanje pogojev
- pravilno reakcijo na manjkajoče podatke
- pretvorbo rezultatov v schema modele

### API testi

Preverjajo:

- HTTP status kode
- response modele
- validacijo request bodyjev
- protected route dostop
- role-based dostop

---

## Protected route testi

Pri testiranju zaščitenih endpointov preverjamo vsaj naslednje scenarije:

### Authentication

- brez tokena vrne `401 Unauthorized`
- z neveljavnim tokenom vrne `401 Unauthorized`
- z veljavnim tokenom endpoint deluje

### Authorization

- uporabnik brez ustrezne role dobi `403 Forbidden`
- uporabnik z ustrezno role dobi pravilen response

---

## Primer razvojnega workflowa

Priporočen workflow pri dodajanju nove funkcionalnosti:

1. dodamo schema modele
2. implementiramo repository
3. napišemo repository test
4. implementiramo service
5. napišemo service test
6. implementiramo route
7. napišemo API test

Tako imamo test coverage čez celoten flow:

```text
Route -> Service -> Repository -> Database
```

---

## Dodatne odvisnosti za testiranje

Če še niso nameščene, priporočamo vsaj:

```bash
pip install pytest
```

Če želimo posodobiti `requirements.txt`:

```bash
pip freeze > requirements.txt
```

Če bo projekt kasneje uporabljal več mockanja ali async testov, lahko po potrebi dodamo še dodatne testing knjižnice.

---

## Povzetek

Za testiranje uporabljamo:

- **unit teste** za hitro preverjanje logike
- **integration teste** za preverjanje prave povezave s Supabase

Osnovni ukazi:

```bash
pytest -v
pytest -m integration -v
pytest -m "not integration" -v
```

Pomembno:

- testi naj tečejo na development/test okolju
- integration testi naj vedno čistijo podatke za sabo
- `pytest.ini` naj vsebuje registracijo custom markov
- `conftest.py` lahko reši import path težave

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
