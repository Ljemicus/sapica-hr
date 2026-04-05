alter table public.rescue_organizations
  add column if not exists external_donation_url text,
  add column if not exists external_donation_url_status text not null default 'not_provided'
    check (external_donation_url_status in ('not_provided', 'pending_review', 'approved', 'rejected')),
  add column if not exists external_donation_url_verified_at timestamptz,
  add column if not exists external_donation_url_verified_by uuid references auth.users(id),
  add column if not exists verification_submitted_at timestamptz;

create index if not exists idx_rescue_organizations_donation_url_status
  on public.rescue_organizations(external_donation_url_status);

alter table public.rescue_verification_documents
  add column if not exists review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected')),
  add column if not exists admin_notes text,
  add column if not exists document_notes text,
  add column if not exists file_size_bytes bigint,
  add column if not exists mime_type text;

create index if not exists idx_rescue_verification_documents_review_status
  on public.rescue_verification_documents(review_status);
