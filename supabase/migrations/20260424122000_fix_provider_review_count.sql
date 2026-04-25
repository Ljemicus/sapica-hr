-- Cycle 3: fix providers.review_count drift with backfill + trigger sync

create or replace function public.sync_provider_review_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    update public.providers
    set review_count = (
      select count(*)::integer
      from public.reviews
      where provider_id = old.provider_id
    )
    where id = old.provider_id;
    return old;
  end if;

  update public.providers
  set review_count = (
    select count(*)::integer
    from public.reviews
    where provider_id = new.provider_id
  )
  where id = new.provider_id;

  if tg_op = 'UPDATE' and old.provider_id is distinct from new.provider_id then
    update public.providers
    set review_count = (
      select count(*)::integer
      from public.reviews
      where provider_id = old.provider_id
    )
    where id = old.provider_id;
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_sync_provider_count on public.reviews;
create trigger reviews_sync_provider_count
after insert or update or delete on public.reviews
for each row
execute function public.sync_provider_review_count();

update public.providers p
set review_count = coalesce(src.actual_count, 0)
from (
  select p2.id, count(r.id)::integer as actual_count
  from public.providers p2
  left join public.reviews r on r.provider_id = p2.id
  group by p2.id
) src
where p.id = src.id
  and p.review_count is distinct from coalesce(src.actual_count, 0);
