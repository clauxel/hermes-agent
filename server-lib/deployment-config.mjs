import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'

function toPosixPath(value) {
  return value.replace(/\\/g, '/')
}

function firstDefined(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function normalizeConfiguredValue(value) {
  if (typeof value !== 'string') {
    return ''
  }

  let normalized = value.trim()

  while (
    normalized.length >= 2 &&
    ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1).trim()
  }

  return normalized
}

function normalizePrivateKeyValue(value) {
  const normalized = normalizeConfiguredValue(value)
  if (!normalized) {
    return ''
  }

  return normalized.replace(/\\n/g, '\n')
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function resolveConfigPath(configPath) {
  return resolve(configPath)
}

function resolveFileValue(configDirectory, value, fallback) {
  const source = typeof value === 'string' && value.trim() ? value.trim() : fallback
  if (!source) {
    return fallback
  }

  return isAbsolute(source) ? source : resolve(configDirectory, source)
}

function resolveServerPrivateKey(configDirectory) {
  const inlinePrivateKey = firstDefined(
    process.env.HERMES_DEPLOY_PRIVATE_KEY,
    process.env.HERMES_SERVER_PRIVATE_KEY,
  )
  if (inlinePrivateKey) {
    return {
      privateKey: normalizePrivateKeyValue(inlinePrivateKey),
      privateKeyPath: '',
      privateKeyPassphrase: firstDefined(
        process.env.HERMES_DEPLOY_PRIVATE_KEY_PASSPHRASE,
        process.env.HERMES_SERVER_PRIVATE_KEY_PASSPHRASE,
      ),
    }
  }

  const configuredPrivateKeyPath = firstDefined(
    process.env.HERMES_DEPLOY_PRIVATE_KEY_PATH,
    process.env.HERMES_SERVER_PRIVATE_KEY_PATH,
  )
  if (!configuredPrivateKeyPath) {
    return {
      privateKey: '',
      privateKeyPath: '',
      privateKeyPassphrase: '',
    }
  }

  const resolvedPrivateKeyPath = resolveFileValue(configDirectory, configuredPrivateKeyPath, '')
  if (!resolvedPrivateKeyPath || !existsSync(resolvedPrivateKeyPath)) {
    return {
      privateKey: '',
      privateKeyPath: resolvedPrivateKeyPath,
      privateKeyPassphrase: '',
    }
  }

  return {
    privateKey: readFileSync(resolvedPrivateKeyPath, 'utf8'),
    privateKeyPath: resolvedPrivateKeyPath,
    privateKeyPassphrase: firstDefined(
      process.env.HERMES_DEPLOY_PRIVATE_KEY_PASSPHRASE,
      process.env.HERMES_SERVER_PRIVATE_KEY_PASSPHRASE,
    ),
  }
}

function sanitizeRawConfig(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return {
      rawConfig,
      changed: false,
    }
  }

  const hermes = rawConfig.hermes && typeof rawConfig.hermes === 'object'
    ? rawConfig.hermes
    : null

  if (!hermes) {
    return {
      rawConfig,
      changed: false,
    }
  }

  const normalizedRepoUrl = normalizeConfiguredValue(hermes.repoUrl) || 'https://github.com/NousResearch/hermes-agent.git'
  const normalizedRepoRef = normalizeConfiguredValue(hermes.repoRef) || 'v2026.4.8'
  const normalizedSourceType = hermes.sourceType === 'archive' ? 'archive' : 'git'
  const normalizedArchiveUrl = normalizeConfiguredValue(hermes.archiveUrl)
  const normalizedArchivePath = normalizeConfiguredValue(hermes.archivePath)
  const repoUrlChanged = typeof hermes.repoUrl === 'string' && hermes.repoUrl !== normalizedRepoUrl
  const repoRefChanged = typeof hermes.repoRef === 'string' && hermes.repoRef !== normalizedRepoRef
  const sourceTypeChanged = typeof hermes.sourceType === 'string' && hermes.sourceType !== normalizedSourceType
  const archiveUrlChanged = typeof hermes.archiveUrl === 'string' && hermes.archiveUrl !== normalizedArchiveUrl
  const archivePathChanged = typeof hermes.archivePath === 'string' && hermes.archivePath !== normalizedArchivePath

  if (!repoUrlChanged && !repoRefChanged && !sourceTypeChanged && !archiveUrlChanged && !archivePathChanged) {
    return {
      rawConfig,
      changed: false,
    }
  }

  return {
    rawConfig: {
      ...rawConfig,
      hermes: {
        ...hermes,
        repoUrl: normalizedRepoUrl,
        repoRef: normalizedRepoRef,
        sourceType: normalizedSourceType,
        archiveUrl: normalizedArchiveUrl,
        archivePath: normalizedArchivePath,
      },
    },
    changed: true,
  }
}

function ensureConfigFile(configPath) {
  if (existsSync(configPath)) {
    return
  }

  mkdirSync(dirname(configPath), { recursive: true })
  writeFileSync(
    configPath,
    JSON.stringify(
      {
        deployment: {
          provider: 'mock',
          targetServer: 'mock-hermes-server',
          consoleBaseUrl: 'https://console.hermes.local',
          publicBaseUrl: 'https://hermes.local',
          mockRootDir: './data/mock-remote',
        },
        hermes: {
          repoUrl: 'https://github.com/hermes/hermes.git',
          repoRef: 'main',
          sourceType: 'git',
          archiveUrl: '',
          archivePath: '',
          baseDir: '/srv/hermes',
          servicePrefix: 'hermes',
          runtimeUserPrefix: 'ocl',
          installCommand: 'npm install --no-audit --no-fund',
          buildCommand:
            'export NODE_OPTIONS=--max-old-space-size=1536 && pnpm canvas:a2ui:bundle && node scripts/tsdown-build.mjs && node scripts/runtime-postbuild.mjs && node scripts/build-stamp.mjs && node --import tsx scripts/canvas-a2ui-copy.ts && node --import tsx scripts/copy-hook-metadata.ts && node --import tsx scripts/copy-export-html-templates.ts && node --import tsx scripts/write-build-info.ts && node --import tsx scripts/write-cli-startup-metadata.ts && node --import tsx scripts/write-cli-compat.ts',
          startCommand: 'hermes gateway run --allow-unconfigured --bind lan --port "$PORT" --token "$HERMES_GATEWAY_TOKEN" --force',
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

function readRawConfig(configPath) {
  const resolvedConfigPath = resolveConfigPath(configPath)
  ensureConfigFile(resolvedConfigPath)
  const parsedConfig = JSON.parse(readFileSync(resolvedConfigPath, 'utf8'))
  const { rawConfig, changed } = sanitizeRawConfig(parsedConfig)

  if (changed) {
    writeFileSync(resolvedConfigPath, JSON.stringify(rawConfig, null, 2))
  }

  return {
    configPath: resolvedConfigPath,
    rawConfig,
  }
}

function normalizeConfig(configPath, rawConfig, encryptionSecret) {
  const configDirectory = dirname(configPath)
  const provider = rawConfig?.deployment?.provider === 'ssh' ? 'ssh' : 'mock'
  const configuredRepoUrl = normalizeConfiguredValue(rawConfig?.hermes?.repoUrl)
  const configuredRepoRef = normalizeConfiguredValue(rawConfig?.hermes?.repoRef)
  const configuredSourceType = rawConfig?.hermes?.sourceType === 'archive' ? 'archive' : 'git'
  const configuredArchiveUrl = normalizeConfiguredValue(rawConfig?.hermes?.archiveUrl)
  const configuredArchivePath = normalizeConfiguredValue(rawConfig?.hermes?.archivePath)
  const serverHost = firstDefined(
    process.env.HERMES_DEPLOY_HOST,
    process.env.HERMES_SERVER_IP,
    process.env.HERMES_SERVER_HOST,
  ) || '127.0.0.1'
  const serverPort = parsePositiveInteger(
    firstDefined(process.env.HERMES_DEPLOY_PORT),
    22,
  )
  const serverUsername = firstDefined(
    process.env.HERMES_DEPLOY_USERNAME,
    process.env.HERMES_SERVER_USERNAME,
  ) || 'root'
  const routerBaseUrl = firstDefined(
    process.env.HERMES_ROUTER_BASE_URL,
    rawConfig?.deployment?.routerBaseUrl,
  )
  const routerRoutesDir = resolveFileValue(
    configDirectory,
    firstDefined(
      process.env.HERMES_ROUTER_ROUTES_DIR,
      rawConfig?.deployment?.routerRoutesDir,
    ),
    '/data/hermes/router/routes',
  )
  const serverPassword = firstDefined(
    process.env.HERMES_DEPLOY_ROOT_PASSWORD,
    process.env.HERMES_ROOT_PASSWORD,
    process.env.HERMES_DEPLOY_PASSWORD,
  )
  const {
    privateKey: serverPrivateKey,
    privateKeyPath: serverPrivateKeyPath,
    privateKeyPassphrase: serverPrivateKeyPassphrase,
  } = resolveServerPrivateKey(configDirectory)
  const mockRootDir = resolveFileValue(configDirectory, rawConfig?.deployment?.mockRootDir, join(configDirectory, 'data', 'mock-remote'))

  return {
    path: configPath,
    provider,
    deployment: {
      provider,
      targetServer:
        typeof rawConfig?.deployment?.targetServer === 'string' && rawConfig.deployment.targetServer.trim()
          ? rawConfig.deployment.targetServer.trim()
          : provider === 'ssh'
            ? serverHost || 'ssh-hermes-server'
            : 'mock-hermes-server',
      consoleBaseUrl:
        typeof rawConfig?.deployment?.consoleBaseUrl === 'string' && rawConfig.deployment.consoleBaseUrl.trim()
          ? rawConfig.deployment.consoleBaseUrl.trim()
          : 'https://console.hermes.local',
      publicBaseUrl:
        typeof rawConfig?.deployment?.publicBaseUrl === 'string' && rawConfig.deployment.publicBaseUrl.trim()
          ? rawConfig.deployment.publicBaseUrl.trim()
          : 'https://hermes.local',
      mockRootDir,
    },
    server: {
      host: serverHost,
      port: serverPort,
      username: serverUsername,
      password: serverPassword,
      privateKey: serverPrivateKey,
      privateKeyPath: serverPrivateKeyPath,
      privateKeyPassphrase: serverPrivateKeyPassphrase,
    },
    router: {
      baseUrl: routerBaseUrl,
      routesDir: routerRoutesDir,
    },
    hermes: {
      sourceType: configuredSourceType,
      archiveUrl: configuredArchiveUrl,
      archivePath: configuredArchivePath,
      repoUrl: configuredRepoUrl || 'https://github.com/NousResearch/hermes-agent.git',
      repoRef: configuredRepoRef || 'main',
      baseDir:
        typeof rawConfig?.hermes?.baseDir === 'string' && rawConfig.hermes.baseDir.trim()
          ? toPosixPath(rawConfig.hermes.baseDir.trim())
          : '/srv/hermes',
      servicePrefix:
        typeof rawConfig?.hermes?.servicePrefix === 'string' && rawConfig.hermes.servicePrefix.trim()
          ? rawConfig.hermes.servicePrefix.trim()
          : 'hermes',
      runtimeUserPrefix:
        typeof rawConfig?.hermes?.runtimeUserPrefix === 'string' && rawConfig.hermes.runtimeUserPrefix.trim()
          ? rawConfig.hermes.runtimeUserPrefix.trim()
          : 'hms',
      installCommand:
        typeof rawConfig?.hermes?.installCommand === 'string'
          ? rawConfig.hermes.installCommand.trim()
          : "pip install --user -e '.[messaging,cron,pty,mcp]'",
      buildCommand:
        typeof rawConfig?.hermes?.buildCommand === 'string'
          ? rawConfig.hermes.buildCommand.trim()
          : 'true',
      startCommand:
        typeof rawConfig?.hermes?.startCommand === 'string'
          ? rawConfig.hermes.startCommand.trim()
          : 'hermes gateway run',
      tokenEnvName:
        typeof rawConfig?.hermes?.tokenEnvName === 'string' && rawConfig.hermes.tokenEnvName.trim()
          ? rawConfig.hermes.tokenEnvName.trim()
          : 'COMMUNICATION_TOKEN',
      modelEnvName:
        typeof rawConfig?.hermes?.modelEnvName === 'string' && rawConfig.hermes.modelEnvName.trim()
          ? rawConfig.hermes.modelEnvName.trim()
          : 'HERMES_MODEL_ID',
      channelEnvName:
        typeof rawConfig?.hermes?.channelEnvName === 'string' && rawConfig.hermes.channelEnvName.trim()
          ? rawConfig.hermes.channelEnvName.trim()
          : 'HERMES_CHANNEL_ID',
      planEnvName:
        typeof rawConfig?.hermes?.planEnvName === 'string' && rawConfig.hermes.planEnvName.trim()
          ? rawConfig.hermes.planEnvName.trim()
          : 'HERMES_PLAN_ID',
    },
  }
}

export function loadDeploymentConfig({
  configPath,
  encryptionSecret,
}) {
  const { configPath: resolvedConfigPath, rawConfig } = readRawConfig(configPath)
  return normalizeConfig(resolvedConfigPath, rawConfig, encryptionSecret)
}

export function readConfiguredHermesRepoRef(configPath) {
  const { rawConfig } = readRawConfig(configPath)
  return normalizeConfiguredValue(rawConfig?.hermes?.repoRef) || 'main'
}
