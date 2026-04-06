-- Create storage bucket for chat images
insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload images
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'chat-images');

-- Allow public to view images
create policy "Allow public viewing"
on storage.objects for select
to anon
using (bucket_id = 'chat-images');

-- Allow users to delete their own images
create policy "Allow users to delete own images"
on storage.objects for delete
to authenticated
using (bucket_id = 'chat-images' and auth.uid()::text = (storage.foldername(name))[1]);
