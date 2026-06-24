import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, Check, CheckCircle2, LoaderCircle, Menu, Rocket, ServerCog, UserRound, X } from 'lucide-react'

import type {
  AnalyticsSessionDetail,
  AnalyticsSessionRecord,
  AnalyticsSummary,
  AuthMode,
  BillingCycle,
  CheckoutSessionResponse,
  ConsoleData,
  CreateUserFormState,
  GuideChannel,
  LaunchDraft,
  LaunchResponse,
  HermesVersionOption,
  HermesVersionsResponse,
  OrderRecord,
  PayPalCheckoutSession,
  RuntimeResponse,
  UserDraft,
  UserRecord,
  UserRole,
  UserStatus,
} from './app-types'
import {
  apiRequest,
  getErrorMessage,
  getGuestTokenFromPath,
  loadPayPalSdk,
  openHostedCheckout,
} from './lib/api'
import { initializeAnalytics, syncAnalyticsPage, trackAnalyticsEvent } from './lib/analytics'
import {
  formatCurrency,
  formatDateTime,
  formatLifecycleStatus,
  formatHermesVersion,
  formatRole,
  formatStatus,
  getCustomerVisibleClawStatus,
  getPlanPricing,
  getUpgradeBadgeLabel,
} from './lib/format'
import { deriveRouteView, launchDraftStorageKey, normalizePathname, scrollToHashTarget } from './lib/routing'
import { buildSeoDocument, syncSeoDocument } from './lib/seo'
import {
  buildConsoleMetrics,
  buildHermesManagementRows,
  buildOrdersReadyForDeployment,
  buildPendingPaymentOrders,
  canHermesManagementConsole,
  getRedeployManagementState,
} from '../shared/console-visibility'
import {
  channels,
  channelBadges,
  comparisonPages,
  faqs,
  features,
  guideContent,
  initialAuthForm,
  initialCreateUserForm,
  initialGuideInputs,
  models,
  navItems,
  plans,
  privacySections,
  solutionPages,
  supportEmail,
  termsSections,
} from './content/site-content'
import { DiscordLogo, HermesAgentLogo, TelegramLogo, WhatsAppLogo } from './components/logos'

type StatelessCheckoutResponse = {
  ok?: boolean
  message?: string
  checkoutUrl?: string
  paymentProvider?: 'polar'
  orderId?: string
}

function isDeploymentInProgress(status: string | null | undefined) {
  return status === 'queued' || status === 'provisioning'
}

const defaultChannelId = 'whatsapp'

function formatDeploymentMessage(message: string | null | undefined, status: string | null | undefined) {
  const normalized = String(message ?? '')
    .replace(/\s+/g, ' ')
    .replace(/^Deployment failed:\s*/i, '')
    .trim()

  if (!normalized) {
    return status === 'failed' ? 'Deployment failed. Please try Deploy again.' : 'Deployment is in progress.'
  }

  if (/killed/i.test(normalized) || /out of memory/i.test(normalized)) {
    return 'Deployment stopped because the server ran out of available memory.'
  }

  if (/unable to authenticate data|unsupported state/i.test(normalized)) {
    return 'Deployment failed because the saved channel token could not be validated.'
  }

  if (/cloning into/i.test(normalized) && /npm install/i.test(normalized)) {
    return 'Deployment failed while installing Hermes Agent dependencies on the server.'
  }

  if (status === 'failed') {
    return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized
  }

  return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized
}

function formatAnalyticsStageLabel(stage: string | null | undefined) {
  const normalized = String(stage ?? '').trim()
  if (!normalized) {
    return 'Unknown'
  }

  return normalized
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function App() {
  const [currentPathname, setCurrentPathname] = useState(() => window.location.pathname)
  const [currentSearch, setCurrentSearch] = useState(() => window.location.search)
  const [currentHash, setCurrentHash] = useState(() => window.location.hash)
  const [appEnvironment, setAppEnvironment] = useState<'development' | 'production'>('production')
  const [publicAppOrigin, setPublicAppOrigin] = useState(() => window.location.origin)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [headerCompact, setHeaderCompact] = useState(() => window.scrollY > 18)
  const [activeNavHref, setActiveNavHref] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual')
  const [selectedPlanId, setSelectedPlanId] = useState('growth')
  const [selectedModelId, setSelectedModelId] = useState('gpt-5-4')
  const [selectedChannelId, setSelectedChannelId] = useState(defaultChannelId)
  const [communicationCode, setCommunicationCode] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [consoleFlashMessage, setConsoleFlashMessage] = useState('')
  const [activeGuide, setActiveGuide] = useState<GuideChannel | null>(null)
  const [guideInputs, setGuideInputs] = useState(initialGuideInputs)
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [authError, setAuthError] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [authForm, setAuthForm] = useState(initialAuthForm)
  const [managedUsers, setManagedUsers] = useState<UserRecord[]>([])
  const [userDrafts, setUserDrafts] = useState<Record<string, UserDraft>>({})
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminSavingUserId, setAdminSavingUserId] = useState<string | null>(null)
  const [createUserForm, setCreateUserForm] = useState(initialCreateUserForm)
  const [createUserSubmitting, setCreateUserSubmitting] = useState(false)
  const [launchSubmitting, setLaunchSubmitting] = useState(false)
  const [consoleData, setConsoleData] = useState<ConsoleData>({ orders: [], claws: [] })
  const [consoleLoadedOnce, setConsoleLoadedOnce] = useState(false)
  const [consoleError, setConsoleError] = useState('')
  const [checkoutOrder, setCheckoutOrder] = useState<OrderRecord | null>(null)
  const [payPalSession, setPayPalSession] = useState<PayPalCheckoutSession | null>(null)
  const [payPalError, setPayPalError] = useState('')
  const [payPalButtonsReady, setPayPalButtonsReady] = useState(false)
  const [paymentSubmittingOrderId, setPaymentSubmittingOrderId] = useState<string | null>(null)
  const [bindingOrderId, setBindingOrderId] = useState<string | null>(null)
  const [deploymentTriggeringKey, setDeploymentTriggeringKey] = useState<string | null>(null)
  const [openingConsoleKey, setOpeningConsoleKey] = useState<string | null>(null)
  const [stoppingHermesOrderId, setStoppingHermesOrderId] = useState<string | null>(null)
  const [adminDeletingHermesOrderId, setAdminDeletingHermesOrderId] = useState<string | null>(null)
  const [deletingPendingOrderId, setDeletingPendingOrderId] = useState<string | null>(null)
  const [consoleAutoRefreshUntil, setConsoleAutoRefreshUntil] = useState(0)
  const [upgradeDialogOrder, setUpgradeDialogOrder] = useState<OrderRecord | null>(null)
  const [upgradeVersions, setUpgradeVersions] = useState<HermesVersionOption[]>([])
  const [upgradeVersionsLoading, setUpgradeVersionsLoading] = useState(false)
  const [upgradeVersionsError, setUpgradeVersionsError] = useState('')
  const [selectedUpgradeVersion, setSelectedUpgradeVersion] = useState('')
  const [upgradeSubmittingOrderId, setUpgradeSubmittingOrderId] = useState<string | null>(null)
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null)
  const [analyticsSessions, setAnalyticsSessions] = useState<AnalyticsSessionRecord[]>([])
  const [analyticsDetail, setAnalyticsDetail] = useState<AnalyticsSessionDetail | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsDetailLoading, setAnalyticsDetailLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')
  const payPalButtonsRef = useRef<HTMLDivElement | null>(null)
  const payPalButtonsInstanceRef = useRef<{ close?: () => Promise<void> | void } | null>(null)

  const signedIn = currentUser !== null
  const canManageUsers = currentUser?.role === 'admin'
  const routeView = useMemo(() => deriveRouteView(currentPathname), [currentPathname])
  const normalizedPathname = useMemo(() => normalizePathname(currentPathname), [currentPathname])
  const checkoutSearchParams = useMemo(() => new URLSearchParams(currentSearch), [currentSearch])
  const redirectAfterLogin = useMemo(() => {
    const rawRedirect = checkoutSearchParams.get('redirect') ?? ''
    if (!rawRedirect.startsWith('/')) {
      return ''
    }

    return rawRedirect
  }, [checkoutSearchParams])
  const selectedOrderId = useMemo(() => checkoutSearchParams.get('order'), [checkoutSearchParams])
  const hasPolarRedirectParams = useMemo(
    () => Boolean(checkoutSearchParams.get('checkout_id')),
    [checkoutSearchParams],
  )
  const payPalRedirectOrderId = useMemo(() => checkoutSearchParams.get('token'), [checkoutSearchParams])
  const payPalRedirectPayerId = useMemo(
    () => checkoutSearchParams.get('PayerID') ?? checkoutSearchParams.get('payerId'),
    [checkoutSearchParams],
  )
  const hasPayPalRedirectParams = useMemo(
    () => Boolean(payPalRedirectOrderId && payPalRedirectPayerId),
    [payPalRedirectOrderId, payPalRedirectPayerId],
  )
  const hasHostedCheckoutRedirect = hasPolarRedirectParams || hasPayPalRedirectParams

  const selectedModel = useMemo(
    () => models.find((item) => item.id === selectedModelId) ?? models[1],
    [selectedModelId],
  )
  const featuredModels = models.slice(0, 3)
  const additionalModels = models.slice(3)

  const selectedPlan = useMemo(
    () => plans.find((item) => item.id === selectedPlanId) ?? plans[1],
    [selectedPlanId],
  )

  const defaultChannel = useMemo(
    () => channels.find((item) => item.id === defaultChannelId) ?? channels[0] ?? null,
    [],
  )

  const selectedChannel = useMemo(
    () => channels.find((item) => item.id === selectedChannelId) ?? defaultChannel,
    [defaultChannel, selectedChannelId],
  )

  const isAdminLaunchPriceOverride = appEnvironment === 'production' && currentUser?.role === 'admin'

  const selectedPlanPricing = useMemo(() => {
    const pricing = getPlanPricing(selectedPlan, billingCycle, selectedModel)
    const overrideAmountCents = isAdminLaunchPriceOverride ? 100 : pricing.amountCents

    return {
      ...pricing,
      amountCents: overrideAmountCents,
      totalLabel: formatCurrency(overrideAmountCents, selectedPlan.currency),
    }
  }, [billingCycle, isAdminLaunchPriceOverride, selectedModel, selectedPlan])

  const activeSolutionPage = useMemo(
    () => solutionPages.find((page) => page.href === normalizedPathname) ?? null,
    [normalizedPathname],
  )

  const activeComparisonPage = useMemo(
    () => comparisonPages.find((page) => page.href === normalizedPathname) ?? null,
    [normalizedPathname],
  )

  const hermesManagementRows = useMemo(
    () => buildHermesManagementRows(consoleData),
    [consoleData],
  )

  const consoleMetrics = useMemo(
    () => buildConsoleMetrics(consoleData),
    [consoleData],
  )

  const ordersReadyForDeployment = useMemo(
    () => buildOrdersReadyForDeployment(consoleData),
    [consoleData],
  )
  const pendingPaymentOrders = useMemo(
    () => buildPendingPaymentOrders(consoleData),
    [consoleData],
  )
  const showConsoleInitialLoading = !consoleLoadedOnce && !consoleError
  const showPendingOrdersLoading = showConsoleInitialLoading && pendingPaymentOrders.length === 0
  const showHermesManagementLoading = showConsoleInitialLoading && hermesManagementRows.length === 0

  const currentGuide = activeGuide ? guideContent[activeGuide] : null
  const hasLaunchDraft = selectedModelId.trim().length > 0

  const scheduleConsoleAutoRefresh = () => {
    setConsoleAutoRefreshUntil(Date.now() + 120_000)
  }
  const canSaveGuide = activeGuide ? guideInputs[activeGuide].trim().length > 0 : false

  const resetPayPalCheckout = () => {
    if (payPalButtonsInstanceRef.current?.close) {
      void payPalButtonsInstanceRef.current.close()
    }
    payPalButtonsInstanceRef.current = null
    if (payPalButtonsRef.current) {
      payPalButtonsRef.current.innerHTML = ''
    }
    setPayPalSession(null)
    setPayPalError('')
    setPayPalButtonsReady(false)
  }

  useEffect(() => {
    void apiRequest<RuntimeResponse>('/api/runtime')
      .then((payload) => {
        setAppEnvironment(payload.environment)
        setPublicAppOrigin(payload.publicAppOrigin || window.location.origin)
      })
      .catch(() => {
        setAppEnvironment('production')
        setPublicAppOrigin(window.location.origin)
      })
  }, [])

  useEffect(() => {
    const seo = buildSeoDocument({
      pathname: normalizedPathname,
      routeView,
      publicAppOrigin,
      supportEmail,
      solutionPage: activeSolutionPage,
      comparisonPage: activeComparisonPage,
    })

    syncSeoDocument(seo)
  }, [activeComparisonPage, activeSolutionPage, normalizedPathname, publicAppOrigin, routeView])

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPathname(window.location.pathname)
      setCurrentSearch(window.location.search)
      setCurrentHash(window.location.hash)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setHeaderCompact(window.scrollY > 18)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (routeView !== 'home') {
      return
    }

    if (!currentHash) {
      return
    }

    window.requestAnimationFrame(() => {
      scrollToHashTarget(currentHash)
    })
  }, [currentHash, routeView])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [currentPathname, currentHash, currentSearch])

  useEffect(() => {
    const sectionHrefs = ['#features', '#solutions', '#compare', '#pricing', '#faq']

    if (routeView === 'compare') {
      setActiveNavHref('#compare')
      return
    }

    if (routeView === 'solution') {
      setActiveNavHref('#solutions')
      return
    }

    if (routeView === 'plans') {
      setActiveNavHref('#pricing')
      return
    }

    if (routeView !== 'home') {
      setActiveNavHref('')
      return
    }

    const syncActiveNav = () => {
      const anchorLine = window.scrollY + 120
      let matchedHref = ''

      for (const href of sectionHrefs) {
        const element = document.querySelector(href)
        if (element instanceof HTMLElement && element.offsetTop <= anchorLine) {
          matchedHref = href
        }
      }

      if (!matchedHref && sectionHrefs.includes(currentHash)) {
        matchedHref = currentHash
      }

      setActiveNavHref(matchedHref)
    }

    syncActiveNav()
    window.addEventListener('scroll', syncActiveNav, { passive: true })
    window.addEventListener('resize', syncActiveNav)
    return () => {
      window.removeEventListener('scroll', syncActiveNav)
      window.removeEventListener('resize', syncActiveNav)
    }
  }, [currentHash, routeView])

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPathname(window.location.pathname)
    setCurrentSearch(window.location.search)
    setCurrentHash(window.location.hash)

    if (window.location.hash) {
      window.requestAnimationFrame(() => {
        scrollToHashTarget(window.location.hash)
      })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const persistLaunchDraft = (draft: LaunchDraft) => {
    window.sessionStorage.setItem(launchDraftStorageKey, JSON.stringify(draft))
  }

  const clearLaunchDraft = () => {
    window.sessionStorage.removeItem(launchDraftStorageKey)
  }

  const restoreLaunchDraft = () => {
    const rawDraft = window.sessionStorage.getItem(launchDraftStorageKey)
    if (!rawDraft) return false

    try {
      const draft = JSON.parse(rawDraft) as LaunchDraft
      const restoredChannelId =
        typeof draft.channelId === 'string' && channels.some((item) => item.id === draft.channelId)
          ? draft.channelId
          : defaultChannelId
      if (draft.modelId) setSelectedModelId(draft.modelId)
      setSelectedChannelId(restoredChannelId)
      setCommunicationCode(draft.communicationToken ?? '')
      return Boolean(draft.modelId)
    } catch {
      return false
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      try {
        const response = await apiRequest<{ user: UserRecord | null }>('/api/auth/me')
        if (!cancelled) {
          setCurrentUser(response.user)
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null)
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true)
        }
      }
    }

    void loadSession()

    return () => {
      cancelled = true
    }
  }, [])

  const loadManagedUsers = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setManagedUsers([])
      setUserDrafts({})
      return
    }

    setAdminLoading(true)
    setAdminError('')

    try {
      const response = await apiRequest<{ users: UserRecord[] }>('/api/admin/users')
      setManagedUsers(response.users)
      setUserDrafts(
        Object.fromEntries(
          response.users.map((user) => [
            user.id,
            {
              name: user.name,
              role: user.role,
              status: user.status,
            },
          ]),
        ),
      )
    } catch (error) {
      setAdminError(getErrorMessage(error))
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    if (!canManageUsers) {
      setManagedUsers([])
      setUserDrafts({})
      setAdminError('')
      return
    }

    void loadManagedUsers()
  }, [canManageUsers])

  const loadAdminAnalytics = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setAnalyticsSummary(null)
      setAnalyticsSessions([])
      setAnalyticsDetail(null)
      setAnalyticsError('')
      return
    }

    setAnalyticsLoading(true)
    setAnalyticsError('')

    try {
      const [summaryResponse, sessionsResponse] = await Promise.all([
        apiRequest<{ summary: AnalyticsSummary }>('/api/admin/analytics/summary?days=14'),
        apiRequest<{ sessions: AnalyticsSessionRecord[] }>('/api/admin/analytics/sessions?days=14&limit=20'),
      ])

      setAnalyticsSummary(summaryResponse.summary)
      setAnalyticsSessions(sessionsResponse.sessions)
    } catch (error) {
      setAnalyticsError(getErrorMessage(error))
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadAnalyticsSessionDetail = async (sessionId: string) => {
    setAnalyticsDetailLoading(true)
    setAnalyticsError('')

    try {
      const response = await apiRequest<AnalyticsSessionDetail>(`/api/admin/analytics/sessions/${sessionId}`)
      setAnalyticsDetail(response)
    } catch (error) {
      setAnalyticsError(getErrorMessage(error))
    } finally {
      setAnalyticsDetailLoading(false)
    }
  }

  useEffect(() => {
    if (!canManageUsers) {
      setAnalyticsSummary(null)
      setAnalyticsSessions([])
      setAnalyticsDetail(null)
      setAnalyticsError('')
      return
    }

    void loadAdminAnalytics()
  }, [canManageUsers])

  const loadConsoleData = async ({ showLoadingState: _showLoadingState }: { showLoadingState?: boolean } = {}) => {
    try {
      const response = await apiRequest<ConsoleData>('/api/console-data')
      setConsoleData(response)
      setConsoleLoadedOnce(true)
      setConsoleError('')
    } catch (error) {
      setConsoleError(getErrorMessage(error))
    }
  }

  useEffect(() => {
    if (normalizePathname(currentPathname) !== '/checkout') {
      return
    }

    window.history.replaceState({}, '', `/console${currentSearch}`)
    setCurrentPathname(window.location.pathname)
    setCurrentSearch(window.location.search)
    setCurrentHash(window.location.hash)
  }, [currentPathname, currentSearch])

  useEffect(() => {
    initializeAnalytics()
  }, [])

  useEffect(() => {
    syncAnalyticsPage(currentPathname, currentSearch)
  }, [currentPathname, currentSearch])

  useEffect(() => {
    if (!authReady) {
      return
    }

    if (routeView === 'console' && !hasHostedCheckoutRedirect) {
      void loadConsoleData({ showLoadingState: !consoleLoadedOnce })
    }

    if (routeView === 'plans' && !hasLaunchDraft) {
      const restored = restoreLaunchDraft()
      if (!restored) {
        setStatusMessage('Complete your launch details first, then continue to plan selection.')
        navigate('/')
      }
    }

  }, [authReady, hasHostedCheckoutRedirect, hasLaunchDraft, routeView])

  useEffect(() => {
    if (!authReady || signedIn || !redirectAfterLogin || authMode) {
      return
    }

    openAuthModal('login')
  }, [authMode, authReady, redirectAfterLogin, signedIn])

  useEffect(() => {
    if (!consoleFlashMessage) {
      return
    }

    if (routeView !== 'console') {
      setConsoleFlashMessage('')
      return
    }

    const timeoutId = window.setTimeout(() => {
      setConsoleFlashMessage('')
    }, 6000)

    return () => window.clearTimeout(timeoutId)
  }, [consoleFlashMessage, routeView])

  useEffect(() => {
    if (!checkoutOrder || checkoutOrder.paymentStatus === 'paid') {
      resetPayPalCheckout()
      return
    }

    if (payPalSession && payPalSession.orderId !== checkoutOrder.id) {
      resetPayPalCheckout()
    }
  }, [checkoutOrder?.id, checkoutOrder?.paymentStatus])

  useEffect(() => {
    if (routeView !== 'console') return

    const hasActiveOrder = consoleData.orders.some(
      (order) => ['queued', 'provisioning'].includes(order.deploymentStatus) || order.upgradeStatus === 'in_progress',
    )

    if (!hasActiveOrder && consoleAutoRefreshUntil <= Date.now()) return

    const timer = window.setInterval(() => {
      void loadConsoleData({ showLoadingState: false })
    }, 2000)

    return () => window.clearInterval(timer)
  }, [consoleAutoRefreshUntil, consoleData.orders, routeView])

  const handleDeploy = async () => {
    trackAnalyticsEvent({
      eventType: 'business',
      eventName: 'launch_clicked',
      metadata: {
        modelId: selectedModel.id,
        channelId: selectedChannel?.id ?? 'selected_on_plans',
      },
    })
    persistLaunchDraft({
      modelId: selectedModel.id,
      channelId: selectedChannel?.id ?? '',
      communicationToken: communicationCode.trim(),
    })
    navigate('/plans')
  }

  const createLaunchOrder = async (planId: string) => {
    if (!selectedChannel) {
      throw new Error('Choose the first live channel for this deployment before checkout.')
    }

    return await apiRequest<LaunchResponse>('/api/launch-orders', {
      method: 'POST',
      body: JSON.stringify({
        planId: `${planId}:${billingCycle}`,
        modelId: selectedModel.id,
        channelId: selectedChannel.id,
        communicationToken: communicationCode,
      }),
    })
  }

  const createCheckoutSession = async (orderId: string, guestToken?: string | null) => {
    return await apiRequest<CheckoutSessionResponse>(`/api/orders/${orderId}/checkout-session`, {
      method: 'POST',
      guestToken: guestToken ?? undefined,
    })
  }

  const createStatelessCheckoutSession = async (planId: string) => {
    return await apiRequest<StatelessCheckoutResponse>('/api/polar-checkout', {
      method: 'POST',
      body: JSON.stringify({
        planId,
        modelId: selectedModel.id,
        source: 'plans',
      }),
    })
  }

  const handlePlanSelect = (planId: string) => {
    trackAnalyticsEvent({
      eventType: 'business',
      eventName: 'plan_selected',
      metadata: {
        planId,
        billingCycle,
      },
    })
    setSelectedPlanId(planId)
  }

  const handlePlanLaunch = async (provider: 'polar' | 'polar' = 'polar') => {
    if (!selectedChannel) {
      setStatusMessage('Choose the first live channel for this deployment before checkout.')
      return
    }

    setLaunchSubmitting(true)

    try {
      if (provider === 'polar') {
        const checkoutResponse = await createStatelessCheckoutSession(`${selectedPlan.id}:${billingCycle}`)
        if (!checkoutResponse.checkoutUrl) {
          throw new Error(checkoutResponse.message || 'USDC wallet checkout is unavailable.')
        }
        const opened = openHostedCheckout(checkoutResponse.checkoutUrl)
        trackAnalyticsEvent({
          eventType: 'business',
          eventName: 'checkout_started',
          metadata: {
            planId: `${selectedPlan.id}:${billingCycle}`,
            billingCycle,
            paymentProvider: 'polar',
            popupMode: opened ? 'popup' : 'redirect',
          },
        })
        if (opened) {
          setStatusMessage('USDC wallet checkout opened in a new window. Complete payment there while this page stays here.')
        } else {
          window.location.assign(checkoutResponse.checkoutUrl)
        }
        return
      }

      const launchResponse = await createLaunchOrder(selectedPlan.id)
      trackAnalyticsEvent({
        eventType: 'business',
        eventName: 'launch_order_created',
        orderId: launchResponse.order.id,
        metadata: {
          planId: launchResponse.order.planId,
          billingCycle,
        },
      })
      setCheckoutOrder(launchResponse.order)
      resetPayPalCheckout()
      const checkoutResponse = await createCheckoutSession(
        launchResponse.order.id,
        getGuestTokenFromPath(launchResponse.order.checkoutPath),
      )
      trackAnalyticsEvent({
        eventType: 'business',
        eventName: 'checkout_started',
        orderId: checkoutResponse.order.id,
        metadata: {
          paymentStatus: checkoutResponse.order.paymentStatus,
        },
      })
      setCheckoutOrder(checkoutResponse.order)

      if (checkoutResponse.order.paymentStatus === 'paid') {
        setConsoleFlashMessage(checkoutResponse.message)
        await loadConsoleData()
        navigate(checkoutResponse.order.consolePath)
        return
      }

      clearLaunchDraft()
      if (continueWithHostedCheckout(checkoutResponse)) {
        return
      }

      setStatusMessage(checkoutResponse.message)

      if (!checkoutResponse.paypalOrderId || !checkoutResponse.paypalClientId) {
        throw new Error('PayPal checkout is unavailable.')
      }

      if (checkoutResponse.checkoutUrl) {
        setStatusMessage('Your browser blocked the PayPal window, so checkout is ready inside this page instead.')
      }

      if (!checkoutResponse.paypalOrderId || !checkoutResponse.paypalClientId) {
        throw new Error('Payment checkout is unavailable.')
      }

      navigate(checkoutResponse.order.consolePath)
      setPayPalSession({
        orderId: checkoutResponse.order.id,
        paypalOrderId: checkoutResponse.paypalOrderId,
        paypalClientId: checkoutResponse.paypalClientId,
        currency: checkoutResponse.order.currency,
      })
    } catch (error) {
      trackAnalyticsEvent({
        eventType: 'error',
        eventName: 'checkout_start_failed',
        metadata: {
          message: getErrorMessage(error),
        },
      })
      setStatusMessage(getErrorMessage(error))
    } finally {
      setLaunchSubmitting(false)
    }
  }

  const handleModelSelect = (modelId: string) => {
    trackAnalyticsEvent({
      eventType: 'business',
      eventName: 'model_selected',
      metadata: {
        modelId,
      },
    })
    setSelectedModelId(modelId)
  }

  const handleGuideInputChange = (value: string) => {
    if (!activeGuide) return
    setGuideInputs((current) => ({ ...current, [activeGuide]: value }))
    setCommunicationCode(value)
  }


  const handleGuideSave = () => {
    if (!activeGuide) return

    const token = guideInputs[activeGuide].trim()
    setSelectedChannelId(activeGuide)

    if (!token) {
      setCommunicationCode('')
      setActiveGuide(null)
      setStatusMessage('Channel saved. You can skip the token for now and bind it later in the console.')
      return
    }

    setCommunicationCode(token)
    trackAnalyticsEvent({
      eventType: 'business',
      eventName: 'guide_token_saved',
      metadata: {
        channelId: activeGuide,
      },
    })
    setStatusMessage('Your communication token is now available.')
    setActiveGuide(null)
  }

  const handlePayOrder = async (orderId: string) => {
    setPaymentSubmittingOrderId(orderId)
    setConsoleError('')
    setPayPalError('')

    try {
      trackAnalyticsEvent({
        eventType: 'business',
        eventName: 'payment_resume_clicked',
        orderId,
      })
      const response = await createCheckoutSession(orderId)
      trackAnalyticsEvent({
        eventType: 'business',
        eventName: 'checkout_started',
        orderId: response.order.id,
        metadata: {
          paymentStatus: response.order.paymentStatus,
        },
      })
      setCheckoutOrder(response.order)
      if (response.order.paymentStatus === 'paid') {
        setConsoleFlashMessage(response.message)
        resetPayPalCheckout()
        scheduleConsoleAutoRefresh()
        await loadConsoleData()
        navigate(response.order.consolePath)
        return
      }

      if (continueWithHostedCheckout(response)) {
        return
      }

      if (!response.paypalOrderId || !response.paypalClientId) {
        throw new Error('PayPal checkout is unavailable.')
      }

      setConsoleFlashMessage(response.message)

      if (response.checkoutUrl) {
        setConsoleFlashMessage('Your browser blocked the PayPal window, so checkout is ready inside this page instead.')
      }

      if (!response.paypalOrderId || !response.paypalClientId) {
        throw new Error('Payment checkout is unavailable.')
      }

      setPayPalSession({
        orderId: response.order.id,
        paypalOrderId: response.paypalOrderId,
        paypalClientId: response.paypalClientId,
        currency: response.order.currency,
      })
    } catch (error) {
      trackAnalyticsEvent({
        eventType: 'error',
        eventName: 'checkout_resume_failed',
        orderId,
        metadata: {
          message: getErrorMessage(error),
        },
      })
      setConsoleError(getErrorMessage(error))
    } finally {
      setPaymentSubmittingOrderId(null)
    }
  }

  const handleBindOrderToAccount = async (orderId: string) => {
    setBindingOrderId(orderId)
    setConsoleError('')

    try {
      const response = await apiRequest<{ message: string; order: OrderRecord }>(`/api/orders/${orderId}/bind-account`, {
        method: 'POST',
      })
      setStatusMessage(response.message)
      await loadConsoleData()
      if (checkoutOrder?.id === orderId) {
        setCheckoutOrder(response.order)
      }
    } catch (error) {
      setConsoleError(getErrorMessage(error))
    } finally {
      setBindingOrderId(null)
    }
  }

  const handleTriggerDeployment = async (orderId: string, triggeringKey: string = orderId) => {
    setDeploymentTriggeringKey(triggeringKey)
    setConsoleError('')

    try {
      const response = await apiRequest<{ message: string; order: OrderRecord }>(`/api/orders/${orderId}/deployments`, {
        method: 'POST',
      })
      setStatusMessage(response.message)
      scheduleConsoleAutoRefresh()
      await loadConsoleData()
      if (checkoutOrder?.id === orderId) {
        setCheckoutOrder(response.order)
      }
    } catch (error) {
      setConsoleError(getErrorMessage(error))
    } finally {
      setDeploymentTriggeringKey(null)
    }
  }

  const handleHermesConsole = async (orderId: string, deploymentId?: string | null, rowKey?: string) => {
    setOpeningConsoleKey(rowKey ?? orderId)
    setConsoleError('')
    const openedWindow = window.open('about:blank', '_blank')

    try {
      const response = await apiRequest<{ url: string }>(`/api/orders/${orderId}/hermes-console`, {
        method: 'POST',
        body: JSON.stringify(deploymentId ? { deploymentId } : {}),
      })
      const consoleUrl = new URL(response.url, window.location.origin).toString()
      if (!openedWindow) {
        setConsoleError('Please allow popups to open the Hermes console in a new tab.')
        return
      }

      openedWindow.opener = null
      openedWindow.location.href = consoleUrl
    } catch (error) {
      if (openedWindow && !openedWindow.closed) {
        openedWindow.close()
      }
      setConsoleError(getErrorMessage(error))
    } finally {
      setOpeningConsoleKey(null)
    }
  }

  const handleStopHermes = async (orderId: string) => {
    setStoppingHermesOrderId(orderId)
    setConsoleError('')

    try {
      const response = await apiRequest<{ message: string; order: OrderRecord }>(`/api/orders/${orderId}/hermes-stop`, {
        method: 'POST',
      })
      setStatusMessage(response.message)
      await loadConsoleData()
      if (checkoutOrder?.id === orderId) {
        setCheckoutOrder(response.order)
      }
    } catch (error) {
      setConsoleError(getErrorMessage(error))
    } finally {
      setStoppingHermesOrderId(null)
    }
  }

  const handleDeletePendingOrder = async (orderId: string) => {
    setDeletingPendingOrderId(orderId)
    setConsoleError('')

    try {
      const response = await apiRequest<{ message: string }>(`/api/orders/${orderId}/delete`, {
        method: 'POST',
      })
      setStatusMessage(response.message)
      await loadConsoleData()
      if (checkoutOrder?.id === orderId) {
        setCheckoutOrder(null)
        resetPayPalCheckout()
      }
    } catch (error) {
      setConsoleError(getErrorMessage(error))
    } finally {
      setDeletingPendingOrderId(null)
    }
  }

  const handleAdminDeleteHermes = async (orderId: string) => {
    if (!window.confirm('Delete this Hermes workspace? This action cannot be undone.')) {
      return
    }

    setAdminDeletingHermesOrderId(orderId)
    setConsoleError('')

    try {
      const response = await apiRequest<{ message: string; order: OrderRecord }>(
        `/api/admin/orders/${orderId}/hermes-delete`,
        {
          method: 'POST',
        },
      )
      setStatusMessage(response.message)
      await loadConsoleData()
      if (checkoutOrder?.id === orderId) {
        setCheckoutOrder(response.order)
      }
      if (upgradeDialogOrder?.id === orderId) {
        closeUpgradeDialog()
      }
    } catch (error) {
      setConsoleError(getErrorMessage(error))
    } finally {
      setAdminDeletingHermesOrderId(null)
    }
  }

  const closeUpgradeDialog = () => {
    setUpgradeDialogOrder(null)
    setUpgradeVersions([])
    setUpgradeVersionsLoading(false)
    setUpgradeVersionsError('')
    setSelectedUpgradeVersion('')
  }

  const closePlanPayPalDialog = () => {
    resetPayPalCheckout()
  }

  const continueWithHostedCheckout = (checkoutResponse: CheckoutSessionResponse) => {
    if (!checkoutResponse.checkoutUrl) {
      return false
    }

    const opened = openHostedCheckout(checkoutResponse.checkoutUrl)

    if (opened) {
      trackAnalyticsEvent({
        eventType: 'business',
        eventName: 'checkout_redirected',
        orderId: checkoutResponse.order.id,
        metadata: {
          provider: 'paypal',
          mode: 'popup',
        },
      })
      setConsoleFlashMessage('PayPal checkout opened in a new window. Complete payment there while this page stays on your site.')
      scheduleConsoleAutoRefresh()
      navigate(checkoutResponse.order.consolePath)
      return true
    }

    return false
  }

  const handleOpenUpgradeDialog = async (order: OrderRecord) => {
    setUpgradeDialogOrder(order)
    setUpgradeVersions([])
    setUpgradeVersionsError('')
    setSelectedUpgradeVersion(order.hermesVersion)
    setUpgradeVersionsLoading(true)

    try {
      const response = await apiRequest<HermesVersionsResponse>(`/api/orders/${order.id}/hermes-versions`)
      setUpgradeVersions(response.versions)
      setSelectedUpgradeVersion(response.currentVersion || response.versions[0]?.name || '')
    } catch (error) {
      setUpgradeVersionsError(getErrorMessage(error))
    } finally {
      setUpgradeVersionsLoading(false)
    }
  }

  const handleConfirmUpgrade = async () => {
    if (!upgradeDialogOrder || !selectedUpgradeVersion) {
      return
    }

    setUpgradeSubmittingOrderId(upgradeDialogOrder.id)
    setUpgradeVersionsError('')
    setConsoleError('')

    try {
      const response = await apiRequest<{ message: string; order: OrderRecord }>(
        `/api/orders/${upgradeDialogOrder.id}/hermes-upgrade`,
        {
          method: 'POST',
          body: JSON.stringify({
            version: selectedUpgradeVersion,
          }),
        },
      )
      setStatusMessage(response.message)
      await loadConsoleData()
      if (checkoutOrder?.id === upgradeDialogOrder.id) {
        setCheckoutOrder(response.order)
      }
      closeUpgradeDialog()
    } catch (error) {
      setUpgradeVersionsError(getErrorMessage(error))
    } finally {
      setUpgradeSubmittingOrderId(null)
    }
  }

  useEffect(() => {
    if (!authReady || routeView !== 'console' || !selectedOrderId || !hasPolarRedirectParams) return

    const confirmPolarRedirect = async () => {
      setPaymentSubmittingOrderId(selectedOrderId)
      setConsoleError('')

      try {
        const response = await apiRequest<{ message: string; order: OrderRecord }>(
          `/api/orders/${selectedOrderId}/polar-confirm`,
          {
            method: 'POST',
            body: JSON.stringify({
              redirectParams: Object.fromEntries(checkoutSearchParams.entries()),
            }),
          },
        )

        setCheckoutOrder(response.order)
        setConsoleFlashMessage(response.message)
        scheduleConsoleAutoRefresh()
        await loadConsoleData()
        navigate(response.order.consolePath)
      } catch (error) {
        setConsoleError(getErrorMessage(error))
      } finally {
        setPaymentSubmittingOrderId(null)
      }
    }

    void confirmPolarRedirect()
  }, [authReady, checkoutSearchParams, hasPolarRedirectParams, routeView, selectedOrderId])

  useEffect(() => {
    if (!authReady || routeView !== 'console' || !selectedOrderId || !hasPayPalRedirectParams || !payPalRedirectOrderId) return

    const confirmPayPalRedirect = async () => {
      setPaymentSubmittingOrderId(selectedOrderId)
      setConsoleError('')

      try {
        const response = await apiRequest<{ message: string; order: OrderRecord }>(
          `/api/orders/${selectedOrderId}/paypal-capture`,
          {
            method: 'POST',
            body: JSON.stringify({
              paypalOrderId: payPalRedirectOrderId,
            }),
          },
        )

        trackAnalyticsEvent({
          eventType: 'business',
          eventName: 'payment_completed',
          orderId: response.order.id,
          metadata: {
            provider: 'paypal',
            flow: 'redirect',
          },
        })
        resetPayPalCheckout()
        setCheckoutOrder(response.order)
        setConsoleFlashMessage(response.message)
        scheduleConsoleAutoRefresh()
        await loadConsoleData()
        navigate(response.order.consolePath)
      } catch (error) {
        trackAnalyticsEvent({
          eventType: 'error',
          eventName: 'payment_capture_failed',
          orderId: selectedOrderId,
          metadata: {
            provider: 'paypal',
            flow: 'redirect',
            message: getErrorMessage(error),
          },
        })
        setConsoleError(getErrorMessage(error))
      } finally {
        setPaymentSubmittingOrderId(null)
      }
    }

    void confirmPayPalRedirect()
  }, [authReady, hasPayPalRedirectParams, navigate, payPalRedirectOrderId, routeView, selectedOrderId])

  useEffect(() => {
    if (
      (routeView !== 'plans' && routeView !== 'console') ||
      !checkoutOrder ||
      checkoutOrder.paymentStatus !== 'pending' ||
      !payPalSession ||
      payPalSession.orderId !== checkoutOrder.id ||
      !payPalButtonsRef.current
    ) {
      return
    }

    let cancelled = false
    setPayPalError('')
    setPayPalButtonsReady(false)

    const renderButtons = async () => {
      const paypal = await loadPayPalSdk(payPalSession.paypalClientId, payPalSession.currency)
      if (cancelled || !payPalButtonsRef.current) {
        return
      }

      payPalButtonsRef.current.innerHTML = ''
      const buttons = paypal.Buttons({
        style: {
          layout: 'vertical',
          shape: 'rect',
          label: 'paypal',
        },
        createOrder: async () => payPalSession.paypalOrderId,
        onApprove: async (data: { orderID?: string }) => {
          const response = await apiRequest<{ message: string; order: OrderRecord }>(
            `/api/orders/${checkoutOrder.id}/paypal-capture`,
            {
              method: 'POST',
              body: JSON.stringify({
                paypalOrderId: data.orderID ?? payPalSession.paypalOrderId,
              }),
            },
          )

          trackAnalyticsEvent({
            eventType: 'business',
            eventName: 'payment_completed',
            orderId: response.order.id,
            metadata: {
              provider: 'paypal',
              flow: 'sdk',
            },
          })
          resetPayPalCheckout()
          setCheckoutOrder(response.order)
          setStatusMessage(response.message)
          await loadConsoleData()
          navigate(response.order.consolePath)
        },
        onCancel: () => {
          trackAnalyticsEvent({
            eventType: 'business',
            eventName: 'checkout_canceled',
            orderId: checkoutOrder.id,
            metadata: {
              provider: 'paypal',
            },
          })
          setPayPalError('PayPal payment was canceled before completion.')
        },
        onError: (error: unknown) => {
          trackAnalyticsEvent({
            eventType: 'error',
            eventName: 'payment_capture_failed',
            orderId: checkoutOrder.id,
            metadata: {
              provider: 'paypal',
              flow: 'sdk',
              message: getErrorMessage(error),
            },
          })
          setPayPalError(getErrorMessage(error))
        },
      })

      if (buttons.isEligible && !buttons.isEligible()) {
        throw new Error('PayPal checkout is not available for this browser.')
      }

      payPalButtonsInstanceRef.current = buttons
      await buttons.render(payPalButtonsRef.current)

      if (!cancelled) {
        setPayPalButtonsReady(true)
      }
    }

    void renderButtons().catch((error) => {
      if (!cancelled) {
        setPayPalError(getErrorMessage(error))
        setPayPalButtonsReady(false)
      }
    })

    return () => {
      cancelled = true
      if (payPalButtonsInstanceRef.current?.close) {
        void payPalButtonsInstanceRef.current.close()
      }
      payPalButtonsInstanceRef.current = null
      if (payPalButtonsRef.current) {
        payPalButtonsRef.current.innerHTML = ''
      }
    }
  }, [checkoutOrder, payPalSession, routeView])

  const openAuthModal = (mode: AuthMode) => {
    trackAnalyticsEvent({
      eventType: 'business',
      eventName: 'auth_modal_opened',
      metadata: {
        mode,
      },
    })
    setAuthMode(mode)
    setAuthError('')
    setAuthForm(initialAuthForm)
  }

  const closeAuthModal = () => {
    setAuthMode(null)
    setAuthError('')
    setAuthForm(initialAuthForm)
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!authMode) return

    setAuthSubmitting(true)
    setAuthError('')

    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const body =
        authMode === 'register'
          ? {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            }
          : {
              email: authForm.email,
              password: authForm.password,
            }

      const response = await apiRequest<{ message: string; user: UserRecord }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      trackAnalyticsEvent({
        eventType: 'business',
        eventName: authMode === 'register' ? 'auth_registered' : 'auth_logged_in',
      })
      setCurrentUser(response.user)
      setStatusMessage(response.message)
      if (redirectAfterLogin) {
        window.location.assign(redirectAfterLogin)
        return
      }
      closeAuthModal()
    } catch (error) {
      trackAnalyticsEvent({
        eventType: 'error',
        eventName: authMode === 'register' ? 'auth_register_failed' : 'auth_login_failed',
        metadata: {
          message: getErrorMessage(error),
        },
      })
      setAuthError(getErrorMessage(error))
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const response = await apiRequest<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      })
      setCurrentUser(null)
      setManagedUsers([])
      setUserDrafts({})
      setStatusMessage(response.message)
    } catch (error) {
      setStatusMessage(getErrorMessage(error))
    }
  }

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setCreateUserSubmitting(true)
    setAdminError('')

    try {
      const response = await apiRequest<{ message: string }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(createUserForm),
      })
      setCreateUserForm(initialCreateUserForm)
      setStatusMessage(response.message)
      await loadManagedUsers()
    } catch (error) {
      setAdminError(getErrorMessage(error))
    } finally {
      setCreateUserSubmitting(false)
    }
  }

  const handleUserSave = async (userId: string) => {
    const draft = userDrafts[userId]
    if (!draft) return

    setAdminSavingUserId(userId)
    setAdminError('')

    try {
      const response = await apiRequest<{ message: string; user: UserRecord }>(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(draft),
      })

      setManagedUsers((current) =>
        current.map((user) => (user.id === response.user.id ? response.user : user)),
      )
      setUserDrafts((current) => ({
        ...current,
        [userId]: {
          name: response.user.name,
          role: response.user.role,
          status: response.user.status,
        },
      }))
      if (currentUser?.id === response.user.id) {
        setCurrentUser(response.user)
      }
      setStatusMessage(response.message)
    } catch (error) {
      setAdminError(getErrorMessage(error))
    } finally {
      setAdminSavingUserId(null)
    }
  }


  return (

    <div className="app-shell" id="top">
      <div className="background-grid" />
      <div className="background-glow glow-left" />
      <div className="background-glow glow-right" />

      <header className={`site-header ${headerCompact ? 'site-header-compact' : ''}`}>
        <div className="header-inner">
          <a
            className="brand"
            href="/"
            onClick={(event) => {
              event.preventDefault()
              navigate('/')
            }}
          >
            <span className="brand-mark" aria-hidden="true">
              <HermesAgentLogo />
            </span>
            <span className="brand-name">Hermes Agent</span>
            {appEnvironment === 'development' ? <span className="brand-environment-badge">DEV MODE</span> : null}
          </a>

          <button
            type="button"
            className="header-menu-toggle"
            aria-expanded={mobileNavOpen}
            aria-controls="site-navigation"
            onClick={() => setMobileNavOpen((value) => !value)}
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            <span>{mobileNavOpen ? 'Close' : 'Menu'}</span>
          </button>

          <nav
            id="site-navigation"
            className={`nav-links ${mobileNavOpen ? 'nav-links-open' : ''}`}
            aria-label="Primary"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const active = item.href === activeNavHref
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={active ? 'nav-link-active' : ''}
                  onClick={(event) => {
                    if (item.href.startsWith('#')) {
                      event.preventDefault()
                      navigate(routeView === 'home' ? item.href : `/${item.href}`)
                      return
                    }

                    if (item.href.startsWith('/')) {
                      event.preventDefault()
                      navigate(item.href)
                      return
                    }

                    if (routeView !== 'home') {
                      event.preventDefault()
                      navigate(`/${item.href}`)
                    }
                  }}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </a>
              )
            })}
          </nav>

          <div className={`header-actions ${mobileNavOpen ? 'header-actions-open' : ''}`}>
            {!authReady ? (
              <div className="header-user-text">Checking session...</div>
            ) : signedIn && currentUser ? (
              <>
                <div className="header-user-text">{currentUser.email}</div>
                <button
                  type="button"
                  className="header-auth-text"
                  onClick={() => navigate('/console')}
                >
                  {canManageUsers ? 'Manage users' : 'Open console'}
                </button>
                <button type="button" className="header-auth-text" onClick={() => void handleSignOut()}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button type="button" className="header-auth-text" onClick={() => openAuthModal('login')}>
                  Log in
                </button>
                <button type="button" className="header-auth-text" onClick={() => openAuthModal('register')}>
                  Create account
                </button>
              </>
            )}
          </div>


        </div>
      </header>

      <main className={`container ${routeView === 'home' ? 'container-home' : ''} ${routeView === 'plans' ? 'container-plans' : ''}`}>
        {routeView === 'home' ? (
          <>
            <section className="hero-section" data-analytics-section="hero">
              <div className="hero-copy">
                <h1>Not a Chat. A Persistent Agent That Remembers, Acts, and Improves.</h1>
                <p>
                  Hermes keeps your context warm across sessions, completes real tasks with
                  <strong> 47 built-in tools</strong>, and turns repeated workflows into
                  <strong> skills that compound</strong> — on infrastructure you control.
                </p>
              </div>

              <section className="launch-panel" aria-label="Launch builder" data-analytics-section="launch-builder">
                <div className="panel-block">
                  <p className="panel-label">Choose a foundation model for Hermes Agent</p>
                  <div className="option-grid option-grid-3">
                    {featuredModels.map((option) => {
                      const active = option.id === selectedModelId
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`option-card option-card-rich option-card-home-compact model-card-home-compact ${active ? 'option-card-active' : ''}`}
                          onClick={() => handleModelSelect(option.id)}
                          aria-pressed={active}
                        >
                          <span className={`brand-option-icon ${option.id}`}>{option.icon}</span>
                          <span className="option-copy">
                            <span className="option-title">{option.name}</span>
                          </span>
                          {active ? <span className="selected-pill">Selected</span> : null}
                        </button>
                      )
                    })}
                  </div>
                  {additionalModels.length ? (
                    <div className="support-strip">
                      <span className="support-strip-label">More models</span>
                      <div className="model-chip-row">
                        {additionalModels.map((option) => {
                          const active = option.id === selectedModelId
                          const hasDiscount = Boolean(option.discountMultiplier && option.discountMultiplier > 0 && option.discountMultiplier < 1)
                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={`model-chip-button ${active ? 'model-chip-button-active' : ''} ${hasDiscount ? 'model-discount-target' : ''}`}
                              onClick={() => handleModelSelect(option.id)}
                              aria-pressed={active}
                              title={option.discountTooltip}
                              data-discount-tooltip={option.discountTooltip}
                            >
                              <span>{option.name}</span>
                              {option.discountLabel ? <span className="model-chip-discount">{option.discountLabel}</span> : null}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="panel-block channel-support-panel">
                  <p className="panel-label">Core launch channels for your first Hermes workspace</p>
                  <div className="option-grid option-grid-3">
                    {channels.map((option) => {
                      return (
                        <article
                          key={option.id}
                          className="option-card option-card-rich option-card-home-compact channel-card-home-compact option-card-static"
                        >
                          <span className={`brand-option-icon ${option.id}`}>{option.icon}</span>
                          <span className="option-copy">
                            <span className="option-title">{option.name}</span>
                          </span>
                        </article>
                      )
                    })}
                  </div>
                  <div className="support-strip">
                    <span className="support-strip-label">More channels</span>
                    <div className="support-badge-row">
                      {channelBadges.map((item) => (
                        <span className="support-badge" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="panel-block panel-block-last">
                  <div className="code-row code-row-compact">
                    <button
                      type="button"
                      className="deploy-button"
                      onClick={() => void handleDeploy()}
                      disabled={launchSubmitting}
                    >
                      {launchSubmitting ? 'Loading plans...' : 'Launch Hermes'}
                    </button>
                  </div>
                </div>

                {statusMessage ? (
                  <div className="status-banner">
                    <CheckCircle2 size={16} />
                    <span>{statusMessage}</span>
                  </div>
                ) : null}

              </section>
            </section>


            <section className="content-section" id="features" data-analytics-section="features">
              <div className="section-heading">
                <span>Features</span>
                <h2>Six capabilities that separate a persistent agent from a disposable chat</h2>
              </div>
              <div className="feature-grid">
                {features.map((feature) => (
                  <article className="glass-card" key={feature.title}>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="content-section" id="solutions" data-analytics-section="solutions">
              <div className="section-heading">
                <span>Solutions</span>
                <h2>Pick the problem. Hermes handles the execution.</h2>
              </div>
              <div className="marketing-card-grid">
                {solutionPages.map((page) => (
                  <article className="glass-card marketing-card" key={page.href}>
                    <span className="marketing-card-label">{page.label}</span>
                    <h3>{page.title}</h3>
                    <p>{page.summary}</p>
                    <ul>
                      {page.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className="console-actions-row">
                      <a
                        className="secondary-button marketing-link-button"
                        href={page.href}
                        onClick={(event) => {
                          event.preventDefault()
                          navigate(page.href)
                        }}
                      >
                        See use case
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="content-section" id="compare" data-analytics-section="compare">
              <div className="section-heading">
                <span>Compare</span>
                <h2>See when Hermes Agent is a better fit than a chatbot or rigid workflow bot</h2>
              </div>

              <div className="marketing-card-grid marketing-card-grid-2">
                {comparisonPages.map((page) => (
                  <article className="glass-card marketing-card" key={page.href}>
                    <span className="marketing-card-label">{page.label}</span>
                    <h3>{page.title}</h3>
                    <p>{page.summary}</p>
                    <ul>
                      {page.chooseLaunch.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className="console-actions-row">
                      <a
                        className="secondary-button marketing-link-button"
                        href={page.href}
                        onClick={(event) => {
                          event.preventDefault()
                          navigate(page.href)
                        }}
                      >
                        See when to choose it
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="content-section" id="pricing" data-analytics-section="pricing">
              <div className="section-heading">
                <span>Pricing</span>
                <h2>Managed launch plans for Hermes Agent</h2>
              </div>
              <div className="pricing-grid">
                {plans.map((plan) => (
                  <article className={`glass-card pricing-card ${plan.featured ? 'pricing-featured' : ''}`} key={plan.id}>
                    {plan.featured ? <div className="pricing-badge">Most popular</div> : null}
                    <h3>{plan.name}</h3>
                    <div className="price-line">{plan.monthlyPriceLabel}</div>
                    <p className="plan-subtitle">{plan.subtitle}</p>
                    <ul>
                      {plan.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setSelectedPlanId(plan.id)
                        if (hasLaunchDraft) {
                          navigate('/plans')
                          return
                        }

                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      Choose {plan.name}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="content-section faq-layout" id="faq" data-analytics-section="faq">
              <div className="section-heading section-heading-left">
                <span>FAQ</span>
                <h2>Questions teams ask before launching Hermes Agent</h2>
              </div>
              <div className="faq-grid">
                {faqs.map((faq) => (
                  <article className="glass-card" key={faq.question}>
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </article>
                ))}
              </div>
            </section>

          </>
        ) : null}

        {routeView === 'solution' ? (
          <section className="content-section page-shell marketing-page-shell" data-analytics-section="solution-page">
            {activeSolutionPage ? (
              <>
                <div className="section-heading">
                  <span>{activeSolutionPage.eyebrow}</span>
                  <h1>{activeSolutionPage.title}</h1>
                </div>

                <article className="glass-card marketing-hero-card">
                  <p className="marketing-summary">{activeSolutionPage.summary}</p>
                  <div className="console-actions-row marketing-action-row">
                    <button type="button" className="deploy-button" onClick={() => navigate('/')}>
                      Start Hermes launch
                    </button>
                    <button type="button" className="secondary-button marketing-inline-button" onClick={() => navigate('/plans')}>
                      View plans
                    </button>
                  </div>
                </article>

                <article className="glass-card marketing-hero-card marketing-definition-card">
                  <span className="marketing-card-label">Definition</span>
                  <p className="marketing-summary">{activeSolutionPage.definition}</p>
                </article>

                <div className="marketing-detail-grid">
                  <article className="glass-card">
                    <h3>Best for</h3>
                    <ul>
                      {activeSolutionPage.bestFor.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="glass-card">
                    <h3>Not the best fit if</h3>
                    <ul>
                      {activeSolutionPage.notFor.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="glass-card marketing-detail-card-wide">
                    <h3>Facts AI can quote directly</h3>
                    <ul className="marketing-fact-list">
                      {activeSolutionPage.facts.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="glass-card">
                    <h3>What you get</h3>
                    <ul>
                      {activeSolutionPage.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="glass-card marketing-detail-card-wide">
                    <h3>Fastest path to a working Hermes workspace</h3>
                    <ol className="marketing-step-list">
                      {activeSolutionPage.workflow.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </article>
                </div>

                <section className="marketing-faq-section" data-analytics-section="solution-faq">
                  <div className="section-heading section-heading-left compare-subheading">
                    <span>FAQ</span>
                    <h2>Questions teams ask before choosing this Hermes use case</h2>
                  </div>
                  <div className="faq-grid">
                    {activeSolutionPage.faqs.map((faq) => (
                      <article className="glass-card" key={faq.question}>
                        <h3>{faq.question}</h3>
                        <p>{faq.answer}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <article className="glass-card marketing-hero-card marketing-conclusion-card" data-analytics-section="solution-conclusion">
                  <span className="marketing-card-label">Conclusion</span>
                  <p className="marketing-summary">{activeSolutionPage.conclusion}</p>
                  <div className="console-actions-row marketing-action-row">
                    <button type="button" className="deploy-button" onClick={() => navigate('/')}>
                      Start Hermes launch
                    </button>
                    <button type="button" className="secondary-button marketing-inline-button" onClick={() => navigate('/plans')}>
                      View plans
                    </button>
                  </div>
                </article>
              </>
            ) : (
              <div className="glass-card empty-console-state">
                <h3>Solution page not found</h3>
                <p>Choose a Hermes use case from the homepage and start the launch flow there.</p>
                <div className="console-actions-row">
                  <button type="button" className="deploy-button" onClick={() => navigate('/')}>
                    Back to homepage
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : null}

        {routeView === 'compare' ? (
          <section className="content-section page-shell marketing-page-shell" data-analytics-section="compare-page">
            {activeComparisonPage ? (
              <>
                <div className="section-heading">
                  <span>{activeComparisonPage.eyebrow}</span>
                  <h1>{activeComparisonPage.title}</h1>
                </div>

                <article className="glass-card marketing-hero-card">
                  <span className="marketing-card-label">Decision summary</span>
                  <p className="marketing-summary">{activeComparisonPage.summary}</p>
                  <div className="console-actions-row marketing-action-row">
                    <button type="button" className="deploy-button" onClick={() => navigate('/')}>
                      Start Hermes launch
                    </button>
                    <button type="button" className="secondary-button marketing-inline-button" onClick={() => navigate('/plans')}>
                      View plans first
                    </button>
                  </div>
                </article>

                <div className="marketing-detail-grid">
                  <article className="glass-card">
                    <h3>Choose Hermes Agent if</h3>
                    <ul>
                      {activeComparisonPage.chooseLaunch.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="glass-card">
                    <h3>Stay with {activeComparisonPage.alternativeName} if</h3>
                    <ul>
                      {activeComparisonPage.chooseAlternative.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                </div>

                <div className="comparison-matrix">
                  {activeComparisonPage.rows.map((row) => (
                    <article className="glass-card comparison-row" key={row.label}>
                      <div className="comparison-row-label">{row.label}</div>
                      <div className="comparison-row-values">
                        <div className="comparison-value">
                          <strong>Hermes Agent</strong>
                          <p>{row.launch}</p>
                        </div>
                        <div className="comparison-value">
                          <strong>{activeComparisonPage.alternativeName}</strong>
                          <p>{row.alternative}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <section className="compare-faq-section" data-analytics-section="compare-faq">
                  <div className="section-heading section-heading-left compare-subheading">
                    <span>FAQ</span>
                    <h2>Common questions before you choose an agent path</h2>
                  </div>
                  <div className="faq-grid">
                    {activeComparisonPage.faqs.map((faq) => (
                      <article className="glass-card" key={faq.question}>
                        <h3>{faq.question}</h3>
                        <p>{faq.answer}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <article className="glass-card marketing-hero-card compare-cta-card">
                  <span className="marketing-card-label">Next step</span>
                  <p className="marketing-summary">
                    If the real problem is keeping context, using tools, and finishing multi-step work
                    without starting from zero each time, start the Hermes launch flow now or review plans first.
                  </p>
                  <div className="console-actions-row marketing-action-row">
                    <button type="button" className="deploy-button" onClick={() => navigate('/')}>
                      Start Hermes launch
                    </button>
                    <button type="button" className="secondary-button marketing-inline-button" onClick={() => navigate('/plans')}>
                      View plans first
                    </button>
                  </div>
                </article>
              </>

            ) : (
              <div className="glass-card empty-console-state">
                <h3>Comparison page not found</h3>
                <p>Go back to the homepage to review the main Hermes launch flow and available comparisons.</p>
                <div className="console-actions-row">
                  <button type="button" className="deploy-button" onClick={() => navigate('/')}>
                    Back to homepage
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : null}

        {routeView === 'plans' ? (
          <section className="content-section page-shell plans-page-shell" data-analytics-section="plans-page">
            <div className="section-heading">
              <h2>Pick the plan and launch your Hermes workspace today</h2>
            </div>

            <div className="checkout-grid">
              <article className="glass-card checkout-summary-card">
                <div className="subsection-heading">
                  <h3>Order summary</h3>
                </div>
                <div className="console-list">
                  <div className="console-row-item">
                    <span>Plan</span>
                    <strong>{selectedPlan.name}</strong>
                  </div>
                  <div className="console-row-item">
                    <span>Model</span>
                    <strong>{selectedModel.name}</strong>
                  </div>
                  <div className="console-row-item">
                    <span>Billing cycle</span>
                    <strong>{billingCycle === 'annual' ? 'Annual billing' : 'Monthly billing'}</strong>
                  </div>
                  <div className="console-row-item console-row-item-total">
                    <span>Total</span>
                    <strong>{selectedPlanPricing.totalLabel}</strong>
                  </div>
                </div>
                <div className="console-actions-row">
                  <button type="button" className="deploy-button" onClick={() => void handlePlanLaunch()} disabled={launchSubmitting}>
                    {launchSubmitting ? 'Preparing checkout...' : 'Launch'}
                  </button>
                  <button type="button" className="secondary-button" onClick={() => void handlePlanLaunch('polar')} disabled={launchSubmitting}>
                    Pay with USDC Wallet
                  </button>
                </div>
              </article>

              <article className="glass-card checkout-progress-card">
                <div className="subsection-heading">
                  <h3>Available packages</h3>
                </div>
                <div className="billing-toggle-header">
                  <div className="billing-toggle-row">
                    <button
                      type="button"
                      className={`billing-toggle-button ${billingCycle === 'annual' ? 'billing-toggle-button-active' : ''}`}
                      onClick={() => setBillingCycle('annual')}
                    >
                      <span>Yearly</span>
                      <span className="billing-saving-badge">35% off</span>
                    </button>
                    <button
                      type="button"
                      className={`billing-toggle-button ${billingCycle === 'monthly' ? 'billing-toggle-button-active' : ''}`}
                      onClick={() => setBillingCycle('monthly')}
                    >
                      <span>Monthly</span>
                    </button>
                  </div>
                  <div className="billing-toggle-note">Limited-time annual discount</div>
                </div>
                <div className="pricing-grid compact-pricing-grid">
                  {plans.map((plan) => {
                    const pricing = getPlanPricing(plan, billingCycle, selectedModel)
                    const displayedPriceLabel = isAdminLaunchPriceOverride
                      ? formatCurrency(100, plan.currency)
                      : pricing.priceLabel

                    return (
                      <article
                        className={`glass-card pricing-card selectable-plan ${plan.featured ? 'pricing-featured' : ''}`}
                        key={plan.id}
                      >
                        {plan.featured ? <div className="pricing-badge">Most popular</div> : null}
                        <h3>{plan.name}</h3>
                        <div className="price-line">
                          {!isAdminLaunchPriceOverride && pricing.originalPriceLabel ? (
                            <span className="price-original">{pricing.originalPriceLabel}</span>
                          ) : null}
                          <span>{displayedPriceLabel}</span>
                          {!isAdminLaunchPriceOverride ? <span className="price-cycle">{pricing.cycleLabel}</span> : null}
                        </div>
                        <p className="plan-subtitle">{plan.subtitle}</p>
                        <ul>
                          {plan.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className={`secondary-button ${selectedPlanId === plan.id ? 'selected-plan-button' : ''}`}
                          onClick={() => handlePlanSelect(plan.id)}
                          disabled={launchSubmitting}
                        >
                          {selectedPlanId === plan.id ? `Selected ${plan.name}` : `Select ${plan.name}`}
                        </button>
                      </article>
                    )
                  })}
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {routeView === 'console' ? (
          <section className="content-section page-shell" id="console" data-analytics-section="console-page">
            {!authReady ? <div className="glass-card empty-console-state">Checking session...</div> : null}

            {authReady ? (
              <>
                {consoleError ? <div className="admin-error-banner">{consoleError}</div> : null}
                {consoleFlashMessage ? (
                  <div className="status-banner console-flash-banner" role="status" aria-live="polite">
                    <CheckCircle2 size={16} />
                    <span>{consoleFlashMessage}</span>
                  </div>
                ) : null}

                <div className="management-stack">
                  <article className="glass-card">
                    <div className="subsection-heading">
                      <h3>Pending Orders</h3>
                      <p>Complete payment here before the order enters deployment tracking.</p>
                    </div>
                    <div className="admin-user-list">
                      {showPendingOrdersLoading ? (
                        <div className="admin-empty-state admin-loading-state" aria-live="polite">
                          <LoaderCircle size={18} className="loading-spinner-icon" />
                          <span>Loading pending orders...</span>
                        </div>
                      ) : !consoleLoadedOnce && consoleError ? (
                        <div className="admin-empty-state">Pending orders are unavailable right now.</div>
                      ) : consoleLoadedOnce && pendingPaymentOrders.length === 0 ? (
                        <div className="admin-empty-state">No pending orders.</div>
                      ) : (
                        pendingPaymentOrders.map((order) => (
                          <div className="admin-user-row compact-claw-row" key={order.id}>
                            <div className="compact-claw-main">
                              <div className="admin-user-summary">
                                <strong className="claw-summary-title">
                                  <span>{order.orderNumber}</span>
                                </strong>
                                <span>
                                  {order.planName} / {order.modelName} / {order.channelName} / Created{' '}
                                  {formatDateTime(order.createdAt)}
                                </span>
                              </div>
                              <div className="compact-claw-meta">
                                <span className="status-badge">{formatLifecycleStatus(order.paymentStatus)}</span>
                                <span className="status-badge">{order.amountLabel}</span>
                                <span className="status-badge">{formatLifecycleStatus(order.bindingStatus)}</span>
                              </div>
                              <div className="management-progress-card">
                                <div className="management-progress-header">
                                  <strong>Payment pending</strong>
                                  <span>Awaiting checkout</span>
                                </div>
                                <span className="management-progress-copy">
                                  {order.statusMessage || 'Finish payment to start deployment automatically.'}
                                </span>
                              </div>
                            </div>
                            <div className="console-actions-row tight-actions compact-claw-actions">
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => void handlePayOrder(order.id)}
                                disabled={paymentSubmittingOrderId === order.id}
                              >
                                {paymentSubmittingOrderId === order.id ? 'Opening checkout...' : 'Pay now'}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </article>

                  <article className="glass-card">
                    <div className="subsection-heading">
                      <h3>Hermes Workspaces</h3>
                    </div>
                    <div className="admin-user-list">
                      {showHermesManagementLoading ? (
                        <div className="admin-empty-state admin-loading-state" aria-live="polite">
                          <LoaderCircle size={18} className="loading-spinner-icon" />
                          <span>Loading Hermes workspaces...</span>
                        </div>
                      ) : !consoleLoadedOnce && consoleError ? (
                        <div className="admin-empty-state">Hermes workspace data is unavailable right now.</div>
                      ) : consoleLoadedOnce && hermesManagementRows.length === 0 ? (
                        <div className="admin-empty-state">No Hermes workspaces yet.</div>
                      ) : (
                        hermesManagementRows.map(({ id, order, deployment, claw, isLatestForOrder }) => {
                          const deploymentStatus = deployment?.status ?? claw?.status ?? order.deploymentStatus
                          const clawLifecycleStatus =
                            claw?.runtimeState === 'stopped' ? 'stopped' : claw?.status ?? deploymentStatus
                          const hermesConsoleUrl = claw?.consoleUrl ?? deployment?.consoleUrl ?? null
                          const baseClawName =
                            claw?.instanceName ?? deployment?.instanceName ?? `${order.modelName} · ${order.channelName}`
                          const clawDisplayName =
                            order.tokenDisplay && order.tokenDisplay !== 'Not bound'
                              ? `${baseClawName} · ${order.tokenDisplay}`
                              : baseClawName
                          const upgradeBadgeLabel = claw
                            ? getUpgradeBadgeLabel(claw.upgradeStatus, claw.upgradeTargetVersion)
                            : null
                          const deploymentInProgress = isDeploymentInProgress(deploymentStatus)
                          const deploymentFailed = deploymentStatus === 'failed'
                          const redeployState = getRedeployManagementState({
                            id,
                            order,
                            deployment,
                            claw,
                            isLatestForOrder,
                          })
                          const canHermesConsole = canHermesManagementConsole({
                            id,
                            order,
                            deployment,
                            claw,
                            isLatestForOrder,
                          })
                          const visibleStatus = getCustomerVisibleClawStatus(
                            claw ? clawLifecycleStatus : deploymentStatus,
                            canHermesConsole,
                            order.tokenDisplay,
                          )
                          const shouldShowBindAccount =
                            isLatestForOrder && signedIn && order.bindingStatus === 'unbound' && (claw || deployment)
                          const canAdminDeleteHermes =
                            canManageUsers && order.canAdminDeleteHermes && isLatestForOrder && Boolean(claw)
                          const shouldShowDeploymentProgress =
                            Boolean(deployment) && (deploymentInProgress || deploymentFailed)
                          const deploymentProgressValue = Math.max(
                            deploymentInProgress ? 18 : 0,
                            Math.min(100, deployment?.progress ?? 0),
                          )
                          const deploymentProgressLabel = deploymentInProgress
                            ? `${deployment?.triggerMode === 'manual' ? 'Manual' : 'Automatic'} deployment in progress`
                            : `${deployment?.triggerMode === 'manual' ? 'Manual' : 'Automatic'} deployment failed`
                          const deploymentProgressMessage = formatDeploymentMessage(
                            deployment?.lastMessage || order.statusMessage,
                            deploymentStatus,
                          )
                          const deploymentSequence = deployment?.sequenceNumber ?? claw?.sequenceNumber ?? 1
                          const rowCreatedAt = claw?.createdAt ?? deployment?.updatedAt ?? order.createdAt
                          const openConsoleDeploymentId = deployment?.id ?? claw?.deploymentId ?? null
                          const summaryLine = `${order.orderNumber} / ${order.planName} / Deployment #${deploymentSequence} / Created ${formatDateTime(rowCreatedAt)}`
                          return (
                          <div className="admin-user-row compact-claw-row" key={id}>
                            <div className="compact-claw-main">
                              <div className="admin-user-summary">
                                <strong className="claw-summary-title">
                                  {deploymentInProgress ? (
                                    <span className="deploying-claw-indicator" aria-label="Deployment in progress">
                                      <ServerCog size={15} />
                                    </span>
                                  ) : null}
                                  <span>{clawDisplayName}</span>
                                </strong>
                                <span>{summaryLine}</span>
                              </div>
                              <div className="compact-claw-meta">
                                {visibleStatus ? <span className="status-badge">{visibleStatus}</span> : null}
                                {deployment ? (
                                  <span className="status-badge">
                                    {deployment.triggerMode === 'manual' ? 'Manual trigger' : 'Automatic trigger'}
                                  </span>
                                ) : null}
                                {upgradeBadgeLabel ? <span className="status-badge">{upgradeBadgeLabel}</span> : null}
                                <span className="status-badge">{formatLifecycleStatus(order.paymentStatus)}</span>
                                <span className="status-badge">{formatLifecycleStatus(order.bindingStatus)}</span>
                              </div>
                              {shouldShowDeploymentProgress ? (
                                <div
                                  className={`management-progress-card ${
                                    deploymentFailed ? 'management-progress-card-failed' : ''
                                  }`}
                                >
                                  <div className="management-progress-header">
                                    <strong>{deploymentProgressLabel}</strong>
                                    <span>{deploymentProgressValue}%</span>
                                  </div>
                                  <span className="management-progress-copy">{deploymentProgressMessage}</span>
                                  <div className="deployment-progress-line management-progress-line">
                                    <div
                                      className="deployment-progress-bar"
                                      style={{ width: `${deploymentProgressValue}%` }}
                                    />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="console-actions-row tight-actions compact-claw-actions">
                              {redeployState.visible ? (
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => void handleTriggerDeployment(order.id, `management:${id}`)}
                                  disabled={deploymentTriggeringKey === `management:${id}` || redeployState.disabled}
                                >
                                  {deploymentTriggeringKey === `management:${id}`
                                    ? 'Starting deploy...'
                                    : redeployState.label}
                                </button>
                              ) : null}
                              {shouldShowBindAccount ? (
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => void handleBindOrderToAccount(order.id)}
                                  disabled={bindingOrderId === order.id}
                                >
                                  {bindingOrderId === order.id ? 'Binding account...' : 'Bind to my account'}
                                </button>
                              ) : null}
                              {canHermesConsole ? (
                                <button
                                  type="button"
                                  className="secondary-button external-link-button"
                                  onClick={() => void handleHermesConsole(order.id, openConsoleDeploymentId, id)}
                                  disabled={openingConsoleKey === id}
                                >
                                  {openingConsoleKey === id ? 'Opening...' : 'Open console'}
                                </button>
                              ) : null}
                              {canAdminDeleteHermes ? (
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => void handleAdminDeleteHermes(order.id)}
                                  disabled={adminDeletingHermesOrderId === order.id}
                                >
                                  {adminDeletingHermesOrderId === order.id ? 'Deleting...' : 'Delete workspace'}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )})
                      )}
                    </div>
                  </article>
                </div>

                <div className="console-grid console-grid-top">
                  <article className="glass-card console-card">
                    <div className="console-card-top">
                      <div className="console-icon-wrap">
                        <UserRound size={18} />
                      </div>
                      <div>
                        <h3>User Center</h3>
                        <p>
                          {signedIn
                            ? 'Identity, access, and binding overview for your Hermes workspace.'
                            : 'Guest launch is active. Sign in when you want persistent ownership and token management.'}
                        </p>
                      </div>
                    </div>
                    <div className="console-list">
                      <div className="console-row-item">
                        <span>Email</span>
                        <strong>{currentUser?.email ?? 'Guest mode'}</strong>
                      </div>
                      <div className="console-row-item">
                        <span>Role</span>
                        <strong>{currentUser ? formatRole(currentUser.role) : 'Guest'}</strong>
                      </div>
                      <div className="console-row-item">
                        <span>Status</span>
                        <strong>{currentUser ? formatStatus(currentUser.status) : 'Login required'}</strong>
                      </div>
                      <div className="console-row-item">
                        <span>Orders tracked</span>
                        <strong>{consoleMetrics.trackedOrders}</strong>
                      </div>
                      <div className="console-row-item">
                        <span>Last sign-in</span>
                        <strong>{currentUser ? formatDateTime(currentUser.lastLoginAt) : 'Guest session'}</strong>
                      </div>
                    </div>
                    <div className="console-actions-row">
                      {signedIn ? (
                        <button type="button" className="secondary-button" onClick={() => void handleSignOut()}>
                          Sign out
                        </button>
                      ) : (
                        <>
                          <button type="button" className="secondary-button" onClick={() => openAuthModal('login')}>
                            Log in
                          </button>
                          <button type="button" className="secondary-button" onClick={() => openAuthModal('register')}>
                            Create account
                          </button>
                        </>
                      )}
                    </div>
                  </article>

                  <article className="glass-card console-card">
                    <div className="console-card-top">
                      <div className="console-icon-wrap">
                        <Rocket size={18} />
                      </div>
                      <div>
                        <h3>Orders</h3>
                        <p>
                          {!consoleLoadedOnce && !consoleError
                            ? 'Loading orders, payments, and deployment status.'
                            : `${consoleData.orders.length} order(s) tracked across payment, provisioning, and live operations.`}
                        </p>
                      </div>
                    </div>
                    <div className="console-list">
                      <div className="console-row-item">
                        <span>Pending payment</span>
                        <strong>{consoleMetrics.unpaidOrders}</strong>
                      </div>
                      <div className="console-row-item">
                        <span>Paid orders</span>
                        <strong>{consoleMetrics.paidOrders}</strong>
                      </div>
                      <div className="console-row-item">
                        <span>Live Hermes workspaces</span>
                        <strong>{consoleMetrics.liveClaws}</strong>
                      </div>
                      <div className="console-row-item">
                        <span>Created workspaces</span>
                        <strong>{consoleMetrics.createdClaws} / {consoleMetrics.totalDeploymentsIncluded}</strong>
                      </div>
                      <div className="console-row-item">
                        <span>Available triggers</span>
                        <strong>{consoleMetrics.availableTriggers}</strong>
                      </div>
                    </div>
                    {ordersReadyForDeployment.length > 0 ? (
                      <div className="console-list">
                        {ordersReadyForDeployment.map((order) => (
                          <div className="console-row-item" key={order.id}>
                            <span>{order.orderNumber} · {order.planName}</span>
                            <strong>{order.deploymentsRemaining} deployment(s) available</strong>
                            <button
                              type="button"
                              className="secondary-button orders-create-button"
                              onClick={() => void handleTriggerDeployment(order.id, `orders-ready:${order.id}`)}
                              disabled={deploymentTriggeringKey === `orders-ready:${order.id}`}
                            >
                              {deploymentTriggeringKey === `orders-ready:${order.id}` ? 'Creating workspace...' : 'Create workspace'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="console-actions-row">
                      <button type="button" className="secondary-button" onClick={() => navigate('/')}>
                        New launch order
                      </button>
                    </div>
                  </article>
                </div>

                <div className="management-stack">
                  {canManageUsers ? (
                    <article className="glass-card admin-card" id="user-admin">
                      <div className="console-card-top">
                        <div className="console-icon-wrap">
                          <UserRound size={18} />
                        </div>
                        <div>
                          <h3>User Management</h3>
                          <p>Create operators, promote admins, and disable access with audited server-backed state.</p>
                        </div>
                      </div>

                      <form className="admin-create-grid" onSubmit={handleCreateUser}>
                        <label className="form-field">
                          <span>Full name</span>
                          <input
                            value={createUserForm.name}
                            onChange={(event) =>
                              setCreateUserForm((current) => ({ ...current, name: event.target.value }))
                            }
                            placeholder="Operator name"
                          />
                        </label>
                        <label className="form-field">
                          <span>Email</span>
                          <input
                            value={createUserForm.email}
                            onChange={(event) =>
                              setCreateUserForm((current) => ({ ...current, email: event.target.value }))
                            }
                            placeholder="name@company.com"
                            type="email"
                          />
                        </label>
                        <label className="form-field">
                          <span>Temporary password</span>
                          <input
                            value={createUserForm.password}
                            onChange={(event) =>
                              setCreateUserForm((current) => ({ ...current, password: event.target.value }))
                            }
                            placeholder="At least 12 characters"
                            type="password"
                          />
                        </label>
                        <label className="form-field">
                          <span>Role</span>
                          <select
                            value={createUserForm.role}
                            onChange={(event) =>
                              setCreateUserForm((current) => ({
                                ...current,
                                role: event.target.value as UserRole,
                              }))
                            }
                          >
                            <option value="operator">Operator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>
                        <button type="submit" className="deploy-button" disabled={createUserSubmitting}>
                          {createUserSubmitting ? 'Creating user...' : 'Create user'}
                        </button>
                      </form>

                      {adminError ? <div className="admin-error-banner">{adminError}</div> : null}

                      <div className="admin-user-list">
                        {adminLoading ? <div className="admin-empty-state">Loading users...</div> : null}
                        {!adminLoading && managedUsers.length === 0 ? (
                          <div className="admin-empty-state">No users found yet.</div>
                        ) : null}
                        {!adminLoading
                          ? managedUsers.map((user) => {
                              const draft = userDrafts[user.id] ?? {
                                name: user.name,
                                role: user.role,
                                status: user.status,
                              }
                              const isSelf = user.id === currentUser?.id

                              return (
                                <div className="admin-user-row" key={user.id}>
                                  <div className="admin-user-summary">
                                    <strong>{user.email}</strong>
                                    <span>
                                      {user.name} · Created {formatDateTime(user.createdAt)} · Last sign-in{' '}
                                      {formatDateTime(user.lastLoginAt)}
                                    </span>
                                  </div>
                                  <label className="form-field">
                                    <span>Name</span>
                                    <input
                                      value={draft.name}
                                      onChange={(event) =>
                                        setUserDrafts((current) => ({
                                          ...current,
                                          [user.id]: {
                                            ...draft,
                                            name: event.target.value,
                                          },
                                        }))
                                      }
                                      disabled={isSelf}
                                    />
                                  </label>
                                  <label className="form-field">
                                    <span>Role</span>
                                    <select
                                      value={draft.role}
                                      onChange={(event) =>
                                        setUserDrafts((current) => ({
                                          ...current,
                                          [user.id]: {
                                            ...draft,
                                            role: event.target.value as UserRole,
                                          },
                                        }))
                                      }
                                      disabled={isSelf}
                                    >
                                      <option value="operator">Operator</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  </label>
                                  <label className="form-field">
                                    <span>Status</span>
                                    <select
                                      value={draft.status}
                                      onChange={(event) =>
                                        setUserDrafts((current) => ({
                                          ...current,
                                          [user.id]: {
                                            ...draft,
                                            status: event.target.value as UserStatus,
                                          },
                                        }))
                                      }
                                      disabled={isSelf}
                                    >
                                      <option value="active">Active</option>
                                      <option value="disabled">Disabled</option>
                                    </select>
                                  </label>
                                  <button
                                    type="button"
                                    className="secondary-button admin-save-button"
                                    onClick={() => void handleUserSave(user.id)}
                                    disabled={isSelf || adminSavingUserId === user.id}
                                  >
                                    {isSelf
                                      ? 'Current admin'
                                      : adminSavingUserId === user.id
                                        ? 'Saving...'
                                        : 'Save changes'}
                                  </button>
                                </div>
                              )
                            })
                          : null}
                      </div>
                    </article>
                  ) : null}
                  {canManageUsers ? (
                    <article className="glass-card admin-card" id="visitor-analytics">
                      <div className="console-card-top">
                        <div className="console-icon-wrap">
                          <Rocket size={18} />
                        </div>
                        <div>
                          <h3>Visitor Analytics</h3>
                          <p>
                            Track visitor journeys, page checkpoints, key button clicks, and payment drop-offs for
                            conversion analysis.
                          </p>
                        </div>
                      </div>

                      <div className="console-actions-row">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => void loadAdminAnalytics()}
                          disabled={analyticsLoading}
                        >
                          {analyticsLoading ? 'Refreshing analytics...' : 'Refresh analytics'}
                        </button>
                      </div>

                      {analyticsError ? <div className="admin-error-banner">{analyticsError}</div> : null}

                      {analyticsSummary ? (
                        <>
                          <div className="analytics-metric-grid">
                            <div className="analytics-metric-card">
                              <strong>{analyticsSummary.totals.visitors}</strong>
                              <span>Visitors / {analyticsSummary.windowDays}d</span>
                            </div>
                            <div className="analytics-metric-card">
                              <strong>{analyticsSummary.totals.sessions}</strong>
                              <span>Sessions</span>
                            </div>
                            <div className="analytics-metric-card">
                              <strong>{analyticsSummary.totals.launchClicks}</strong>
                              <span>Launch clicks</span>
                            </div>
                            <div className="analytics-metric-card">
                              <strong>{analyticsSummary.totals.checkoutStarts}</strong>
                              <span>Checkout starts</span>
                            </div>
                            <div className="analytics-metric-card">
                              <strong>{analyticsSummary.totals.paymentCompletions}</strong>
                              <span>Payments completed</span>
                            </div>
                            <div className="analytics-metric-card">
                              <strong>{analyticsSummary.totals.sectionViews}</strong>
                              <span>Tracked content views</span>
                            </div>
                          </div>

                          <div className="analytics-summary-grid">
                            <div className="analytics-summary-card">
                              <h4>Funnel</h4>
                              <div className="analytics-summary-list">
                                {analyticsSummary.funnel.map((stage) => (
                                  <div className="analytics-summary-row" key={stage.key}>
                                    <span>{stage.label}</span>
                                    <strong>{stage.sessions}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="analytics-summary-card">
                              <h4>Drop-off stages</h4>
                              <div className="analytics-summary-list">
                                {analyticsSummary.dropOffs.length === 0 ? (
                                  <div className="analytics-summary-row">
                                    <span>No drop-offs recorded.</span>
                                  </div>
                                ) : (
                                  analyticsSummary.dropOffs.map((stage) => (
                                    <div className="analytics-summary-row" key={stage.key}>
                                      <span>{stage.label}</span>
                                      <strong>{stage.sessions}</strong>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                            <div className="analytics-summary-card">
                              <h4>Top referrers</h4>
                              <div className="analytics-summary-list">
                                {analyticsSummary.referrers.length === 0 ? (
                                  <div className="analytics-summary-row">
                                    <span>No referrer data yet.</span>
                                  </div>
                                ) : (
                                  analyticsSummary.referrers.map((referrer) => (
                                    <div className="analytics-summary-row" key={referrer.host}>
                                      <span>{referrer.host}</span>
                                      <strong>{referrer.sessions}</strong>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : analyticsLoading ? (
                        <div className="admin-empty-state admin-loading-state">
                          <LoaderCircle size={18} className="loading-spinner-icon" />
                          <span>Loading visitor analytics...</span>
                        </div>
                      ) : null}

                      <div className="analytics-session-card">
                        <div className="subsection-heading">
                          <h4>Recent visitor journeys</h4>
                        </div>
                        {analyticsSessions.length === 0 && !analyticsLoading ? (
                          <div className="admin-empty-state">No tracked sessions yet.</div>
                        ) : (
                          <div className="analytics-session-list">
                            {analyticsSessions.map((session) => (
                              <button
                                type="button"
                                key={session.id}
                                className={`analytics-session-row ${
                                  analyticsDetail?.session.id === session.id ? 'analytics-session-row-active' : ''
                                }`}
                                onClick={() => void loadAnalyticsSessionDetail(session.id)}
                              >
                                <div>
                                  <strong>{session.landingPath}</strong>
                                  <span>
                                    {session.referrerHost ?? '(direct)'} · {formatAnalyticsStageLabel(session.lastStage)}
                                  </span>
                                </div>
                                <div>
                                  <strong>{session.eventCount} events</strong>
                                  <span>{formatDateTime(session.lastSeenAt)}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {analyticsDetailLoading ? (
                        <div className="admin-empty-state admin-loading-state">
                          <LoaderCircle size={18} className="loading-spinner-icon" />
                          <span>Loading visitor journey...</span>
                        </div>
                      ) : analyticsDetail ? (
                        <div className="analytics-detail-card">
                          <div className="subsection-heading">
                            <h4>Journey detail</h4>
                          </div>
                          <div className="analytics-detail-meta">
                            <span>Visitor {analyticsDetail.session.visitorId}</span>
                            <span>{analyticsDetail.session.deviceType}</span>
                            <span>{formatDateTime(analyticsDetail.session.startedAt)}</span>
                          </div>
                          <div className="analytics-event-list">
                            {analyticsDetail.events.map((event) => (
                              <div className="analytics-event-row" key={event.id}>
                                <div>
                                  <strong>{formatAnalyticsStageLabel(event.eventName)}</strong>
                                  <span>
                                    {event.routePath}
                                    {event.sectionKey ? ` · ${event.sectionKey}` : ''}
                                    {event.elementKey ? ` · ${event.elementKey}` : ''}
                                  </span>
                                </div>
                                <time>{formatDateTime(event.occurredAt)}</time>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ) : null}
                </div>
              </>
            ) : null}
          </section>
        ) : null}
        {routeView === 'privacy' ? (
          <section className="content-section page-shell legal-page-shell" data-analytics-section="privacy-page">
            <div className="section-heading legal-page-heading">
              <span className="section-eyebrow">Privacy Policy</span>
              <h2>Privacy Policy</h2>
              <p>
                This Privacy Policy applies to Hermes Agent and explains how visitor, account, order, payment,
                workspace, and support information may be processed when you use the website and related services.
              </p>
            </div>

            <div className="legal-page-stack">
              {privacySections.map((section) => (
                <article className="glass-card legal-card" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul className="legal-list">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
        {routeView === 'terms' ? (
          <section className="content-section page-shell legal-page-shell" data-analytics-section="terms-page">
            <div className="section-heading legal-page-heading">
              <span className="section-eyebrow">Terms of Service</span>
              <h2>Terms of Service</h2>
              <p>
                These Terms of Service govern access to and use of Hermes Agent, including account, order, checkout,
                workspace, console, upgrade, and support-related functionality made available through the website.
              </p>
            </div>

            <div className="legal-page-stack">
              {termsSections.map((section) => (
                <article className="glass-card legal-card" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul className="legal-list">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>Need help with Hermes Agent?</span>
          <a href={`mailto:${supportEmail}`} className="inline-link">
            {supportEmail}
          </a>
          <span className="footer-divider">•</span>
          <a
            href="/privacy"
            className="inline-link"
            onClick={(event) => {
              event.preventDefault()
              navigate('/privacy')
            }}
          >
            Privacy Policy
          </a>
          <span className="footer-divider">•</span>
          <a
            href="/terms"
            className="inline-link"
            onClick={(event) => {
              event.preventDefault()
              navigate('/terms')
            }}
          >
            Terms of Service
          </a>
        </div>
      </footer>

      {checkoutOrder && payPalSession && payPalSession.orderId === checkoutOrder.id ? (
        <div
          className="guide-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.target === event.currentTarget && closePlanPayPalDialog()}
        >
          <div className="upgrade-modal">
            <button type="button" className="guide-close" onClick={closePlanPayPalDialog} aria-label="Close PayPal checkout">
              <X size={18} />
            </button>

            <div className="upgrade-modal-layout">
              <div className="auth-copy-block">
                <span className="auth-eyebrow">PayPal checkout</span>
                <h2>Complete payment inside Hermes Agent</h2>
                <p>
                  This order is already created. Finish the PayPal payment here and we will start deployment immediately
                  after the server confirms the capture.
                </p>
              </div>

              <div className="upgrade-summary-grid">
                <div className="console-row-item">
                  <span>Order</span>
                  <strong>{checkoutOrder.orderNumber}</strong>
                </div>
                <div className="console-row-item">
                  <span>Total</span>
                  <strong>{checkoutOrder.amountLabel}</strong>
                </div>
                <div className="console-row-item">
                  <span>Plan</span>
                  <strong>{checkoutOrder.planName}</strong>
                </div>
                <div className="console-row-item">
                  <span>Channel</span>
                  <strong>{checkoutOrder.channelName}</strong>
                </div>
              </div>

              <div className="paypal-checkout-panel plan-paypal-panel">
                {payPalError ? <div className="admin-error-banner">{payPalError}</div> : null}
                {!payPalButtonsReady ? <div className="admin-empty-state">Loading PayPal checkout...</div> : null}
                <div ref={payPalButtonsRef} className="paypal-buttons-host" />
              </div>

              <div className="console-actions-row upgrade-actions-row">
                <button type="button" className="secondary-button" onClick={closePlanPayPalDialog}>
                  Close
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate(checkoutOrder.consolePath)}
                >
                  Open console
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {upgradeDialogOrder ? (
        <div
          className="guide-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.target === event.currentTarget && closeUpgradeDialog()}
        >
          <div className="upgrade-modal">
            <button type="button" className="guide-close" onClick={closeUpgradeDialog} aria-label="Close upgrade dialog">
              <X size={18} />
            </button>

            <div className="upgrade-modal-layout">
              <div className="auth-copy-block">
                <span className="auth-eyebrow">Hermes upgrade</span>
                <h2>Switch this Hermes Agent version</h2>
                <p>
                  Pick any GitHub version, then confirm the upgrade. The server updates this Hermes workspace on its
                  deployment host and refreshes the visible version after completion.
                </p>
              </div>

              <div className="upgrade-summary-grid">
                <div className="console-row-item">
                  <span>Hermes workspace</span>
                  <strong>{upgradeDialogOrder.instance?.instanceName ?? `${upgradeDialogOrder.modelName} · ${upgradeDialogOrder.channelName}`}</strong>
                </div>
                <div className="console-row-item">
                  <span>Current version</span>
                  <strong>{formatHermesVersion(upgradeDialogOrder.hermesVersion)}</strong>
                </div>
              </div>

              {upgradeVersionsError ? <div className="admin-error-banner">{upgradeVersionsError}</div> : null}

              <div className="upgrade-version-panel">
                {upgradeVersionsLoading ? (
                  <div className="admin-empty-state">Loading GitHub versions...</div>
                ) : upgradeVersions.length === 0 ? (
                  <div className="admin-empty-state">No Hermes Agent versions are available right now.</div>
                ) : (
                  <div className="upgrade-version-list">
                    {upgradeVersions.map((version) => (
                      <label className="upgrade-version-option" key={version.id}>
                        <input
                          type="radio"
                          name="hermes-version"
                          value={version.name}
                          checked={selectedUpgradeVersion === version.name}
                          onChange={(event) => setSelectedUpgradeVersion(event.target.value)}
                        />
                        <span>{version.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="console-actions-row upgrade-actions-row">
                <button type="button" className="secondary-button" onClick={closeUpgradeDialog}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="deploy-button"
                  onClick={() => void handleConfirmUpgrade()}
                  disabled={
                    upgradeVersionsLoading ||
                    !selectedUpgradeVersion ||
                    selectedUpgradeVersion === upgradeDialogOrder.hermesVersion ||
                    upgradeSubmittingOrderId === upgradeDialogOrder.id
                  }
                >
                  {upgradeSubmittingOrderId === upgradeDialogOrder.id ? 'Upgrading Hermes...' : 'Confirm upgrade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {authMode ? (
        <div
          className="guide-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.target === event.currentTarget && closeAuthModal()}
        >
          <div className="auth-modal">
            <button type="button" className="guide-close" onClick={closeAuthModal} aria-label="Close authentication form">
              <X size={18} />
            </button>

            <div className="auth-modal-layout">
              <div className="auth-copy-block">
                <span className="auth-eyebrow">{authMode === 'login' ? 'Secure login' : 'Account setup'}</span>
                <h2>{authMode === 'login' ? 'Sign in to your Hermes workspace' : 'Create an operator account'}</h2>
                <p>
                  {authMode === 'login'
                    ? 'Session cookies are stored server-side, passwords are verified with strong hashing, and disabled users are blocked automatically.'
                    : 'The first registered account becomes admin automatically, then you can manage roles and status from the console.'}
                </p>
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'register' ? (
                  <label className="form-field">
                    <span>Full name</span>
                    <input
                      value={authForm.name}
                      onChange={(event) =>
                        setAuthForm((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Jane Operator"
                    />
                  </label>
                ) : null}
                <label className="form-field">
                  <span>Email</span>
                  <input
                    value={authForm.email}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="name@company.com"
                    type="email"
                  />
                </label>
                <label className="form-field">
                  <span>Password</span>
                  <input
                    value={authForm.password}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Use at least 12 characters"
                    type="password"
                  />
                </label>

                {authError ? <div className="admin-error-banner">{authError}</div> : null}

                <button type="submit" className="deploy-button" disabled={authSubmitting}>
                  {authSubmitting
                    ? authMode === 'login'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : authMode === 'login'
                      ? 'Sign in'
                      : 'Create account'}
                </button>

                <div className="auth-switch-row">
                  <span>
                    {authMode === 'login' ? 'Need an account?' : 'Already have an account?'}
                  </span>
                  <button
                    type="button"
                    className="auth-inline-button"
                    onClick={() => openAuthModal(authMode === 'login' ? 'register' : 'login')}
                  >
                    {authMode === 'login' ? 'Create account' : 'Log in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {currentGuide ? (
        <div className="guide-overlay" role="dialog" aria-modal="true" onClick={(event) => event.target === event.currentTarget && setActiveGuide(null)}>
          <div className="guide-modal">
            <button type="button" className="guide-close" onClick={() => setActiveGuide(null)} aria-label="Close guide">
              <X size={18} />
            </button>

            <div className="guide-layout">
              <section className="guide-pane guide-pane-left">
                <div className="guide-title-row">
                  <span className={`guide-channel-icon ${activeGuide}`}>
                    {activeGuide === 'telegram' ? (
                      <TelegramLogo />
                    ) : activeGuide === 'discord' ? (
                      <DiscordLogo />
                    ) : (
                      <WhatsAppLogo />
                    )}
                  </span>
                  <h2>{currentGuide.title}</h2>
                </div>

                <div className="guide-copy-block">
                  <p className="guide-subtitle">How to get your bot token?</p>
                  <ol className="guide-steps">
                    {currentGuide.steps.map((step, index) => (
                      <li key={index}>
                        <span className="guide-step-index">{index + 1}.</span>
                        <span className="guide-step-copy">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="guide-divider" />

                <div className="guide-form-block">
                  <label className="guide-field-label">{currentGuide.tokenLabel}</label>
                  <input
                    className="guide-token-input"
                    value={activeGuide ? guideInputs[activeGuide] : ''}
                    onChange={(event) => handleGuideInputChange(event.target.value)}
                    placeholder={currentGuide.tokenPlaceholder}
                  />
                  <button
                    type="button"
                    className={`guide-save-button ${
                      canSaveGuide ? 'guide-save-button-ready' : ''
                    }`}
                    onClick={handleGuideSave}
                  >
                    <span>Save</span>
                    <Check size={15} />
                  </button>
                </div>
              </section>

              <section className="guide-pane guide-pane-right">
                <div className="phone-frame">
                  <div className="phone-topbar">
                    <span>9:41</span>
                    <div className="phone-top-icons">
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="phone-profile">
                    <div className="phone-avatar">{currentGuide.phone.avatar}</div>
                    <div>
                      <div className="phone-profile-name">{currentGuide.phone.name}</div>
                      <div className="phone-profile-subtitle">{currentGuide.phone.subtitle}</div>
                    </div>
                  </div>

                  <div className="phone-chat-body">
                    <div className="chat-bubble chat-bubble-incoming">
                      <div className="chat-bubble-text">{currentGuide.phone.lead.text}</div>
                      <div className="chat-bubble-time">{currentGuide.phone.lead.time}</div>
                    </div>

                    <div className="phone-quick-actions">
                      {currentGuide.phone.quickActions.map((action) => (
                        <div key={action.title} className="quick-action-card">
                          <div className="quick-action-title">{action.title}</div>
                          {action.subtitle ? <div className="quick-action-subtitle">{action.subtitle}</div> : null}
                        </div>
                      ))}
                    </div>

                    <div className="chat-row chat-row-outgoing">
                      <div className="chat-bubble chat-bubble-outgoing">
                        <div className="chat-bubble-text">{currentGuide.phone.outgoing.text}</div>
                        <div className="chat-bubble-time">{currentGuide.phone.outgoing.time}</div>
                      </div>
                    </div>

                    <div className="chat-bubble chat-bubble-incoming">
                      <div className="chat-bubble-text">{currentGuide.phone.reply.text}</div>
                      <div className="chat-bubble-time">{currentGuide.phone.reply.time}</div>
                    </div>
                  </div>

                  <div className="phone-composer">
                    <div className="composer-dot" />
                    <span>{currentGuide.phone.composer}</span>
                    <button type="button" className="composer-send" aria-label="Send">
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
