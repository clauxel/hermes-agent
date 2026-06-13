import { join } from 'node:path'

function stripTrailingSlash(value) {
  return String(value ?? '').replace(/\/+$/, '')
}

export function normalizeHermesRouterInstanceName(value) {
  const instanceName = String(value ?? '').trim()
  if (!instanceName || !/^[a-z0-9][a-z0-9._-]{0,127}$/i.test(instanceName)) {
    throw new Error('Hermes router instance name is invalid.')
  }

  return instanceName
}

export function buildHermesRouterInstancePath(instanceName) {
  return `/instances/${encodeURIComponent(normalizeHermesRouterInstanceName(instanceName))}/`
}

export function buildHermesRouterConsoleUrl(baseUrl, instanceName) {
  const normalizedBaseUrl = stripTrailingSlash(baseUrl)
  if (!normalizedBaseUrl) {
    return ''
  }

  return `${normalizedBaseUrl}${buildHermesRouterInstancePath(instanceName)}`
}

export function buildHermesRouterRouteFileName(instanceName) {
  return `${normalizeHermesRouterInstanceName(instanceName)}.json`
}

export function buildHermesRouterRouteFilePath(routesDir, instanceName) {
  return join(String(routesDir ?? '').trim(), buildHermesRouterRouteFileName(instanceName))
}

export function buildHermesRouterRouteRecord({
  instanceName,
  consolePort,
  consoleHost = '127.0.0.1',
  serviceName = '',
  workspacePath = '',
  runtimeState = 'running',
}) {
  const normalizedInstanceName = normalizeHermesRouterInstanceName(instanceName)
  const normalizedConsolePort = Number.parseInt(String(consolePort ?? ''), 10)

  if (!Number.isInteger(normalizedConsolePort) || normalizedConsolePort <= 0) {
    throw new Error('Hermes router console port is invalid.')
  }

  return {
    instanceName: normalizedInstanceName,
    consoleHost: String(consoleHost ?? '').trim() || '127.0.0.1',
    consolePort: normalizedConsolePort,
    serviceName: String(serviceName ?? '').trim(),
    workspacePath: String(workspacePath ?? '').trim(),
    runtimeState: String(runtimeState ?? '').trim() || 'running',
    updatedAt: new Date().toISOString(),
  }
}
