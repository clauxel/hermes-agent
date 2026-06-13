\set ON_ERROR_STOP on

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hermes_dev') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', 'hermes_dev', :'dev_password');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L', 'hermes_dev', :'dev_password');
  END IF;
END
$$;

SELECT format('CREATE DATABASE %I OWNER %I', 'hermes_dev', 'hermes_dev')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'hermes_dev')
\gexec

SELECT format('ALTER DATABASE %I OWNER TO %I', 'hermes_dev', 'hermes_dev')
\gexec

\connect hermes_dev

ALTER SCHEMA public OWNER TO hermes_dev;
GRANT ALL ON SCHEMA public TO hermes_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hermes_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hermes_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO hermes_dev;

\connect postgres

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hermes_prod') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', 'hermes_prod', :'prod_password');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L', 'hermes_prod', :'prod_password');
  END IF;
END
$$;

SELECT format('CREATE DATABASE %I OWNER %I', 'hermes_prod', 'hermes_prod')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'hermes_prod')
\gexec

SELECT format('ALTER DATABASE %I OWNER TO %I', 'hermes_prod', 'hermes_prod')
\gexec

\connect hermes_prod

ALTER SCHEMA public OWNER TO hermes_prod;
GRANT ALL ON SCHEMA public TO hermes_prod;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hermes_prod;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hermes_prod;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO hermes_prod;
