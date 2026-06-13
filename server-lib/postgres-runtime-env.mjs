export function buildPostgresRuntimeEnvironment(environment = process.env) {
  const databasePassword = String(environment.HERMES_POSTGRES_PASSWORD ?? '').trim()
  if (!databasePassword) {
    return null
  }

  const databaseHost = String(environment.HERMES_POSTGRES_HOST ?? '127.0.0.1').trim() || '127.0.0.1'
  const databasePortValue = Number.parseInt(String(environment.HERMES_POSTGRES_PORT ?? '5432').trim(), 10)
  const databasePort = Number.isFinite(databasePortValue) && databasePortValue > 0 ? databasePortValue : 5432
  const databaseName = String(environment.HERMES_POSTGRES_DB ?? 'hermes_app').trim() || 'hermes_app'
  const databaseUser = String(environment.HERMES_POSTGRES_USER ?? 'hermes_app').trim() || 'hermes_app'
  const databaseSslMode = String(environment.HERMES_POSTGRES_SSLMODE ?? '').trim()
  const databaseUrl = new URL(
    `postgresql://${encodeURIComponent(databaseUser)}:${encodeURIComponent(databasePassword)}@${databaseHost}:${databasePort}/${encodeURIComponent(databaseName)}`,
  )

  if (databaseSslMode) {
    databaseUrl.searchParams.set('sslmode', databaseSslMode)
  }

  return {
    DATABASE_PROVIDER: 'postgresql',
    DATABASE_URL: databaseUrl.toString(),
    DB_SINGLETON_ENABLED: 'true',
    DB_MAX_CONNECTIONS: '1',
    DB_SCHEMA: 'public',
    DB_MIGRATIONS_SCHEMA: 'drizzle',
    DB_MIGRATIONS_TABLE: '__drizzle_migrations',
    DB_MIGRATIONS_OUT: './src/config/db/migrations',
  }
}
