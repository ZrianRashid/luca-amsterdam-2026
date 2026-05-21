# LUCA — Database

Postgres on Supabase. Apply order:

1. `schema.sql` — tables, indexes, triggers, RLS policies, helper functions.
2. `seed.sql` — services + addons. Idempotent — re-runnable.

```bash
# via Supabase SQL editor
# paste schema.sql, run, then paste seed.sql, run.

# or via psql + a connection string
psql "$DATABASE_URL" -f schema.sql
psql "$DATABASE_URL" -f seed.sql
```

## Migrations

Numbered SQL files in `migrations/`. Forward-only. Each migration is idempotent (uses `if not exists`, `do $$ begin ... exception ... end $$`, or upserts).

## Promote a user to admin

After a Supabase Auth signup:

```sql
insert into admin_profiles (id, full_name, role)
values ('<auth.users.id>', 'Your name', 'admin');
```

## Resetting (dev only)

```sql
truncate bookings, customers, import_jobs, hermes_activity, hermes_agents restart identity cascade;
```

`services` and `addons` are seeded — re-run `seed.sql` if you blew them away.
