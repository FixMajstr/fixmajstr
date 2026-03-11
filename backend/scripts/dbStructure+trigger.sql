-- this worked on db that had no tables, so if it doesn't work, delete them

CREATE TABLE IF NOT EXISTS public.healthcheck (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  message text,
  CONSTRAINT healthcheck_pkey PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS public.masters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text,
  location character varying NOT NULL,
  avg_rating double precision NOT NULL DEFAULT '0'::double precision,
  response_time text,
  CONSTRAINT masters_pkey PRIMARY KEY (id),
  CONSTRAINT masters_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid NOT NULL,
  master_id uuid NOT NULL,
  message text,
  status character varying,
  CONSTRAINT inquiries_pkey PRIMARY KEY (id),
  CONSTRAINT inquiries_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.masters(id)
);
CREATE TABLE IF NOT EXISTS public.master_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL,
  service_id uuid NOT NULL,
  CONSTRAINT master_services_pkey PRIMARY KEY (id),
  CONSTRAINT master_services_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.masters(id),
  CONSTRAINT master_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid NOT NULL,
  master_id uuid NOT NULL,
  score bigint NOT NULL,
  comment text,
  CONSTRAINT ratings_pkey PRIMARY KEY (id),
  CONSTRAINT ratings_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.masters(id),
  CONSTRAINT ratings_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id)
);


create or replace function public.refresh_master_avg_rating()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    update public.masters m
    set avg_rating = coalesce((
      select avg(r.score)::float8
      from public.ratings r
      where r.master_id = new.master_id
    ), 0)
    where m.id = new.master_id;
  end if;


  if tg_op = 'UPDATE' or tg_op = 'DELETE' then
    update public.masters m
    set avg_rating = coalesce((
      select avg(r.score)::float8
      from public.ratings r
      where r.master_id = old.master_id
    ), 0)
    where m.id = old.master_id;
  end if;

  return null;
end;
$$;


drop trigger if exists trg_refresh_master_avg_rating on public.ratings;

create trigger trg_refresh_master_avg_rating
after insert or update or delete on public.ratings
for each row
execute function public.refresh_master_avg_rating();

-- Pregled obstoječih indeksov v public schemi

SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- single colum indexi so tukaj
-- Tabela inquiries
-- Pospeši iskanje povpraševanj po stranki (client_id)
-- Uporabno pri queryjih kjer filtriramo inquiries po uporabniku
CREATE INDEX idx_inquiries_client_id ON inquiries(client_id);

-- Pospeši iskanje povpraševanj po mojstru (master_id)
-- Pomembno za JOIN operacije med inquiries in masters
CREATE INDEX idx_inquiries_master_id ON inquiries(master_id);

-- Pospeši filtriranje povpraševanj po statusu (npr. open, closed)
CREATE INDEX idx_inquiries_status ON inquiries(status);



-- Tabela masters
-- Pospeši povezovanje mojstra z uporabnikom (foreign key na auth.users)
-- Uporablja se pri JOIN operacijah
CREATE INDEX idx_masters_user_id ON masters(user_id);

-- Pospeši iskanje mojstrov po lokaciji
-- Uporabno za filtre ali iskanje storitev po regiji
CREATE INDEX idx_masters_location ON masters(location);


-- Tabela ratings
-- Pospeši iskanje ocen po uporabniku
CREATE INDEX idx_ratings_client_id ON ratings(client_id);

-- Pospeši iskanje ocen za posameznega mojstra
-- Uporabno pri izračunu povprečne ocene ali prikazu ocen
CREATE INDEX idx_ratings_master_id ON ratings(master_id);


-- Tabela master_services
-- Pospeši iskanje storitev, ki jih ponuja določen mojster
CREATE INDEX idx_master_services_master_id ON master_services(master_id);

-- Pospeši iskanje mojstrov, ki ponujajo določeno storitev
CREATE INDEX idx_master_services_service_id ON master_services(service_id);


-- Tabela services
-- Pospeši iskanje storitev po imenu
-- Uporabno pri search funkcionalnosti
CREATE INDEX idx_services_name ON services(name);

--========================================================================================================================

-- Queriji za auth.users

SELECT id
FROM auth.users
LIMIT 10;


--========================================================================================================================

-- Queriji za masters

SELECT id, location, avg_rating
FROM masters;

INSERT INTO masters (id, user_id, description, location, avg_rating, response_time)
VALUES
(gen_random_uuid(), '76f9b985-2e10-4bb2-9d42-135164aac428', 'Vodovodar za popravila in montažo', 'Ljubljana', 4.7, '2h'),

(gen_random_uuid(), '6591ee60-266e-424b-87a3-bcbc379a2af9', 'Električar za stanovanja', 'Maribor', 4.6, '1h'),

(gen_random_uuid(), '410a1c04-9076-41a0-b462-c24078e1816f', 'Keramičar za kopalnice', 'Celje', 4.8, '3h'),

(gen_random_uuid(), '2db09281-6254-47d3-9f3e-86ec34a35a60', 'Mizar za montažo pohištva', 'Kranj', 4.5, '4h');

--=========================================================================================================================

-- Queriji za inquiries

INSERT INTO inquiries (id, created_at, client_id, master_id, message, status) VALUES

(gen_random_uuid(), NOW(), '76f9b985-2e10-4bb2-9d42-135164aac428', 'a958a80c-8c35-46a6-ae76-1cc43e672506', 'Popravilo pipe v kuhinji.', 'open'),

(gen_random_uuid(), NOW(), '6591ee60-266e-424b-87a3-bcbc379a2af9', '441e0424-7489-4f2a-8a7c-72564db7e3db', 'Električna vtičnica ne deluje.', 'open'),

(gen_random_uuid(), NOW(), '410a1c04-9076-41a0-b462-c24078e1816f', '89755794-d9c0-41cb-a4b5-d62b7f281174', 'Montaža novega umivalnika.', 'open'),

(gen_random_uuid(), NOW(), '2db09281-6254-47d3-9f3e-86ec34a35a60', 'f0806f8b-9a84-4482-abe6-eb531bfb2041', 'Popravilo strehe po neurju.', 'open'),

(gen_random_uuid(), NOW(), '76f9b985-2e10-4bb2-9d42-135164aac428', 'ddc93d96-d5bc-4e4b-8fe9-0c1237b4ef4d', 'Montaža kuhinje.', 'in_progress'),

(gen_random_uuid(), NOW(), '6591ee60-266e-424b-87a3-bcbc379a2af9', 'f0806f8b-9a84-4482-abe6-eb531bfb2041', 'Pleskanje stanovanja.', 'open'),

(gen_random_uuid(), NOW(), '410a1c04-9076-41a0-b462-c24078e1816f', 'a958a80c-8c35-46a6-ae76-1cc43e672506', 'Servis centralnega ogrevanja.', 'completed'),

(gen_random_uuid(), NOW(), '2db09281-6254-47d3-9f3e-86ec34a35a60', '441e0424-7489-4f2a-8a7c-72564db7e3db', 'Zamenjava stikala za luč.', 'open'),

(gen_random_uuid(), NOW(), '76f9b985-2e10-4bb2-9d42-135164aac428', '89755794-d9c0-41cb-a4b5-d62b7f281174', 'Popravilo odtoka v kopalnici.', 'in_progress'),

(gen_random_uuid(), NOW(), '6591ee60-266e-424b-87a3-bcbc379a2af9', 'ddc93d96-d5bc-4e4b-8fe9-0c1237b4ef4d', 'Montaža tuš kabine.', 'open');

SELECT id, client_id, master_id, status, created_at
FROM inquiries
LIMIT 10;

-- Iskanje povpraševanj za določenega uporabnika
SELECT id, client_id, master_id, status, created_at
FROM inquiries
WHERE client_id = '76f9b985-2e10-4bb2-9d42-135164aac428'
ORDER BY created_at DESC;

-- Odprta popvpraševanja uporavbnika

SELECT id, message, status
FROM inquiries
WHERE client_id = '76f9b985-2e10-4bb2-9d42-135164aac428'
AND status = 'open';

-- Povpraševanje za določenega mojstra

SELECT id, client_id, message, status, created_at
FROM inquiries
WHERE master_id = 'a958a80c-8c35-46a6-ae76-1cc43e672506'
ORDER BY created_at DESC;

-- Odprta povpraševanja za mojstra

SELECT id, client_id, message, created_at
FROM inquiries
WHERE master_id = 'a958a80c-8c35-46a6-ae76-1cc43e672506'
AND status = 'open';

-- Prikaži lokacijo mojstra

SELECT i.id, i.message, i.status, m.location, m.avg_rating
FROM inquiries i
JOIN masters m
ON i.master_id = m.id
ORDER BY i.created_at DESC;

-- Povpraševanje z lokacijo + filtrom

SELECT i.id, i.message, i.status, m.location
FROM inquiries i
JOIN masters m
ON i.master_id = m.id
WHERE i.status = 'open';

-- Statistika povpraševanj po statusu (agregacija)

SELECT status, COUNT(*) AS total_inquiries
FROM inquiries
GROUP BY status;

-- Koliko povpraševanja ima vsak mojster

SELECT master_id, COUNT(*) AS total_jobs
FROM inquiries
GROUP BY master_id
ORDER BY total_jobs DESC;

--=========================================================================================================================

-- Dodatni indeksi (Composite Index) za optimizacijo queryjev
-- Gre za drugi tip indeksov, ki indeksirajo več stolpcev hkrati
-- Uporabni so pri queryjih, kjer filtriramo in sortiramo po več stolpcih

-- Tabela inquiries
-- Pospeši iskanje povpraševanj po client_id in hkrati omogoča hitro sortiranje po created_at
CREATE INDEX idx_inquiries_client_created_at
ON inquiries(client_id, created_at DESC);

-- Tabela inquiries
-- Pospeši iskanje povpraševanj po master_id in hkrati omogoča hitro sortiranje po created_at
CREATE INDEX idx_inquiries_master_created_at
ON inquiries(master_id, created_at DESC);

-- Tabela inquiries
-- Pospeši filtriranje povpraševanj po client_id in statusu
-- Uporabno pri queryjih kjer uporabnik išče svoja odprta ali zaključena povpraševanja
CREATE INDEX idx_inquiries_client_status
ON inquiries(client_id, status);

--=========================================================================================================================
-- Tabela ratings
-- Pospeši iskanje ocen po uporabniku
-- Uporabno pri queryjih kjer filtriramo ratings po client_id
CREATE INDEX idx_ratings_client_id ON ratings(client_id);

-- Pospeši iskanje ocen za posameznega mojstra
-- Pomembno za prikaz ocen mojstra
CREATE INDEX idx_ratings_master_id ON ratings(master_id);

-- Pospeši filtriranje ocen po master_id in hkrati omogoča hitro agregacijo
-- (npr. AVG score ali COUNT ocen za mojstra)
CREATE INDEX idx_ratings_master_score
ON ratings(master_id, score);

--=========================================================================================================================

-- Queriji za ratings

SELECT *
FROM ratings;

SELECT id, client_id, master_id, score, comment, created_at
FROM ratings
LIMIT 10;

-- Vse ocene določenega uporabnika

SELECT id, client_id, master_id, score, comment, created_at
FROM ratings
WHERE client_id = '2db09281-6254-47d3-9f3e-86ec34a35a60';

-- Vse ocene za določenega mojstra

SELECT id, client_id, master_id, score, comment, created_at
FROM ratings
WHERE master_id = 'f0806f8b-9a84-4482-abe6-eb531bfb2041';

-- Število ocen za posameznega mojstra

SELECT master_id, COUNT(*) AS total_ratings
FROM ratings
GROUP BY master_id
ORDER BY total_ratings DESC;

-- Povprečna ocena za posameznega mojstra

SELECT master_id, AVG(score) AS avg_score
FROM ratings
GROUP BY master_id
ORDER BY avg_score DESC;

-- Povprečna ocena in število ocen za posameznega mojstra

SELECT master_id, AVG(score) AS avg_score, COUNT(*) AS total_ratings
FROM ratings
GROUP BY master_id
ORDER BY avg_score DESC;

-- Povezava ocen z mojstri

SELECT r.id, r.client_id, r.master_id, r.score, r.comment, m.location, m.avg_rating
FROM ratings r
JOIN masters m
ON r.master_id = m.id;

-- Prikaži ocene samo za mojstre iz določene lokacije

SELECT r.id, r.client_id, r.master_id, r.score, r.comment, m.location
FROM ratings r
JOIN masters m
ON r.master_id = m.id
WHERE m.location = 'radece';

--=========================================================================================================================
-- Tabela master_services
-- Pospeši iskanje storitev, ki jih ponuja določen mojster
-- Uporabno pri queryjih kjer filtriramo master_services po master_id
CREATE INDEX IF NOT EXISTS idx_master_services_master_id ON master_services(master_id);

-- Pospeši iskanje mojstrov, ki ponujajo določeno storitev
-- Uporabno pri queryjih kjer filtriramo master_services po service_id
CREATE INDEX IF NOT EXISTS idx_master_services_service_id ON master_services(service_id);

-- Pospeši povezave med mojstri in storitvami
-- Gre za composite index, ki pomaga pri queryjih kjer uporabljamo oba stolpca
CREATE INDEX IF NOT EXISTS idx_master_services_master_service
ON master_services(master_id, service_id);

--=========================================================================================================================

-- Queriji za master_services

SELECT *
FROM master_services;

SELECT id, master_id, service_id
FROM master_services
LIMIT 10;


-- Povezava mojstrov in storitev (testni podatki)

INSERT INTO master_services (id, master_id, service_id)
VALUES
(gen_random_uuid(), 'a958a80c-8c35-46a6-ae76-1cc43e672506', '7036562b-bab7-4c75-9b3f-295ea993c77e'), -- Vodovod

(gen_random_uuid(), '441e0424-7489-4f2a-8a7c-72564db7e3db', '2c7c4bf3-51f9-4942-84bd-c44ec43ab9f7'), -- Elektrika

(gen_random_uuid(), '89755794-d9c0-41cb-a4b5-d62b7f281174', '22bef0e0-3749-4a55-bb46-4cce2197249d'), -- Keramicarstvo

(gen_random_uuid(), 'ddc93d96-d5bc-4e4b-8fe9-0c1237b4ef4d', '59ab5a31-3fd7-47d6-9f98-e8a763f646b8'), -- Mizarstvo

(gen_random_uuid(), 'f0806f8b-9a84-4482-abe6-eb531bfb2041', 'e0578e2c-2458-4a8e-ac98-e5ee1f101ef9'), -- Pleskanje

(gen_random_uuid(), 'a958a80c-8c35-46a6-ae76-1cc43e672506', 'd400edfd-067d-4d38-88dc-3534648b5d2d'), -- Centralno ogrevanje

(gen_random_uuid(), 'ddc93d96-d5bc-4e4b-8fe9-0c1237b4ef4d', '0e4e0a12-2772-4bad-9b00-8d05ba40f697'), -- Montaza kuhinje

(gen_random_uuid(), '89755794-d9c0-41cb-a4b5-d62b7f281174', 'd36bb77f-1f76-4e22-82c1-1d5f5b72a092'); -- Montaza kopalnice

-- Vse storitve za določenega mojstra

SELECT id, master_id, service_id
FROM master_services
WHERE master_id = 'a958a80c-8c35-46a6-ae76-1cc43e672506';


-- Vsi mojstri za določeno storitev

SELECT id, master_id, service_id
FROM master_services
WHERE service_id = '7036562b-bab7-4c75-9b3f-295ea993c77e';


-- Povezava mojstrov in storitev

SELECT ms.id, ms.master_id, ms.service_id, m.location, s.name
FROM master_services ms
JOIN masters m
ON ms.master_id = m.id
JOIN services s
ON ms.service_id = s.id;


-- Prikaži storitve, ki jih ponuja določen mojster

SELECT ms.id, m.id AS master_id, m.location, s.name AS service_name
FROM master_services ms
JOIN masters m
ON ms.master_id = m.id
JOIN services s
ON ms.service_id = s.id
WHERE ms.master_id = 'a958a80c-8c35-46a6-ae76-1cc43e672506';


-- Število storitev za posameznega mojstra

SELECT master_id, COUNT(*) AS total_services
FROM master_services
GROUP BY master_id
ORDER BY total_services DESC;


-- Število mojstrov za posamezno storitev

SELECT service_id, COUNT(*) AS total_masters
FROM master_services
GROUP BY service_id
ORDER BY total_masters DESC;


--=========================================================================================================================

-- Tabela master_services
-- Pospeši iskanje storitev, ki jih ponuja določen mojster

CREATE INDEX IF NOT EXISTS idx_master_services_master_id
ON master_services(master_id);

-- Pospeši iskanje mojstrov za določeno storitev

CREATE INDEX IF NOT EXISTS idx_master_services_service_id
ON master_services(service_id);

-- Composite index za hitrejše povezave med mojstri in storitvami

CREATE INDEX IF NOT EXISTS idx_master_services_master_service
ON master_services(master_id, service_id);

--=========================================================================================================================

-- Queriji za services

SELECT id, name
FROM services;

INSERT INTO services (id, name)
VALUES
(gen_random_uuid(), 'Vodovod'),
(gen_random_uuid(), 'Elektrika'),
(gen_random_uuid(), 'Keramicarstvo'),
(gen_random_uuid(), 'Mizarstvo'),
(gen_random_uuid(), 'Pleskanje'),
(gen_random_uuid(), 'Centralno ogrevanje'),
(gen_random_uuid(), 'Montaza kuhinje'),
(gen_random_uuid(), 'Montaza kopalnice');

SELECT id, name
FROM services
LIMIT 10;

--=========================================================================================================================
-- Tabela masters
-- Pospeši iskanje mojstrov po lokaciji in avg_rating
-- Gre za composite index, ki pomaga pri filtriranju in razvrščanju
CREATE INDEX IF NOT EXISTS idx_masters_location_avg_rating
ON masters(location, avg_rating DESC);

-- Pospeši iskanje mojstrov po povprečni oceni
CREATE INDEX IF NOT EXISTS idx_masters_avg_rating
ON masters(avg_rating DESC);

--=========================================================================================================================

-- Queriji za masters

SELECT *
FROM masters;

SELECT id, user_id, description, location, avg_rating, response_time
FROM masters
LIMIT 10;

-- Vsi mojstri iz določene lokacije

SELECT id, description, location, avg_rating, response_time
FROM masters
WHERE location = 'Maribor';

-- Mojstri razvrščeni po oceni

SELECT id, description, location, avg_rating
FROM masters
ORDER BY avg_rating DESC;

-- Najbolje ocenjeni mojstri iz določene lokacije

SELECT id, description, location, avg_rating
FROM masters
WHERE location = 'Ljubljana'
ORDER BY avg_rating DESC;

-- Prikaz mojstra skupaj z uporabnikom

SELECT m.id, m.location, m.avg_rating, m.response_time, u.id AS user_id
FROM masters m
JOIN auth.users u
ON m.user_id = u.id;

-- Prikaz mojstrov in storitev, ki jih ponujajo

SELECT m.id, m.location, m.avg_rating, s.name AS service_name
FROM masters m
JOIN master_services ms
ON m.id = ms.master_id
JOIN services s
ON ms.service_id = s.id;

-- Koliko storitev ponuja posamezni mojster

SELECT m.id, m.location, COUNT(ms.service_id) AS total_services
FROM masters m
JOIN master_services ms
ON m.id = ms.master_id
GROUP BY m.id, m.location
ORDER BY total_services DESC;

-- Povprečna ocena mojstra glede na ratings

SELECT m.id, m.location, AVG(r.score) AS calculated_avg_score
FROM masters m
JOIN ratings r
ON m.id = r.master_id
GROUP BY m.id, m.location
ORDER BY calculated_avg_score DESC;

--=========================================================================================================================
-- Tabela services
-- Pospeši iskanje storitev po imenu in razvrščanje po imenu
-- Gre za dodatni query del nad že obstoječim indeksom idx_services_name
CREATE INDEX IF NOT EXISTS idx_services_name_id
ON services(name, id);

--=========================================================================================================================

-- Queriji za services

SELECT *
FROM services;

SELECT id, name
FROM services
LIMIT 10;

-- Iskanje določene storitve po imenu

SELECT id, name
FROM services
WHERE name = 'Vodovod';

-- Razvrstitev storitev po abecedi

SELECT id, name
FROM services
ORDER BY name ASC;

-- Prikaz storitev skupaj z mojstri, ki jih ponujajo

SELECT s.id, s.name, m.id AS master_id, m.location
FROM services s
JOIN master_services ms
ON s.id = ms.service_id
JOIN masters m
ON ms.master_id = m.id;

-- Koliko mojstrov ponuja posamezno storitev

SELECT s.id, s.name, COUNT(ms.master_id) AS total_masters
FROM services s
JOIN master_services ms
ON s.id = ms.service_id
GROUP BY s.id, s.name
ORDER BY total_masters DESC;

-- Katere storitve ponujajo mojstri iz določene lokacije

SELECT s.id, s.name, m.location
FROM services s
JOIN master_services ms
ON s.id = ms.service_id
JOIN masters m
ON ms.master_id = m.id
WHERE m.location = 'Ljubljana';

-- Katere storitve so povezane z najbolje ocenjenimi mojstri

SELECT s.id, s.name, m.avg_rating
FROM services s
JOIN master_services ms
ON s.id = ms.service_id
JOIN masters m
ON ms.master_id = m.id
ORDER BY m.avg_rating DESC;

--=========================================================================================================================
-- Težji queryji z dvema JOIN-oma

-- Prikaži povpraševanja skupaj z lokacijo mojstra in storitvijo, ki jo mojster ponuja

SELECT i.id, i.message, i.status, m.location, s.name AS service_name
FROM inquiries i
JOIN masters m
ON i.master_id = m.id
JOIN master_services ms
ON m.id = ms.master_id
JOIN services s
ON ms.service_id = s.id
ORDER BY i.created_at DESC;

-- Prikaži ocene skupaj z lokacijo mojstra in storitvijo, ki jo mojster ponuja

SELECT r.id, r.score, r.comment, m.location, s.name AS service_name
FROM ratings r
JOIN masters m
ON r.master_id = m.id
JOIN master_services ms
ON m.id = ms.master_id
JOIN services s
ON ms.service_id = s.id
ORDER BY r.score DESC;

-- Prikaži mojstre, njihove storitve in število povpraševanj

SELECT m.id, m.location, s.name AS service_name, COUNT(i.id) AS total_inquiries
FROM masters m
JOIN master_services ms
ON m.id = ms.master_id
JOIN services s
ON ms.service_id = s.id
LEFT JOIN inquiries i
ON m.id = i.master_id
GROUP BY m.id, m.location, s.name
ORDER BY total_inquiries DESC;

--=========================================================================================================================
-- Dodatni indeks za optimizacijo JOIN operacij v težjih queryjih

-- Tabela inquiries
-- Pospeši JOIN operacije in sortiranje po datumu

CREATE INDEX IF NOT EXISTS idx_inquiries_master_created_at
ON inquiries(master_id, created_at DESC);
