-- Goals: track milestones and progress toward the future self
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists goals_updated_at_idx on public.goals (updated_at desc);

-- Enable RLS
alter table public.goals enable row level security;

-- RLS Policies
create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);
