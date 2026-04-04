create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null check (char_length(btrim(content)) > 0 and char_length(content) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.blog_comments(id) on delete cascade,
  reporter_user_id uuid not null references public.users(id) on delete cascade,
  article_slug text not null,
  reason text null check (reason is null or char_length(reason) <= 500),
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_user_id)
);

create index if not exists idx_blog_comments_article_slug_created_at
  on public.blog_comments(article_slug, created_at);

create index if not exists idx_blog_comments_user_id
  on public.blog_comments(user_id);

create index if not exists idx_blog_comment_reports_comment_id_created_at
  on public.blog_comment_reports(comment_id, created_at desc);

create index if not exists idx_blog_comment_reports_reporter_user_id
  on public.blog_comment_reports(reporter_user_id);

alter table public.blog_comments enable row level security;
alter table public.blog_comment_reports enable row level security;

create policy "Public read blog_comments"
  on public.blog_comments
  for select
  using (true);

create policy "Authenticated users can insert own blog_comments"
  on public.blog_comments
  for insert
  with check (auth.uid() = user_id);

create policy "Admins can delete blog_comments"
  on public.blog_comments
  for delete
  using (
    exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

create policy "Authenticated users can report blog_comments"
  on public.blog_comment_reports
  for insert
  with check (auth.uid() = reporter_user_id);

create policy "Admins can read blog_comment_reports"
  on public.blog_comment_reports
  for select
  using (
    exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

drop trigger if exists trg_blog_comments_updated_at on public.blog_comments;
create trigger trg_blog_comments_updated_at
before update on public.blog_comments
for each row
execute function public.set_updated_at();
