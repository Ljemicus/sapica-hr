alter table public.publisher_profiles
  drop constraint if exists publisher_profiles_type_check;

alter table public.publisher_profiles
  add constraint publisher_profiles_type_check
  check (type in ('vlasnik', 'čuvar', 'groomer', 'trener', 'uzgajivač', 'veterinar', 'udomljavanje'));
