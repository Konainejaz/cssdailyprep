-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  bio text,
  avatar_url text,
  role text default 'user', -- 'user' or 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- NOTES TABLE
create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  content text,
  subject text,
  linked_article_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Notes
alter table notes enable row level security;

create policy "Users can view own notes"
  on notes for select
  using ( auth.uid() = user_id );

create policy "Users can insert own notes"
  on notes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own notes"
  on notes for update
  using ( auth.uid() = user_id );

create policy "Users can delete own notes"
  on notes for delete
  using ( auth.uid() = user_id );

-- USER SETTINGS TABLE
create table user_settings (
  user_id uuid references auth.users on delete cascade primary key,
  language text default 'en',
  theme text default 'light',
  preferences jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table user_settings enable row level security;

create policy "Users can view own settings"
  on user_settings for select
  using ( auth.uid() = user_id );

create policy "Users can update own settings"
  on user_settings for update
  using ( auth.uid() = user_id );

create policy "Users can insert own settings"
  on user_settings for insert
  with check ( auth.uid() = user_id );

-- SEARCH HISTORY TABLE
create table search_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  query text not null,
  type text not null, -- 'research', 'resource', 'articles'
  result_snapshot jsonb, -- Optional: store the result for quick access
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table search_history enable row level security;

create policy "Users can view own history"
  on search_history for select
  using ( auth.uid() = user_id );

create policy "Users can insert own history"
  on search_history for insert
  with check ( auth.uid() = user_id );
  
create policy "Users can delete own history"
  on search_history for delete
  using ( auth.uid() = user_id );


-- USER LOGS TABLE (For auditing/tracking usage)
create table user_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  action text not null, -- e.g. 'searched', 'opened_article', 'created_note'
  entity_type text, -- 'article', 'note', 'search'
  entity_id text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table user_logs enable row level security;

create policy "Users can insert own logs"
  on user_logs for insert
  with check ( auth.uid() = user_id );

-- ADMIN POLICIES

-- Profiles: Admins can update any profile (e.g. to change roles)
create policy "Admins can update any profile"
  on profiles for update
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- User Logs: Admins can view all logs
create policy "Admins can view all logs"
  on user_logs for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- User Logs: Users can view their own logs (optional, if needed for history)
create policy "Users can view own logs"
  on user_logs for select
  using ( auth.uid() = user_id );

-- Search History: Admins can view all history (optional, for monitoring)
create policy "Admins can view all history"
  on search_history for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  
  -- Auto-assign admin if email matches environment variable (Logic handled in backend usually, or hardcoded here)
  -- For now, manual update or specific logic.
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
