create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    name,
    role,
    avatar_url,
    city
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'Korisnik'),
    case
      when coalesce(new.raw_user_meta_data ->> 'role', 'owner') in ('owner', 'sitter', 'admin')
        then coalesce(new.raw_user_meta_data ->> 'role', 'owner')
      else 'owner'
    end,
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'city', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    role = excluded.role,
    avatar_url = excluded.avatar_url,
    city = excluded.city;

  if coalesce(new.raw_user_meta_data ->> 'role', 'owner') = 'sitter' then
    insert into public.sitter_profiles (user_id, city)
    values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'city', '')
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;
