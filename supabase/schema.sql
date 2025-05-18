-- Create tables for our car repair platform

-- Users table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  user_type text not null check (user_type in ('car_owner', 'mechanic')),
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mechanics table
create table mechanics (
  id uuid references profiles(id) on delete cascade primary key,
  business_name text,
  business_address text,
  business_phone text,
  business_email text,
  service_radius integer, -- in miles
  specialties text[],
  certifications text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Repair requests table
create table repair_requests (
  id uuid default uuid_generate_v4() primary key,
  car_owner_id uuid references profiles(id) on delete cascade not null,
  car_make text not null,
  car_model text not null,
  car_year integer not null,
  issue_type text not null,
  description text not null,
  location text not null,
  preferred_service_type text check (preferred_service_type in ('any', 'dealership', 'independent', 'mobile')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  contact_phone text,
  diagnostic_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Repair quotes table
create table repair_quotes (
  id uuid default uuid_generate_v4() primary key,
  repair_request_id uuid references repair_requests(id) on delete cascade not null,
  mechanic_id uuid references mechanics(id) on delete cascade not null,
  amount decimal(10,2) not null,
  description text not null,
  estimated_hours integer,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table mechanics enable row level security;
alter table repair_requests enable row level security;
alter table repair_quotes enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Mechanics policies
create policy "Mechanics are viewable by everyone"
  on mechanics for select
  using (true);

create policy "Mechanics can insert their own record"
  on mechanics for insert
  with check (auth.uid() = id);

create policy "Mechanics can update their own record"
  on mechanics for update
  using (auth.uid() = id);

-- Repair requests policies
create policy "Repair requests are viewable by everyone"
  on repair_requests for select
  using (true);

create policy "Car owners can create repair requests"
  on repair_requests for insert
  with check (
    auth.uid() = car_owner_id
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and user_type = 'car_owner'
    )
  );

create policy "Car owners can update their own repair requests"
  on repair_requests for update
  using (
    auth.uid() = car_owner_id
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and user_type = 'car_owner'
    )
  );

-- Repair quotes policies
create policy "Repair quotes are viewable by everyone"
  on repair_quotes for select
  using (true);

create policy "Mechanics can create quotes"
  on repair_quotes for insert
  with check (
    exists (
      select 1 from mechanics
      where id = auth.uid()
    )
  );

create policy "Mechanics can update their own quotes"
  on repair_quotes for update
  using (
    mechanic_id = auth.uid()
    and status = 'pending'
  );

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, user_type)
  values (new.id, new.email, new.raw_user_meta_data->>'user_type');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 