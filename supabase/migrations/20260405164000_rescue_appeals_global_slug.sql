-- Public appeal detail route uses /apelacije/[slug], so slug must be globally unique.
create unique index if not exists idx_rescue_appeals_slug_unique on public.rescue_appeals(slug);
