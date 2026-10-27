-- Infrastructure bootstrap only, not a business-table migration.
-- Password is assigned in memory by prepare-database-role.ts as a SCRAM verifier.
CREATE ROLE community_lab_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS;
COMMENT ON ROLE community_lab_runtime IS 'community-lab:runtime:step05';
GRANT CONNECT ON DATABASE postgres TO community_lab_runtime;
GRANT USAGE ON SCHEMA public TO community_lab_runtime;
REVOKE CREATE ON SCHEMA public FROM community_lab_runtime;
