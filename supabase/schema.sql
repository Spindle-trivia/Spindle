-- Spindle: anonymous player results for the "better than X % of players" comparison.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to run again (it replaces the functions and keeps existing data).

create table if not exists public.plays (
  id          bigint generated always as identity primary key,
  day         integer     not null,            -- Spindle day number (#1 = day 0 = 26 Nov 2026, New York time)
  total       integer     not null check (total between 0 and 800),
  points      integer[]   not null,            -- points per track, 8 values 0–100
  rare_answer text        check (char_length(rare_answer) <= 60), -- normalised finale answer
  created_at  timestamptz not null default now()
);
create index if not exists plays_day_total on public.plays (day, total);
create index if not exists plays_day_rare  on public.plays (day, rare_answer);

-- No direct table access from the browser: RLS on, no policies.
-- The page only talks to the two functions below.
alter table public.plays enable row level security;
revoke all on public.plays from anon, authenticated;

-- Current Spindle day number, computed on the server in New York time.
create or replace function public.spindle_today() returns integer
language sql stable as $$
  select ((now() at time zone 'America/New_York')::date - date '2026-11-26')::integer;
$$;

-- Statistics for one day, as seen by a player with score p_total and finale answer p_rare.
create or replace function public.spindle_stats(p_day integer, p_total integer, p_rare text default null)
returns json
language sql stable security definer set search_path = public as $$
  with d as (select total, rare_answer from plays where day = p_day)
  select json_build_object(
    'players',  (select count(*) from d),
    'below',    (select count(*) from d where total < p_total),
    'same',     (select count(*) from d where total = p_total),
    'rare_same', case when p_rare is null or p_rare = '' then null
                      else (select count(*) from d where rare_answer = p_rare) end,
    -- score distribution in 100-point buckets: 0–99, 100–199, …, 700–799, 800
    'buckets',  (select array_agg(coalesce(c, 0) order by b)
                 from generate_series(0, 8) b
                 left join (select least(total / 100, 8) as k, count(*) c from d group by 1) x on x.k = b)
  );
$$;

-- Store one finished game and return the day's statistics.
create or replace function public.spindle_submit(p_day integer, p_points integer[], p_rare text default null)
returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  t integer;
  r text := nullif(left(lower(trim(coalesce(p_rare, ''))), 60), '');
begin
  -- only today's (or, just after midnight, yesterday's) quiz can be submitted
  if p_day not between spindle_today() - 1 and spindle_today() then
    raise exception 'invalid day';
  end if;
  if p_points is null or array_length(p_points, 1) <> 8
     or exists (select 1 from unnest(p_points) v where v is null or v < 0 or v > 100) then
    raise exception 'invalid points';
  end if;
  select sum(v) into t from unnest(p_points) v;
  insert into plays (day, total, points, rare_answer) values (p_day, t, p_points, r);
  return spindle_stats(p_day, t, r);
end;
$$;

revoke all on function public.spindle_stats(integer, integer, text) from public;
revoke all on function public.spindle_submit(integer, integer[], text) from public;
grant execute on function public.spindle_stats(integer, integer, text) to anon, authenticated;
grant execute on function public.spindle_submit(integer, integer[], text) to anon, authenticated;
grant execute on function public.spindle_today() to anon, authenticated;
