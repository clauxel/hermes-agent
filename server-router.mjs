import { createHermesInstanceRouter } from './server-lib/hermes-instance-router.mjs'

const router = createHermesInstanceRouter()

await router.start()

console.log(
  JSON.stringify({
    host: router.host,
    port: router.port,
    routesDir: router.routesDir,
    status: 'listening',
  }),
)

const shutdown = async () => {
  await router.stop()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
