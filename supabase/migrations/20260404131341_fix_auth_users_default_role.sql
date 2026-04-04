alter table public.users alter column role set default 'owner';
update public.users set role = 'owner' where role is null;
