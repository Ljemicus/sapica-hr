-- Lost pet listing reports (flagging inappropriate/fraudulent listings)
create table if not exists lost_pet_reports (
  id uuid primary key default gen_random_uuid(),
  lost_pet_id uuid not null references lost_pets(id) on delete cascade,
  reporter_user_id uuid not null references users(id) on delete cascade,
  reporter_ip text not null,
  reason_code text not null,
  reason text not null check (char_length(reason) between 1 and 500),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index idx_lost_pet_reports_pet on lost_pet_reports(lost_pet_id);
create unique index idx_lost_pet_reports_user_pet on lost_pet_reports(reporter_user_id, lost_pet_id);
