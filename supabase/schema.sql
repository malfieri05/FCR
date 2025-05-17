-- Create tables for Reppy Route platform

-- Users table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  user_type text not null check (user_type in ('admin', 'agency', 'agent', 'servicer')),
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Agencies table
create table agencies (
  id uuid references profiles(id) on delete cascade primary key,
  business_name text not null,
  business_address text,
  business_phone text,
  business_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'restricted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Agents table
create table agents (
  id uuid references profiles(id) on delete cascade primary key,
  agency_id uuid references agencies(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Servicers table
create table servicers (
  id uuid references profiles(id) on delete cascade primary key,
  business_name text not null,
  business_address text,
  business_phone text,
  business_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'restricted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Campaigns table
create table campaigns (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references agencies(id) on delete cascade not null,
  title text not null,
  description text,
  industry text not null,
  location text not null,
  lead_criteria jsonb not null,
  price_per_lead decimal(10,2) not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leads table
create table leads (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  agent_id uuid references agents(id) on delete cascade not null,
  servicer_id uuid references servicers(id),
  lead_data jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'sold', 'rejected')),
  sold_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table agencies enable row level security;
alter table agents enable row level security;
alter table servicers enable row level security;
alter table campaigns enable row level security;
alter table leads enable row level security;

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

-- Agencies policies
create policy "Agencies are viewable by everyone"
  on agencies for select
  using (true);

create policy "Agencies can insert their own record"
  on agencies for insert
  with check (auth.uid() = id);

create policy "Agencies can update their own record"
  on agencies for update
  using (auth.uid() = id);

-- Agents policies
create policy "Agents are viewable by their agency"
  on agents for select
  using (
    exists (
      select 1 from agencies
      where id = agents.agency_id
      and id = auth.uid()
    )
  );

create policy "Agencies can manage their agents"
  on agents for all
  using (
    exists (
      select 1 from agencies
      where id = agents.agency_id
      and id = auth.uid()
    )
  );

-- Servicers policies
create policy "Servicers are viewable by everyone"
  on servicers for select
  using (true);

create policy "Servicers can insert their own record"
  on servicers for insert
  with check (auth.uid() = id);

create policy "Servicers can update their own record"
  on servicers for update
  using (auth.uid() = id);

-- Campaigns policies
create policy "Campaigns are viewable by everyone"
  on campaigns for select
  using (true);

create policy "Agencies can manage their campaigns"
  on campaigns for all
  using (
    exists (
      select 1 from agencies
      where id = campaigns.agency_id
      and id = auth.uid()
    )
  );

-- Leads policies
create policy "Leads are viewable by their agency and servicer"
  on leads for select
  using (
    exists (
      select 1 from campaigns
      where id = leads.campaign_id
      and agency_id = auth.uid()
    )
    or
    leads.servicer_id = auth.uid()
  );

create policy "Agents can create leads"
  on leads for insert
  with check (
    exists (
      select 1 from agents
      where id = auth.uid()
      and agency_id = (
        select agency_id from campaigns where id = leads.campaign_id
      )
    )
  );

create policy "Servicers can purchase leads"
  on leads for update
  using (
    servicer_id = auth.uid()
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