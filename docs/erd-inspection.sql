-- STEP 04: current metadata only; no user rows or schema changes.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '5s';

-- 1. Connection context. Do not publish connection strings.
SELECT current_database() AS database_name, current_user AS inspection_role,
       current_setting('server_version') AS server_version,
       current_setting('transaction_read_only') AS read_only;

-- 2. Non-system schema inventory; counts are metadata, not user records.
SELECT n.nspname AS schema_name,
       count(c.oid) FILTER (WHERE c.relkind IN ('r', 'p'))::int AS table_count,
       count(c.oid) FILTER (WHERE c.relkind IN ('v', 'm'))::int AS view_count
FROM pg_namespace n
LEFT JOIN pg_class c ON c.relnamespace = n.oid
WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
GROUP BY n.nspname
ORDER BY n.nspname;

-- 3. Actual public relations. Empty rows mean none of these kinds exist.
SELECT c.relname AS relation_name, c.relkind AS relation_kind,
       c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
ORDER BY c.relname;

-- 4. Only the managed Auth identifier needed to read future references.
SELECT n.nspname AS schema_name, c.relname AS table_name, a.attname AS column_name,
       format_type(a.atttypid, a.atttypmod) AS data_type,
       a.attnotnull AS not_null,
       EXISTS (
         SELECT 1 FROM pg_constraint k
         WHERE k.conrelid = c.oid AND k.contype = 'p' AND a.attnum = ANY(k.conkey)
       ) AS part_of_primary_key
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid
WHERE n.nspname = 'auth' AND c.relname = 'users'
  AND a.attname = 'id' AND a.attnum > 0 AND NOT a.attisdropped;

-- 5. The actual primary-key definition, not an inferred relationship.
SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS definition,
       convalidated AS validated
FROM pg_constraint
WHERE conrelid = to_regclass('auth.users') AND contype = 'p';

COMMIT;
