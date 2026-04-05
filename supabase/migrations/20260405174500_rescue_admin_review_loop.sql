alter table public.rescue_organizations
  add column if not exists review_state text not null default 'not_started'
    check (review_state in ('not_started', 'pending', 'in_review', 'changes_requested', 'approved')),
  add column if not exists admin_notes text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id);

create index if not exists idx_rescue_organizations_review_state
  on public.rescue_organizations(review_state);
