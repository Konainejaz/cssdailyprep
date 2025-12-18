-- FIX: Configure 'avatars' bucket with correct permissions and size limits

-- 1. Create the 'avatars' bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 
  'avatars', 
  true, 
  512000, -- 500KB limit
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 512000,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

-- 2. Create Policies (Drop first to avoid duplicates)

-- Allow public access to view files
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow users to update their own files
drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner )
  with check ( bucket_id = 'avatars' and auth.uid() = owner );

-- Allow users to delete their own files
drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.uid() = owner );
