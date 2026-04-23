-- Trainer feature schema, hardened v2
-- Reconstructed from current app usage and improved with baseline RLS/policies.

create extension if not exists pgcrypto;

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  city text not null,
  specializations jsonb not null default '[]'::jsonb,
  price_per_hour integer not null default 0 check (price_per_hour >= 0),
  certificates jsonb not null default '[]'::jsonb,
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  bio text not null default '',
  certified boolean not null default false,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_trainers_city on public.trainers(city);
create index if not exists idx_trainers_user_id on public.trainers(user_id);

create table if not exists public.training_programs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  type text not null,
  duration_weeks integer not null default 0 check (duration_weeks >= 0),
  sessions integer not null default 0 check (sessions >= 0),
  price integer not null default 0 check (price >= 0),
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_training_programs_trainer_id on public.training_programs(trainer_id);
create index if not exists idx_training_programs_type on public.training_programs(type);

create table if not exists public.trainer_reviews (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_initial text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_trainer_reviews_trainer_id on public.trainer_reviews(trainer_id);
create index if not exists idx_trainer_reviews_created_at on public.trainer_reviews(created_at desc);
create index if not exists idx_trainer_reviews_user_id on public.trainer_reviews(user_id);

create table if not exists public.trainer_availability (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainer_availability_time_check check (end_time > start_time),
  constraint trainer_availability_unique_slot unique (trainer_id, date, start_time)
);

create index if not exists idx_trainer_availability_trainer_id on public.trainer_availability(trainer_id);
create index if not exists idx_trainer_availability_date on public.trainer_availability(date);

create table if not exists public.trainer_bookings (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  program_id uuid references public.training_programs(id) on delete set null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','completed','cancelled')),
  pet_name text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainer_bookings_time_check check (end_time > start_time)
);

create index if not exists idx_trainer_bookings_trainer_id on public.trainer_bookings(trainer_id);
create index if not exists idx_trainer_bookings_user_id on public.trainer_bookings(user_id);
create index if not exists idx_trainer_bookings_date on public.trainer_bookings(date);
create index if not exists idx_trainer_bookings_status on public.trainer_bookings(status);
create unique index if not exists idx_trainer_bookings_active_slot
on public.trainer_bookings(trainer_id, date, start_time)
where status in ('pending', 'confirmed');

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trainers_touch_updated_at
before update on public.trainers
for each row
execute function public.touch_updated_at();

create or replace trigger training_programs_touch_updated_at
before update on public.training_programs
for each row
execute function public.touch_updated_at();

create or replace trigger trainer_availability_touch_updated_at
before update on public.trainer_availability
for each row
execute function public.touch_updated_at();

create or replace trigger trainer_bookings_touch_updated_at
before update on public.trainer_bookings
for each row
execute function public.touch_updated_at();

alter table public.trainers enable row level security;
alter table public.training_programs enable row level security;
alter table public.trainer_reviews enable row level security;
alter table public.trainer_availability enable row level security;
alter table public.trainer_bookings enable row level security;

drop policy if exists "trainers are publicly readable" on public.trainers;
create policy "trainers are publicly readable"
on public.trainers
for select
using (true);

drop policy if exists "trainer owners can update own profile" on public.trainers;
create policy "trainer owners can update own profile"
on public.trainers
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "trainer owners can insert own profile" on public.trainers;
create policy "trainer owners can insert own profile"
on public.trainers
for insert
with check (auth.uid() = user_id);

drop policy if exists "training programs are publicly readable" on public.training_programs;
create policy "training programs are publicly readable"
on public.training_programs
for select
using (true);

drop policy if exists "trainer owners manage own programs" on public.training_programs;
create policy "trainer owners manage own programs"
on public.training_programs
for all
using (
  exists (
    select 1 from public.trainers t
    where t.id = trainer_id and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.trainers t
    where t.id = trainer_id and t.user_id = auth.uid()
  )
);

drop policy if exists "trainer reviews are publicly readable" on public.trainer_reviews;
create policy "trainer reviews are publicly readable"
on public.trainer_reviews
for select
using (true);

drop policy if exists "authenticated users can insert trainer reviews" on public.trainer_reviews;
create policy "authenticated users can insert trainer reviews"
on public.trainer_reviews
for insert
with check (auth.uid() is not null and (user_id is null or auth.uid() = user_id));

drop policy if exists "trainer availability is publicly readable" on public.trainer_availability;
create policy "trainer availability is publicly readable"
on public.trainer_availability
for select
using (true);

drop policy if exists "trainer owners manage own availability" on public.trainer_availability;
create policy "trainer owners manage own availability"
on public.trainer_availability
for all
using (
  exists (
    select 1 from public.trainers t
    where t.id = trainer_id and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.trainers t
    where t.id = trainer_id and t.user_id = auth.uid()
  )
);

drop policy if exists "trainer owners can read own bookings" on public.trainer_bookings;
create policy "trainer owners can read own bookings"
on public.trainer_bookings
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.trainers t
    where t.id = trainer_id and t.user_id = auth.uid()
  )
);

drop policy if exists "authenticated users can create own trainer bookings" on public.trainer_bookings;
create policy "authenticated users can create own trainer bookings"
on public.trainer_bookings
for insert
with check (auth.uid() = user_id);

drop policy if exists "trainer owners manage own bookings" on public.trainer_bookings;
create policy "trainer owners manage own bookings"
on public.trainer_bookings
for update
using (
  exists (
    select 1 from public.trainers t
    where t.id = trainer_id and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.trainers t
    where t.id = trainer_id and t.user_id = auth.uid()
  )
);
