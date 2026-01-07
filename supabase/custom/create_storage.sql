-- Create a public bucket for team media
insert into storage.buckets (id, name, public)
values ('team-media', 'team-media', true)
on conflict (id) do nothing;

-- Policy: Public can view
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'team-media' );

-- Policy: Authenticated users can upload (insert)
create policy "Authenticated Insert"
  on storage.objects for insert
  with check ( bucket_id = 'team-media' and auth.role() = 'authenticated' );

-- Policy: Users can update their own uploads (optional, good practice)
create policy "Users can update their own images"
  on storage.objects for update
  using ( bucket_id = 'team-media' and auth.uid() = owner );
