import { handlePolarCheckout, isPolarCheckoutConfigured } from './polar.js'

const CANONICAL_ORIGIN = 'https://hermesagent.studio'
const CANONICAL_HOSTS = new Set([
  'hermesagent.studio',
  'www.hermesagent.studio',
  'hermes-agent.space',
  'www.hermes-agent.space',
])
const annualBillingMultiplier = 0.65
const modelDiscountMultiplier = 0.5

const planCatalog = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPriceLabel: '$9',
    monthlyAmountCents: 900,
    currency: 'USD',
    subtitle: 'Best for first-time launches',
    etaMinutes: 12,
    includedDeployments: 1,
    bullets: ['1 Hermes instance', '1 default model', '1 connected channel'],
    featured: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPriceLabel: '$29',
    monthlyAmountCents: 2900,
    currency: 'USD',
    subtitle: 'Best value for repeat launches',
    etaMinutes: 8,
    includedDeployments: 5,
    bullets: ['5 Hermes instances', 'Lower cost per launch', 'Made for recurring launches'],
    featured: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    monthlyPriceLabel: '$79',
    monthlyAmountCents: 7900,
    currency: 'USD',
    subtitle: 'Built for high-volume teams',
    etaMinutes: 5,
    includedDeployments: 20,
    bullets: ['20 Hermes instances', 'Highest launch capacity', 'Best for large launch batches'],
    featured: false,
  },
]

const modelCatalog = [
  { id: 'gemini-3-1-pro', name: 'Gemini 3.1 Pro', status: 'Feb 2026' },
  { id: 'gpt-5-4', name: 'GPT-5.4', status: 'Mar 2026' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', status: 'Feb 2026' },
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    status: 'Feb 2026',
    discountMultiplier: modelDiscountMultiplier,
    discountLabel: '50% off',
    discountTooltip: 'Choose this model and get 50% off the package price.',
  },
  {
    id: 'glm-4-7',
    name: 'GLM-4.7',
    status: 'Jan 2026',
    discountMultiplier: modelDiscountMultiplier,
    discountLabel: '50% off',
    discountTooltip: 'Choose this model and get 50% off the package price.',
  },
  {
    id: 'glm-5-1',
    name: 'GLM-5.1',
    status: 'Apr 2026',
    discountMultiplier: modelDiscountMultiplier,
    discountLabel: '50% off',
    discountTooltip: 'Choose this model and get 50% off the package price.',
  },
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    status: 'Nov 2025',
    discountMultiplier: modelDiscountMultiplier,
    discountLabel: '50% off',
    discountTooltip: 'Choose this model and get 50% off the package price.',
  },
  {
    id: 'gpt-4-1',
    name: 'GPT-4.1',
    status: 'Apr 2025',
    discountMultiplier: modelDiscountMultiplier,
    discountLabel: '50% off',
    discountTooltip: 'Choose this model and get 50% off the package price.',
  },
]

const channelCatalog = [
  { id: 'telegram', name: 'Telegram', status: 'Available' },
  { id: 'discord', name: 'Discord', status: 'Available' },
  { id: 'whatsapp', name: 'WhatsApp', status: 'Available' },
]

const indexablePaths = [
  '/',
  '/compare/hermes-vs-chatbots',
  '/compare/hermes-vs-workflow-bots',
  '/solutions/personal-agent',
  '/solutions/digital-employee',
  '/solutions/task-automation',
  '/pricing',
  '/persistent-ai-agent',
  '/ai-agent-memory',
  '/agent-workflow-automation',
  '/plans',
  '/privacy',
  '/terms',
]
const staticHtmlPaths = new Set(['/pricing', '/persistent-ai-agent', '/ai-agent-memory', '/agent-workflow-automation'])
const appRoutePaths = new Set([...indexablePaths, '/checkout', '/console'])

const productCache = new Map()

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

function securityHeaders() {
  return new Headers({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  })
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers)
  for (const [key, value] of securityHeaders()) headers.set(key, value)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  const headers = securityHeaders()
  headers.set('Content-Type', 'application/json; charset=utf-8')
  headers.set('Cache-Control', 'no-store')
  for (const [key, value] of Object.entries(extraHeaders)) headers.set(key, value)
  return new Response(JSON.stringify(data), { status, headers })
}

function xmlResponse(body) {
  const headers = securityHeaders()
  headers.set('Content-Type', 'application/xml; charset=utf-8')
  headers.set('Cache-Control', 'public, max-age=3600')
  return new Response(body, { status: 200, headers })
}

function textResponse(body) {
  const headers = securityHeaders()
  headers.set('Content-Type', 'text/plain; charset=utf-8')
  headers.set('Cache-Control', 'public, max-age=3600')
  return new Response(body, { status: 200, headers })
}

function noIndexNotFoundResponse() {
  const headers = securityHeaders()
  headers.set('Content-Type', 'text/html; charset=utf-8')
  headers.set('Cache-Control', 'no-store')
  headers.set('X-Robots-Tag', 'noindex, nofollow')
  return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Page not found</title></head><body><main><h1>Page not found</h1><p>This URL is not a public page for Hermes Agent.</p></main></body></html>', { status: 404, headers })
}

function normalizePath(pathname) {
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
}

function isFileAssetPath(pathname) {
  return pathname.startsWith('/assets/') || pathname.startsWith('/_next/') || /\.[a-z0-9]{2,12}$/i.test(pathname)
}

function buildSitemap() {
  const now = new Date().toISOString()
  const urls = indexablePaths.map((path) => {
    const priority = path === '/' ? '1.0' : path === '/privacy' || path === '/terms' ? '0.4' : '0.9'
    return [
      '  <url>',
      `    <loc>${CANONICAL_ORIGIN}${path === '/' ? '/' : path}</loc>`,
      `    <lastmod>${now}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

function formatMoney(amountCents, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100)
}

function serializePlan(plan) {
  const annualAmountCents = Math.round(plan.monthlyAmountCents * 12 * annualBillingMultiplier)
  return {
    id: plan.id,
    name: plan.name,
    monthlyPriceLabel: plan.monthlyPriceLabel,
    monthlyAmountCents: plan.monthlyAmountCents,
    annualAmountCents,
    annualPriceLabel: formatMoney(annualAmountCents, plan.currency),
    currency: plan.currency,
    subtitle: plan.subtitle,
    etaMinutes: plan.etaMinutes,
    includedDeployments: plan.includedDeployments,
    bullets: plan.bullets,
    featured: plan.featured,
  }
}

function getModelById(modelId) {
  const model = modelCatalog.find((item) => item.id === modelId)
  if (!model) throw new HttpError(400, 'Model is not supported.')
  return model
}

function getChannelById(channelId) {
  const channel = channelCatalog.find((item) => item.id === channelId)
  if (!channel) throw new HttpError(400, 'Channel is not supported.')
  return channel
}

function resolvePlanSelection(planSelectionId, options = {}) {
  const [basePlanId, requestedCycle] = String(planSelectionId || 'growth:monthly').split(':')
  const billingCycle = requestedCycle === 'annual' ? 'annual' : 'monthly'
  const plan = planCatalog.find((item) => item.id === basePlanId)
  if (!plan) throw new HttpError(400, 'Plan is not supported.')

  const baseAmountCents =
    billingCycle === 'annual'
      ? Math.round(plan.monthlyAmountCents * 12 * annualBillingMultiplier)
      : plan.monthlyAmountCents
  const model = options.model || (options.modelId ? getModelById(String(options.modelId)) : null)
  const multiplier = Number(model?.discountMultiplier)
  const hasDiscount = Number.isFinite(multiplier) && multiplier > 0 && multiplier < 1
  const amountCents = hasDiscount ? Math.max(1, Math.round(baseAmountCents * multiplier)) : baseAmountCents

  return {
    plan,
    billingCycle,
    planId: `${plan.id}:${billingCycle}`,
    baseAmountCents,
    amountCents,
    discountAmountCents: baseAmountCents - amountCents,
    discountLabel: hasDiscount ? model.discountLabel || `${Math.round((1 - multiplier) * 100)}% off` : null,
    discountMultiplier: hasDiscount ? multiplier : 1,
    priceLabel: formatMoney(amountCents, plan.currency),
    cycleLabel: billingCycle === 'annual' ? '/yr' : '/mo',
  }
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function buildOrderNumber() {
  return `HERMES-${Date.now().toString(36).toUpperCase()}-${randomHex(3).toUpperCase()}`
}

function encodeBase64Url(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new TextDecoder().decode(bytes)
}

async function readBindingValue(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value.get === 'function') {
    const resolved = await value.get()
    return typeof resolved === 'string' ? resolved.trim() : ''
  }
  return ''
}

async function getPaymentKey(env) {
  for (const name of ['API_PROD_KEY', 'POLAR_API_KEY', 'POLAR_KEY']) {
    const value = await readBindingValue(env[name])
    if (value) return value
  }
  return ''
}

async function getSigningSecret(env) {
  const configuredSecret = await readBindingValue(env.HERMES_TOKEN_SECRET)
  if (configuredSecret) return configuredSecret
  const paymentKey = await getPaymentKey(env)
  if (paymentKey) return paymentKey
  throw new HttpError(503, 'Polar payment is not configured.')
}

async function createSignature(secret, encodedPayload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encodedPayload))
  return encodeBase64Url(new Uint8Array(signature))
}

function constantTimeEqual(left, right) {
  if (!left || !right || left.length !== right.length) return false
  let result = 0
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return result === 0
}

async function signOrderPayload(payload, env) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = await createSignature(await getSigningSecret(env), encodedPayload)
  return `${encodedPayload}.${signature}`
}

async function verifyOrderToken(token, env) {
  const [encodedPayload, signature, ...extra] = String(token || '').split('.')
  if (!encodedPayload || !signature || extra.length > 0) throw new HttpError(403, 'Order access denied.')

  const expectedSignature = await createSignature(await getSigningSecret(env), encodedPayload)
  if (!constantTimeEqual(signature, expectedSignature)) throw new HttpError(403, 'Order access denied.')

  const payload = JSON.parse(decodeBase64Url(encodedPayload))
  if (!payload || payload.v !== 1 || !payload.id) throw new HttpError(403, 'Order access denied.')
  return payload
}

function getGuestToken(request, url) {
  return request.headers.get('x-hermes-guest-token') || url.searchParams.get('guest_token') || ''
}

async function readJsonBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return {}
  const text = await request.text()
  if (!text.trim()) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.')
  }
}

function getPublicOrigin(request) {
  const url = new URL(request.url)
  if (CANONICAL_HOSTS.has(url.hostname)) return `${url.protocol}//${url.host}`
  return CANONICAL_ORIGIN
}

function serializeOrder(row, guestToken, overrides = {}) {
  const model = getModelById(row.modelId)
  const channel = getChannelById(row.channelId)
  const planSelection = resolvePlanSelection(row.planId, { model })
  const paymentStatus = overrides.paymentStatus || row.paymentStatus || 'pending'
  const statusMessage =
    overrides.statusMessage ||
    row.statusMessage ||
    'Awaiting payment confirmation before deployment starts.'
  const guestTokenQuery = guestToken ? `&guest_token=${encodeURIComponent(guestToken)}` : ''
  const deploymentsUsed = 0
  const includedDeployments = row.includedDeployments || planSelection.plan.includedDeployments

  return {
    id: row.id,
    orderNumber: row.orderNumber,
    planId: planSelection.planId,
    planName: `${planSelection.plan.name} ${planSelection.billingCycle === 'annual' ? 'Yearly' : 'Monthly'}`,
    amountCents: row.amountCents,
    amountLabel: formatMoney(row.amountCents, row.currency),
    currency: row.currency,
    modelId: row.modelId,
    modelName: model.name,
    channelId: row.channelId,
    channelName: channel.name,
    paymentStatus,
    deploymentStatus: overrides.deploymentStatus || row.deploymentStatus || 'awaiting_payment',
    statusMessage,
    deploymentEtaMinutes: row.deploymentEtaMinutes || planSelection.plan.etaMinutes,
    includedDeployments,
    deploymentsUsed,
    deploymentsRemaining: Math.max(includedDeployments - deploymentsUsed, 0),
    canTriggerDeployment: false,
    bindingStatus: 'unbound',
    tokenDisplay: 'Saved for deployment',
    canAdminDeleteHermes: false,
    hermesVersion: 'current',
    upgradeStatus: 'idle',
    upgradeTargetVersion: null,
    upgradeError: null,
    createdAt: row.createdAt,
    updatedAt: overrides.updatedAt || row.updatedAt,
    paidAt: overrides.paidAt || row.paidAt || null,
    checkoutPath: `/checkout?order=${row.id}${guestTokenQuery}`,
    consolePath: `/console?order=${row.id}${guestTokenQuery}`,
    deployment: null,
    deployments: [],
    instance: null,
  }
}

function orderPayloadFromRequestBody(body) {
  const model = getModelById(String(body.modelId || 'gpt-5-4'))
  const channel = getChannelById(String(body.channelId || 'whatsapp'))
  const planSelection = resolvePlanSelection(String(body.planId || 'growth:monthly'), { model })
  const timestamp = new Date().toISOString()

  return {
    v: 1,
    id: randomHex(16),
    orderNumber: buildOrderNumber(),
    planId: planSelection.planId,
    modelId: model.id,
    channelId: channel.id,
    amountCents: planSelection.amountCents,
    currency: planSelection.plan.currency,
    paymentStatus: 'pending',
    deploymentStatus: 'awaiting_payment',
    statusMessage: 'Awaiting payment confirmation before deployment starts.',
    deploymentEtaMinutes: planSelection.plan.etaMinutes,
    includedDeployments: planSelection.plan.includedDeployments,
    createdAt: timestamp,
    updatedAt: timestamp,
    paidAt: null,
  }
}

async function readOrderFromRequest(request, url, env, expectedOrderId) {
  const guestToken = getGuestToken(request, url)
  const order = await verifyOrderToken(guestToken, env)
  if (expectedOrderId && order.id !== expectedOrderId) throw new HttpError(403, 'Order access denied.')
  return { order, guestToken }
}

function getPolarBaseUrl(env) {
  if (env.POLAR_BASE_URL) return env.POLAR_BASE_URL
  const mode = String(env.POLAR_ENV || env.POLAR_MODE || 'live').toLowerCase()
  return mode === 'test' ? 'https://test-api.polar.sh' : 'https://api.polar.sh'
}

async function polarRequest(env, path, { method = 'GET', body } = {}) {
  const paymentKey = await getPaymentKey(env)
  if (!paymentKey) throw new HttpError(503, 'Polar payment is not configured.')

  const response = await fetch(`${getPolarBaseUrl(env)}${path}`, {
    method,
    headers: {
      'x-api-key': paymentKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      payload?.details?.message ||
      `Polar request failed with status ${response.status}.`
    throw new HttpError(502, message)
  }

  return payload
}

function getPolarCheckoutUrl(payload) {
  for (const candidate of [payload?.checkout_url, payload?.checkoutUrl, payload?.url]) {
    if (candidate) return String(candidate)
  }

  const link = Array.isArray(payload?.links)
    ? payload.links.find((item) => {
        const rel = String(item?.rel || '').toLowerCase()
        return rel === 'checkout' || rel === 'payment' || rel === 'payer-action'
      })
    : null

  return link?.href ? String(link.href) : ''
}

function getPolarCheckoutId(payload) {
  for (const candidate of [payload?.id, payload?.checkout_id, payload?.checkoutId]) {
    if (candidate) return String(candidate)
  }
  return ''
}

async function ensurePolarProduct(env, order) {
  const model = getModelById(order.modelId)
  const planSelection = resolvePlanSelection(order.planId, { model })
  const cacheKey = `${planSelection.planId}:${order.modelId}:${order.amountCents}:${order.currency}`
  if (productCache.has(cacheKey)) return productCache.get(cacheKey)

  const product = await polarRequest(env, '/v1/products', {
    method: 'POST',
    body: {
      name: `Hermes ${planSelection.plan.name} ${planSelection.billingCycle === 'annual' ? 'Annual' : 'Monthly'}`,
      description: `${planSelection.plan.subtitle} - ${formatMoney(order.amountCents, order.currency)}`,
      price: order.amountCents,
      currency: order.currency,
      billing_type: 'onetime',
      tax_mode: 'inclusive',
      tax_category: 'saas',
      default_success_url: `${CANONICAL_ORIGIN}/checkout`,
    },
  })

  if (!product?.id) throw new HttpError(502, 'Polar product creation did not return a product ID.')
  productCache.set(cacheKey, product.id)
  return product.id
}

async function createPolarCheckout(env, request, order, guestToken) {
  const productId = await ensurePolarProduct(env, order)
  const returnOrigin = getPublicOrigin(request)
  const successUrl = `${returnOrigin}/checkout?order=${encodeURIComponent(order.id)}&guest_token=${encodeURIComponent(guestToken)}`
  const checkout = await polarRequest(env, '/v1/checkouts', {
    method: 'POST',
    body: {
      product_id: productId,
      request_id: order.id,
      success_url: successUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        planId: order.planId,
        modelId: order.modelId,
        source: 'hermesagent-cloudflare-worker',
      },
    },
  })
  const checkoutUrl = getPolarCheckoutUrl(checkout)
  const checkoutId = getPolarCheckoutId(checkout)

  if (!checkoutUrl) throw new HttpError(502, 'Polar checkout did not return a hosted checkout URL.')
  return { checkoutUrl, checkoutId }
}

function checkoutIsPaid(payload) {
  const checkoutStatus = String(payload?.status || '').toLowerCase()
  const orderStatus = String(payload?.order?.status || '').toLowerCase()
  return checkoutStatus === 'completed' || orderStatus === 'paid' || orderStatus === 'completed'
}

async function handleApi(url, request, env) {
  if (url.pathname === '/api/polar-checkout') {
    return handlePolarCheckout(request, env, {
      plans: planCatalog,
      defaultPlanId: 'growth',
      siteName: 'Hermes Agent',
      siteKey: 'hermesagent',
      annualDiscountMultiplier: annualBillingMultiplier,
    })
  }

  if (url.pathname === '/api/runtime' && request.method === 'GET') {
    return jsonResponse({
      environment: 'production',
      isDevelopment: false,
      publicAppOrigin: getPublicOrigin(request),
      paymentProvider: 'polar',
      paymentMode: String(env.POLAR_ENV || 'live'),
      maintenance: false,
    })
  }

  if (url.pathname === '/api/catalog' && request.method === 'GET') {
    return jsonResponse({
      plans: planCatalog.map(serializePlan),
      models: modelCatalog,
      channels: channelCatalog,
    })
  }

  if (url.pathname === '/api/auth/me' && request.method === 'GET') {
    return jsonResponse({ user: null })
  }

  if (url.pathname === '/api/analytics/events' && request.method === 'POST') {
    return jsonResponse({ ok: true, accepted: true }, 202)
  }

  if (url.pathname === '/api/launch-orders' && request.method === 'POST') {
    await getSigningSecret(env)
    const body = await readJsonBody(request)
    const order = orderPayloadFromRequestBody(body)
    const guestToken = await signOrderPayload(order, env)

    return jsonResponse(
      {
        message: 'Launch order created. Complete payment to start provisioning.',
        order: serializeOrder(order, guestToken),
      },
      201,
    )
  }

  const checkoutMatch = url.pathname.match(/^\/api\/orders\/([a-f0-9]+)\/checkout-session$/)
  if (checkoutMatch && request.method === 'POST') {
    const { order, guestToken } = await readOrderFromRequest(request, url, env, checkoutMatch[1])
    const { checkoutUrl, checkoutId } = await createPolarCheckout(env, request, order, guestToken)
    const timestamp = new Date().toISOString()

    return jsonResponse({
      message: 'Polar checkout is ready.',
      order: serializeOrder(
        {
          ...order,
          updatedAt: timestamp,
        },
        guestToken,
      ),
      checkoutUrl,
      paymentProvider: 'polar',
      polarCheckoutId: checkoutId || null,
      paypalOrderId: null,
      paypalClientId: null,
    })
  }

  const orderMatch = url.pathname.match(/^\/api\/orders\/([a-f0-9]+)$/)
  if (orderMatch && request.method === 'GET') {
    const { order, guestToken } = await readOrderFromRequest(request, url, env, orderMatch[1])
    return jsonResponse({ order: serializeOrder(order, guestToken) })
  }

  if (url.pathname === '/api/orders' && request.method === 'GET') {
    try {
      const { order, guestToken } = await readOrderFromRequest(request, url, env)
      return jsonResponse({ orders: [serializeOrder(order, guestToken)] })
    } catch {
      return jsonResponse({ orders: [] })
    }
  }

  if (url.pathname === '/api/console-data' && request.method === 'GET') {
    try {
      const { order, guestToken } = await readOrderFromRequest(request, url, env)
      return jsonResponse({
        orders: [serializeOrder(order, guestToken)],
        claws: [],
        users: [],
      })
    } catch {
      return jsonResponse({ orders: [], claws: [], users: [] })
    }
  }

  const polarConfirmMatch = url.pathname.match(/^\/api\/orders\/([a-f0-9]+)\/polar-confirm$/)
  if (polarConfirmMatch && request.method === 'POST') {
    const body = await readJsonBody(request)
    const redirectParams = body.redirectParams && typeof body.redirectParams === 'object' ? body.redirectParams : {}
    const guestToken = request.headers.get('x-hermes-guest-token') || redirectParams.guest_token || url.searchParams.get('guest_token') || ''
    const order = await verifyOrderToken(guestToken, env)
    if (order.id !== polarConfirmMatch[1]) throw new HttpError(403, 'Order access denied.')

    const checkoutId = redirectParams.checkout_id || redirectParams.checkoutId || redirectParams.id || ''
    let paid = false
    if (checkoutId) {
      const checkout = await polarRequest(env, `/v1/checkouts?checkout_id=${encodeURIComponent(checkoutId)}`)
      const checkoutRequestId = checkout?.request_id ? String(checkout.request_id) : null
      if (!checkoutRequestId || checkoutRequestId === order.id) paid = checkoutIsPaid(checkout)
    }

    const timestamp = new Date().toISOString()
    const serializedOrder = serializeOrder(
      {
        ...order,
        updatedAt: timestamp,
        paidAt: paid ? timestamp : null,
      },
      guestToken,
      paid
        ? {
            paymentStatus: 'paid',
            deploymentStatus: 'pending_deployment',
            paidAt: timestamp,
            updatedAt: timestamp,
            statusMessage: 'Payment confirmed. Hermes provisioning will continue from the production backend.',
          }
        : {
            statusMessage: 'Checkout received. Payment confirmation is still pending.',
            updatedAt: timestamp,
          },
    )

    return jsonResponse({
      message: paid ? 'Polar payment confirmed.' : 'Checkout is still pending confirmation.',
      order: serializedOrder,
    })
  }

  const versionsMatch = url.pathname.match(/^\/api\/orders\/([a-f0-9]+)\/hermes-versions$/)
  if (versionsMatch && request.method === 'GET') {
    await readOrderFromRequest(request, url, env, versionsMatch[1])
    return jsonResponse({
      versions: [{ id: 'current', name: 'Current production Hermes' }],
      currentVersion: 'current',
      configuredVersion: 'current',
    })
  }

  if (url.pathname.startsWith('/api/orders/')) {
    return jsonResponse(
      {
        ok: false,
        message:
          'Hermes workspace provisioning APIs are temporarily unavailable while the production backend is being restored. Payment checkout is available.',
      },
      503,
    )
  }

  return jsonResponse({ ok: false, message: 'API route not found.' }, 404)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    try {
      if (url.protocol !== 'https:' && CANONICAL_HOSTS.has(url.hostname)) {
        url.protocol = 'https:'
        return Response.redirect(url.toString(), 308)
      }

      if (url.pathname === '/sitemap.xml') return xmlResponse(buildSitemap())
      if (url.pathname === '/robots.txt') {
        return textResponse(`User-agent: *
Allow: /
Disallow: /api/
Allow: /llms.txt

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
`)
      }
      if (url.pathname.startsWith('/api/')) return await handleApi(url, request, env)

      const normalizedPath = normalizePath(url.pathname)
      if (staticHtmlPaths.has(normalizedPath)) {
        const assetUrl = new URL(request.url)
        assetUrl.pathname = `${normalizedPath}/index.html`
        const staticResponse = await env.ASSETS.fetch(new Request(assetUrl.toString(), request))
        if (staticResponse.status !== 404) return withSecurityHeaders(staticResponse)
      }

      if (!appRoutePaths.has(normalizedPath) && !isFileAssetPath(normalizedPath)) return noIndexNotFoundResponse()

      const response = await env.ASSETS.fetch(request)
      if (response.status === 404) return noIndexNotFoundResponse()
      if (response.status === 200 && !appRoutePaths.has(normalizedPath) && !isFileAssetPath(normalizedPath)) {
        return noIndexNotFoundResponse()
      }
      return withSecurityHeaders(response)
    } catch (error) {
      const status = error instanceof HttpError ? error.statusCode : 500
      return jsonResponse({ ok: false, message: error?.message || 'Unexpected server error.' }, status)
    }
  },
}
