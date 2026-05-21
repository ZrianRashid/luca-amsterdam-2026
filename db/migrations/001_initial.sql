-- 001 — initial schema + seed. This is a convenience wrapper; equivalent to running
-- schema.sql then seed.sql in order. Keep numbered migrations forward-only.

\i ../schema.sql
\i ../seed.sql
