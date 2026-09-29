create extension if not exists pgcrypto;

create type public.user_role as enum ('worker','admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  public_id text unique not null,
  role public.user_role not null default 'worker',
  sector text,
  created_at timestamptz not null default now()
);

create table public.modules (
  id text primary key,
  title_en text not null,
  title_hi text not null,
  title_sat text not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  module_id text references public.modules(id) on delete cascade not null,
  type text not null default 'mcq',
  question_en text not null,
  question_hi text,
  question_sat text,
  options_en jsonb not null default '[]',
  options_hi jsonb not null default '[]',
  options_sat jsonb not null default '[]',
  correct_answers jsonb not null default '[]',
  explanation_en text,
  explanation_hi text,
  explanation_sat text,
  media_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references public.profiles(id) on delete cascade not null,
  module_id text references public.modules(id) not null,
  answers jsonb not null default '{}',
  score integer not null,
  total integer not null,
  percentage numeric(5,2) not null,
  status text not null default 'completed',
  attempt_id uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_no text unique not null,
  worker_id uuid references public.profiles(id) on delete cascade not null,
  submission_id uuid unique references public.submissions(id) on delete cascade not null,
  module_id text references public.modules(id) not null,
  score numeric(5,2) not null,
  language text not null check(language in ('en','hi','sat')),
  issued_at timestamptz not null default now(),
  revoked boolean not null default false
);

create table public.offline_sync (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references public.profiles(id) on delete cascade not null,
  client_id text unique not null,
  payload jsonb not null,
  synced_at timestamptz default now()
);

insert into public.modules values
('fire','Fire & Explosion Response','आग एवं विस्फोट प्रतिक्रिया','ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱵᱤᱥᱯᱷᱳᱨᱚᱱ',true,1),
('gas','Gas Leak & Confined Space','गैस रिसाव एवं सीमित स्थान','ᱜᱮᱥ ᱞᱤᱠ ᱟᱨ ᱥᱤᱢᱤᱛ ᱴᱷᱟᱶ',true,2),
('machine','Machinery Safety','मशीनरी सुरक्षा','ᱢᱮᱥᱤᱱ ᱥᱩᱨᱚᱠᱪᱷᱟ',true,3),
('electrical','Electrical Safety','विद्युत सुरक्षा','ᱵᱤᱡᱽᱞᱤ ᱥᱩᱨᱚᱠᱪᱷᱟ',true,4),
('ppe','PPE & Workplace Safety','पीपीई एवं कार्यस्थल सुरक्षा','PPE ᱟᱨ ᱠᱟᱹᱢᱤ ᱴᱷᱟᱶ',true,5)
on conflict do nothing;

alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;
alter table public.certificates enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from profiles
    where id=auth.uid() and role='admin'
  )
$$;

create policy "read own profile"
on profiles for select
using (id=auth.uid() or public.is_admin());

create policy "create own profile"
on profiles for insert
with check (id=auth.uid());

create policy "admin delete profiles"
on profiles for delete
using (public.is_admin());

create policy "authenticated modules read"
on modules for select
to authenticated
using (true);

create policy "questions read"
on questions for select
to authenticated
using (true);

create policy "admins insert questions"
on questions for insert
to authenticated
with check (public.is_admin());

create policy "admins update questions"
on questions for update
to authenticated
using (public.is_admin());

create policy "admins delete questions"
on questions for delete
to authenticated
using (public.is_admin());

create policy "workers read own submissions"
on submissions for select
using (worker_id=auth.uid() or public.is_admin());

create policy "workers submit own tests"
on submissions for insert
with check (worker_id=auth.uid());

create policy "admins delete submissions"
on submissions for delete
using (public.is_admin());

create policy "cert owner/admin read"
on certificates for select
using (worker_id=auth.uid() or public.is_admin());

create policy "admin certificate management"
on certificates for all
using (public.is_admin())
with check (public.is_admin());

create or replace view public.certificate_public
with (security_invoker = false)
as
select
 c.certificate_no,
 p.name as worker_name,
 p.public_id as worker_public_id,
 c.module_id,
 c.score,
 c.issued_at
from public.certificates c
join public.profiles p on p.id=c.worker_id
where c.revoked=false;

grant select on public.certificate_public to anon, authenticated;

alter publication supabase_realtime add table public.submissions;
alter publication supabase_realtime add table public.certificates;