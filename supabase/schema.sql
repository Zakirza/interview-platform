create extension if not exists "uuid-ossp";

create table if not exists candidates (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  target_role text not null default 'Machine Learning Engineer',
  created_at timestamptz not null default now()
);

create table if not exists resume_documents (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  file_name text not null,
  mime_type text not null,
  storage_path text,
  parse_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists resume_sections (
  id uuid primary key default uuid_generate_v4(),
  resume_document_id uuid references resume_documents(id) on delete cascade,
  section_key text not null,
  kind text not null,
  title text not null,
  summary text not null,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists interview_sessions (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  resume_document_id uuid references resume_documents(id) on delete set null,
  role_target text not null default 'Machine Learning Engineer',
  current_phase int not null default 1,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists interview_messages (
  id uuid primary key default uuid_generate_v4(),
  interview_session_id uuid references interview_sessions(id) on delete cascade,
  phase_id int not null,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists phase_evaluations (
  id uuid primary key default uuid_generate_v4(),
  interview_session_id uuid references interview_sessions(id) on delete cascade,
  phase_id int not null,
  score numeric,
  max_score numeric not null,
  rubric jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists question_bank_items (
  id uuid primary key default uuid_generate_v4(),
  topic text not null,
  question text not null,
  answer_key text not null,
  source text not null,
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists final_reports (
  id uuid primary key default uuid_generate_v4(),
  interview_session_id uuid references interview_sessions(id) on delete cascade,
  aggregate_score numeric,
  max_score numeric,
  report jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists voice_events (
  id uuid primary key default uuid_generate_v4(),
  interview_session_id uuid references interview_sessions(id) on delete cascade,
  event_type text not null,
  severity numeric not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
