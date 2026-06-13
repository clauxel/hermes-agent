import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { startTestServer } from './helpers/server-test-support.mjs'

const tempDirectories = new Set()

after(() => {
  for (const directory of tempDirectories) {
    rmSync(directory, { recursive: true, force: true })
  }
})

function createTempDirectory(prefix) {
  const directory = mkdtempSync(join(tmpdir(), prefix))
  tempDirectories.add(directory)
  return directory
}

function createTestConfig(configPath) {
  writeFileSync(
    configPath,
    JSON.stringify(
      {
        deployment: {
          provider: 'mock',
          targetServer: 'mock-node',
          consoleBaseUrl: 'https://console.example.test',
          publicBaseUrl: 'https://public.example.test',
          mockRootDir: './mock-remote',
        },
        server: {
          host: '127.0.0.1',
          port: 22,
          username: 'root',
          password: '',
        },
        hermes: {
          repoUrl: 'https://github.com/hermes/hermes.git',
          repoRef: 'main',
          baseDir: '/srv/hermes',
          servicePrefix: 'hermes',
          runtimeUserPrefix: 'ocl',
          installCommand: 'npm install --no-audit --no-fund',
          buildCommand: 'echo build',
          startCommand: 'echo start',
          tokenEnvName: 'COMMUNICATION_TOKEN',
          modelEnvName: 'HERMES_MODEL_ID',
          channelEnvName: 'HERMES_CHANNEL_ID',
          planEnvName: 'HERMES_PLAN_ID',
        },
      },
      null,
      2,
    ),
  )
}

test('route HTML responses keep per-page SEO even when crawlers send */* accepts', async () => {
  const tempDir = createTempDirectory('hermes-seo-')
  const configPath = join(tempDir, 'hermes-agent.config.json')
  createTestConfig(configPath)

  const port = 4318
  const server = await startTestServer({
    port,
    configPath,
    env: {
      APP_ORIGIN: `http://localhost:${port}`,
      NODE_ENV: 'production',
    },
  })

  try {
    const plansResponse = await fetch(`http://localhost:${port}/plans`)
    const plansHtml = await plansResponse.text()

    assert.equal(plansResponse.status, 200)
    assert.match(plansHtml, /<title>Pricing Plans \| Hermes Agent<\/title>/)
    assert.match(plansHtml, /<meta name="robots" content="index,follow" \/>/)
    assert.match(plansHtml, new RegExp(`<link rel="canonical" href="http://localhost:${port}/plans" \\/>`))
    assert.equal(plansResponse.headers.get('x-robots-tag'), 'index,follow')

    const consoleResponse = await fetch(`http://localhost:${port}/console`)
    const consoleHtml = await consoleResponse.text()

    assert.equal(consoleResponse.status, 200)
    assert.match(consoleHtml, /<title>Console \| Hermes Agent<\/title>/)
    assert.match(consoleHtml, /<meta name="robots" content="noindex,nofollow" \/>/)
    assert.equal(consoleResponse.headers.get('x-robots-tag'), 'noindex,nofollow')
  } finally {
    await server.stop()
  }
})
