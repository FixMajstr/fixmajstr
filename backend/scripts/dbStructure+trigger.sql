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