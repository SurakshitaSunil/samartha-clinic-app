-- Samartha Clinic — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query).

create table if not exists clinic_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table clinic_kv enable row level security;

-- This app handles who-can-see-what (doctor vs receptionist) entirely in
-- its own UI, using the sign-in codes set in Settings — not through
-- Supabase auth. So the database policy below simply allows the app's
-- anon key to read and write. If you later add real per-user login
-- (Supabase Auth), tighten this policy accordingly.
create policy "Allow anon read" on clinic_kv
  for select using (true);

create policy "Allow anon write" on clinic_kv
  for insert with check (true);

create policy "Allow anon update" on clinic_kv
  for update using (true);

-- Enable Realtime so changes made on one device (e.g. reception booking an
-- appointment) show up live on another (e.g. the doctor's tablet).
alter publication supabase_realtime add table clinic_kv;

-- Seed the initial clinic settings row so the app has sensible defaults
-- the very first time it loads. The app will overwrite this via Settings
-- whenever you save changes there.
insert into clinic_kv (key, value)
values (
  'clinic-settings',
  '{
    "clinicName": "SAMARTHA CLINIC",
    "doctors": ["Dr. Sunil R.", "Mrs. Smitha Sunil"],
    "doctorCodes": ["1234", "1234"],
    "receptionistCode": "0000"
  }'::jsonb
)
on conflict (key) do nothing;
