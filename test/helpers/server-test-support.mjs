import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getMemoryPostgresDatabase,
  getOrCreateMemoryPostgresAdapter,
  resetMemoryPostgresAdapter,
} from '../../server-lib/postgres-memory-adapter.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..', '..')

function snapshotEnvironment() {
  return new Map(Object.entries(process.env))
}

function restoreEnvironment(snapshot) {
  for (const key of Object.keys(process.env)) {
    if (!snapshot.has(key)) {
      delete process.env[key]
    }
  }

  for (const [key, value] of snapshot.entries()) {
    process.env[key] = value
  }
}

export async function startTestServer({
  port,
  configPath,
  env = {},
  memoryId: providedMemoryId,
  resetDatabase = true,
}) {
  const environmentSnapshot = snapshotEnvironment()
  const memoryId = providedMemoryId ?? `hermes-test-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const runId = `run-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const serverModuleUrl = new URL(`../../server.mjs?test=${encodeURIComponent(runId)}`, import.meta.url)

  if (resetDatabase) {
    resetMemoryPostgresAdapter(memoryId)
  }

  Object.assign(process.env, {
    PORT: String(port),
    HERMES_CONFIG_PATH: configPath,
    HERMES_POSTGRES_DRIVER: 'memory',
    HERMES_POSTGRES_MEMORY_ID: memoryId,
    HERMES_TOKEN_SECRET: env.HERMES_TOKEN_SECRET ?? 'test-secret',
    ...env,
  })

  const serverModule = await import(serverModuleUrl.href)
  await serverModule.serverReady

  return {
    memoryId,
    getDatabase: () => getMemoryPostgresDatabase(memoryId),
    createPool: () => new (getOrCreateMemoryPostgresAdapter(memoryId).Pool)(),
    stop: async () => {
      await serverModule.stopHermesAgentServer()
      restoreEnvironment(environmentSnapshot)
    },
  }
}

export { projectRoot }
