import { createExactRoute } from './route-utils.mjs'

function createRouteError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function stripTrailingSlash(value) {
  return String(value || '').trim().replace(/\/+$/, '')
}

function firstString(candidates) {
  for (const candidate of candidates) {
    const value = String(candidate ?? '').trim()
    if (value) return value
  }
  return ''
}

function formatAmountCents(amountCents) {
  return (Math.max(0, Number(amountCents) || 0) / 100).toFixed(2)
}

function createOrderId(randomBytes) {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replace(/-/g, '')
  if (typeof randomBytes === 'function') return randomBytes(16).toString('hex')
  return Date.now().toString(36) + Math.random().toString(16).slice(2)
}

function getPolarSettings() {
  return {
    apiKey: String(process.env.POLAR_API_KEY || process.env.POLAR_KEY || '').trim(),
    baseUrl: stripTrailingSlash(process.env.POLAR_BASE_URL || 'https://api.polar.sh'),
    payCurrency: String(process.env.POLAR_PAY_CURRENCY || 'USD').trim().toUpperCase(),
  }
}

async function createPolarInvoice(invoice) {
  const settings = getPolarSettings()
  if (!settings.apiKey) throw createRouteError(503, 'Polar is not configured on this deployment.')

  const response = await fetch(settings.baseUrl + '/v1/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
    },
    body: JSON.stringify(invoice),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Polar invoice could not be created.'
    throw createRouteError(response.status === 401 || response.status === 403 ? response.status : 502, message)
  }

  const checkoutUrl = firstString([payload?.invoice_url, payload?.invoiceUrl, payload?.url])
  const invoiceId = firstString([payload?.id, payload?.invoice_id, payload?.invoiceId])
  if (!checkoutUrl) throw createRouteError(502, 'Polar invoice did not return a payment URL.')
  return { checkoutUrl, invoiceId, payCurrency: settings.payCurrency }
}

function resolvePlanForWallet(body, deps) {
  const planId = String(body?.planId ?? body?.selectionId ?? body?.plan ?? 'growth:monthly')
  const modelId = String(body?.modelId ?? '').trim()
  const options = {}
  if (modelId && typeof deps.getModelById === 'function') {
    try {
      options.model = deps.getModelById(modelId)
    } catch {
      options.model = null
    }
  }
  return deps.resolvePlanSelection(planId, options)
}

export function createPolarRoutes(deps) {
  const { getPublicAppOrigin, randomBytes, readJsonBody, sendJson } = deps

  return [
    createExactRoute('POST', '/api/polar-checkout', async ({ request, response }) => {
      try {
        const body = await readJsonBody(request)
        const selection = resolvePlanForWallet(body, deps)
        const origin = stripTrailingSlash(
          typeof getPublicAppOrigin === 'function' ? getPublicAppOrigin(request) : request.headers.origin,
        )
        const orderId = createOrderId(randomBytes)
        const orderNumber = 'USDC-' + Date.now().toString(36).toUpperCase() + '-' + orderId.slice(0, 6).toUpperCase()
        const successUrl = new URL((origin || 'http://localhost') + '/')
        successUrl.searchParams.set('checkout', 'polar_pending')
        successUrl.searchParams.set('provider', 'polar')
        successUrl.searchParams.set('order', orderId)
        successUrl.searchParams.set('plan', selection.planId)
        const cancelUrl = new URL((origin || 'http://localhost') + '/')
        cancelUrl.searchParams.set('checkout', 'cancelled')
        cancelUrl.searchParams.set('provider', 'polar')
        cancelUrl.searchParams.set('order', orderId)
        cancelUrl.searchParams.set('plan', selection.planId)

        const invoice = await createPolarInvoice({
          price_amount: formatAmountCents(selection.amountCents),
          price_currency: String(selection.plan?.currency || 'USD').toLowerCase(),
          pay_currency: String(process.env.POLAR_PAY_CURRENCY || 'USD').trim().toUpperCase(),
          order_id: orderId,
          order_description: `${selection.plan?.name || selection.planId} ${selection.billingCycle || ''} wallet checkout - ${orderNumber}`.trim(),
          success_url: successUrl.toString(),
          cancel_url: cancelUrl.toString(),
          is_fixed_rate: true,
          is_fee_paid_by_user: false,
        })

        sendJson(response, 200, {
          ok: true,
          message: 'Polar invoice is ready.',
          checkoutUrl: invoice.checkoutUrl,
          paymentProvider: 'polar',
          provider: 'polar',
          polarInvoiceId: invoice.invoiceId || null,
          payCurrency: invoice.payCurrency,
          orderId,
          orderNumber,
          planId: selection.planId,
          billing: selection.billingCycle,
          amountCents: selection.amountCents,
          currency: selection.plan?.currency || 'USD',
        })
      } catch (error) {
        const status = Number(error?.statusCode) || 500
        const message = error instanceof Error ? error.message : 'Polar checkout could not be started.'
        sendJson(response, status, { ok: false, message, error: message })
      }
    }),
  ]
}
