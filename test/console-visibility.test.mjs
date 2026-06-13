import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildConsoleMetrics,
  buildHermesManagementRows,
  buildOrdersReadyForDeployment,
  buildPendingPaymentOrders,
  canHermesManagementConsole,
  canPayForOrder,
  canRedeployManagementRow,
  getRedeployManagementState,
} from '../shared/console-visibility.mjs'

function createOrder(overrides = {}) {
  return {
    id: 'order-1',
    orderNumber: 'OC-1001',
    planId: 'starter:monthly',
    planName: 'Starter · Monthly',
    amountCents: 900,
    amountLabel: '$9',
    currency: 'USD',
    modelId: 'gpt-5-4',
    modelName: 'GPT-5.4',
    channelId: 'telegram',
    channelName: 'Telegram',
    paymentStatus: 'pending',
    deploymentStatus: 'awaiting_payment',
    statusMessage: 'Waiting for payment before Hermes can be launched.',
    deploymentEtaMinutes: 10,
    includedDeployments: 1,
    deploymentsUsed: 0,
    deploymentsRemaining: 1,
    canTriggerDeployment: false,
    bindingStatus: 'unbound',
    tokenDisplay: 'Not bound',
    hermesVersion: 'main',
    upgradeStatus: 'idle',
    upgradeTargetVersion: null,
    upgradeError: null,
    createdAt: '2026-04-02T00:00:00.000Z',
    updatedAt: '2026-04-02T00:00:00.000Z',
    paidAt: null,
    checkoutPath: '/checkout?order=order-1&guest_token=guest-token',
    consolePath: '/console?order=order-1&guest_token=guest-token',
    deployment: null,
    deployments: [],
    instance: null,
    ...overrides,
  }
}

function createDeployment(overrides = {}) {
  return {
    id: 'deployment-1',
    instanceName: 'Telegram Hermes #1',
    status: 'deployed',
    triggerMode: 'automatic',
    sequenceNumber: 1,
    progress: 100,
    etaMinutes: 10,
    targetServer: 'server-a',
    workspacePath: '/srv/hermes-1',
    consoleUrl: 'http://console-1.example',
    publicEndpoint: 'http://public-1.example',
    runtimeUser: 'hermes',
    serviceName: 'hermes-1',
    lastMessage: 'Deployment finished.',
    startedAt: '2026-04-02T00:01:00.000Z',
    finishedAt: '2026-04-02T00:02:00.000Z',
    updatedAt: '2026-04-02T00:02:00.000Z',
    ...overrides,
  }
}

function createClaw(overrides = {}) {
  return {
    id: 'claw-1',
    orderId: 'order-1',
    deploymentId: 'deployment-1',
    sequenceNumber: 1,
    instanceName: 'Telegram Hermes #1',
    modelId: 'gpt-5-4',
    modelName: 'GPT-5.4',
    channelId: 'telegram',
    channelName: 'Telegram',
    status: 'running',
    targetServer: 'server-a',
    workspacePath: '/srv/hermes-1',
    consoleUrl: 'http://console-1.example',
    publicEndpoint: 'http://public-1.example',
    runtimeUser: 'hermes',
    serviceName: 'hermes-1',
    runtimeState: 'running',
    hermesVersion: 'main',
    upgradeStatus: 'idle',
    upgradeTargetVersion: null,
    upgradeError: null,
    createdAt: '2026-04-02T00:02:00.000Z',
    updatedAt: '2026-04-02T00:02:00.000Z',
    ...overrides,
  }
}

test('Hermes Management 按部署/实例出行，并保留旧实例与新队列记录', () => {
  const firstDeployment = createDeployment()
  const secondDeployment = createDeployment({
    id: 'deployment-2',
    instanceName: 'Telegram Hermes #2',
    status: 'queued',
    triggerMode: 'manual',
    sequenceNumber: 2,
    progress: 15,
    consoleUrl: null,
    publicEndpoint: null,
    runtimeUser: null,
    serviceName: null,
    lastMessage: 'Queued for deployment.',
    startedAt: null,
    finishedAt: null,
    updatedAt: '2026-04-02T00:03:00.000Z',
  })
  const existingClaw = createClaw()
  const rows = buildHermesManagementRows({
    orders: [
      createOrder({
        paymentStatus: 'paid',
        deploymentStatus: 'queued',
        deployments: [secondDeployment, firstDeployment],
        deployment: secondDeployment,
        instance: existingClaw,
      }),
    ],
    claws: [existingClaw],
  })

  assert.equal(rows.length, 2)
  assert.equal(rows[0].deployment?.id, 'deployment-2')
  assert.equal(rows[0].claw, null)
  assert.equal(rows[0].isLatestForOrder, true)
  assert.equal(rows[1].deployment?.id, 'deployment-1')
  assert.equal(rows[1].claw?.id, 'claw-1')
  assert.equal(rows[1].isLatestForOrder, false)
})

test('没有部署或实例的订单不会占用 Hermes Management 列表', () => {
  const rows = buildHermesManagementRows({
    orders: [createOrder()],
    claws: [],
  })

  assert.equal(rows.length, 0)
})

test('历史失败 deployment 在当前无进行中部署时也能显示 Deploy', () => {
  const failedDeployment = createDeployment({
    id: 'deployment-1',
    status: 'failed',
    triggerMode: 'manual',
    progress: 55,
    consoleUrl: null,
    publicEndpoint: null,
    runtimeUser: null,
    serviceName: null,
    lastMessage: 'Disk quota exceeded.',
  })
  const currentDeployment = createDeployment({
    id: 'deployment-2',
    sequenceNumber: 2,
    instanceName: 'Telegram Hermes #2',
    triggerMode: 'manual',
  })
  const currentClaw = createClaw({
    id: 'claw-2',
    deploymentId: 'deployment-2',
    sequenceNumber: 2,
    instanceName: 'Telegram Hermes #2',
  })
  const rows = buildHermesManagementRows({
    orders: [
      createOrder({
        paymentStatus: 'paid',
        deploymentStatus: 'deployed',
        canTriggerDeployment: true,
        deploymentsRemaining: 1,
        deployments: [currentDeployment, failedDeployment],
        deployment: currentDeployment,
        instance: currentClaw,
      }),
    ],
    claws: [currentClaw],
  })

  const failedRow = rows.find((row) => row.deployment?.id === 'deployment-1')
  const currentRow = rows.find((row) => row.deployment?.id === 'deployment-2')

  assert.ok(failedRow)
  assert.ok(currentRow)
  assert.equal(canRedeployManagementRow(failedRow), true)
  assert.equal(canRedeployManagementRow(currentRow), false)
})

test('历史失败 deployment 在最新部署仍进行中时不显示 Deploy', () => {
  const failedDeployment = createDeployment({
    id: 'deployment-1',
    status: 'failed',
    triggerMode: 'manual',
    progress: 55,
    consoleUrl: null,
    publicEndpoint: null,
    runtimeUser: null,
    serviceName: null,
    lastMessage: 'No space left on device.',
  })
  const queuedDeployment = createDeployment({
    id: 'deployment-2',
    status: 'queued',
    triggerMode: 'manual',
    sequenceNumber: 2,
    progress: 10,
    consoleUrl: null,
    publicEndpoint: null,
    runtimeUser: null,
    serviceName: null,
    lastMessage: 'Queued for deployment.',
    startedAt: null,
    finishedAt: null,
  })
  const rows = buildHermesManagementRows({
    orders: [
      createOrder({
        paymentStatus: 'paid',
        deploymentStatus: 'queued',
        canTriggerDeployment: true,
        deploymentsRemaining: 1,
        deployments: [queuedDeployment, failedDeployment],
        deployment: queuedDeployment,
      }),
    ],
    claws: [],
  })

  const failedRow = rows.find((row) => row.deployment?.id === 'deployment-1')

  assert.ok(failedRow)
  assert.equal(canRedeployManagementRow(failedRow), true)
  assert.deepEqual(getRedeployManagementState(failedRow), {
    visible: true,
    disabled: true,
    label: 'Deploy',
  })
})

test('鏈€鏂伴儴缃叉鍦ㄨ繘琛屾椂鍙湁褰撳墠閭ｄ竴琛屾樉绀?Deployment running', () => {
  const failedDeployment = createDeployment({
    id: 'deployment-1',
    status: 'failed',
    triggerMode: 'manual',
    progress: 55,
    consoleUrl: null,
    publicEndpoint: null,
    runtimeUser: null,
    serviceName: null,
    lastMessage: 'No space left on device.',
  })
  const queuedDeployment = createDeployment({
    id: 'deployment-2',
    status: 'queued',
    triggerMode: 'manual',
    sequenceNumber: 2,
    progress: 10,
    consoleUrl: null,
    publicEndpoint: null,
    runtimeUser: null,
    serviceName: null,
    lastMessage: 'Queued for deployment.',
    startedAt: null,
    finishedAt: null,
  })
  const rows = buildHermesManagementRows({
    orders: [
      createOrder({
        paymentStatus: 'paid',
        deploymentStatus: 'queued',
        canTriggerDeployment: true,
        deploymentsRemaining: 1,
        deployments: [queuedDeployment, failedDeployment],
        deployment: queuedDeployment,
      }),
    ],
    claws: [],
  })

  const failedRow = rows.find((row) => row.deployment?.id === 'deployment-1')
  const queuedRow = rows.find((row) => row.deployment?.id === 'deployment-2')

  assert.ok(failedRow)
  assert.ok(queuedRow)
  assert.deepEqual(getRedeployManagementState(failedRow), {
    visible: true,
    disabled: true,
    label: 'Deploy',
  })
  assert.deepEqual(getRedeployManagementState(queuedRow), {
    visible: true,
    disabled: true,
    label: 'Deployment running...',
  })
})

test('杩愯涓殑瀹炰緥鍗充娇鍏崇潃澶辫触 deployment 鍗′篃淇濈暀 Open console', () => {
  const failedDeployment = createDeployment({
    status: 'failed',
    triggerMode: 'manual',
    progress: 55,
    lastMessage: 'Install step failed.',
  })
  const runningClaw = createClaw({
    deploymentId: 'deployment-1',
    runtimeState: 'running',
  })
  const rows = buildHermesManagementRows({
    orders: [
      createOrder({
        paymentStatus: 'paid',
        deploymentStatus: 'failed',
        deployment: failedDeployment,
        deployments: [failedDeployment],
        instance: runningClaw,
      }),
    ],
    claws: [runningClaw],
  })

  assert.equal(rows.length, 1)
  assert.equal(canHermesManagementConsole(rows[0]), true)
})

test('宸插仠姝㈢殑瀹炰緥涓嶄細缁х画鏄剧ず Open console', () => {
  const failedDeployment = createDeployment({
    status: 'failed',
    triggerMode: 'manual',
    progress: 55,
    lastMessage: 'Install step failed.',
  })
  const stoppedClaw = createClaw({
    deploymentId: 'deployment-1',
    runtimeState: 'stopped',
  })
  const rows = buildHermesManagementRows({
    orders: [
      createOrder({
        paymentStatus: 'paid',
        deploymentStatus: 'failed',
        deployment: failedDeployment,
        deployments: [failedDeployment],
        instance: stoppedClaw,
      }),
    ],
    claws: [stoppedClaw],
  })

  assert.equal(rows.length, 1)
  assert.equal(canHermesManagementConsole(rows[0]), false)
})

test('Orders 卡片统计只计算已支付订单的部署额度', () => {
  const metrics = buildConsoleMetrics({
    orders: [
      createOrder({
        id: 'pending-order',
        includedDeployments: 5,
        deploymentsRemaining: 5,
      }),
      createOrder({
        id: 'paid-order',
        paymentStatus: 'paid',
        deploymentStatus: 'queued',
        statusMessage: 'Deployment is queued.',
        includedDeployments: 5,
        deploymentsRemaining: 4,
        canTriggerDeployment: true,
        paidAt: '2026-04-02T00:05:00.000Z',
      }),
    ],
    claws: [],
  })

  assert.equal(metrics.unpaidOrders, 1)
  assert.equal(metrics.paidOrders, 1)
  assert.equal(metrics.totalDeploymentsIncluded, 5)
  assert.equal(metrics.availableTriggers, 4)
})

test('Orders 卡片只展示已支付且仍可继续部署的订单', () => {
  const readyOrders = buildOrdersReadyForDeployment({
    orders: [
      createOrder({
        id: 'pending-order',
      }),
      createOrder({
        id: 'paid-order',
        paymentStatus: 'paid',
        deploymentStatus: 'queued',
        canTriggerDeployment: true,
        deploymentsRemaining: 2,
        paidAt: '2026-04-02T00:05:00.000Z',
      }),
      createOrder({
        id: 'paid-but-exhausted',
        paymentStatus: 'paid',
        deploymentStatus: 'deployed',
        canTriggerDeployment: false,
        deploymentsRemaining: 0,
        paidAt: '2026-04-02T00:05:00.000Z',
      }),
    ],
    claws: [],
  })

  assert.deepEqual(readyOrders.map((order) => order.id), ['paid-order'])
})

test('未支付订单保留 Pay now，已支付订单不再显示支付入口', () => {
  assert.equal(canPayForOrder(createOrder()), true)
  assert.equal(
    canPayForOrder(
      createOrder({
        paymentStatus: 'paid',
        paidAt: '2026-04-02T00:05:00.000Z',
      }),
    ),
    false,
  )
})

test('失败实例即使残留 console URL 也不会显示 Open console', () => {
  const failedDeployment = createDeployment({
    status: 'failed',
    triggerMode: 'manual',
    progress: 55,
    consoleUrl: 'http://stale-console.example',
    lastMessage: 'Install step failed.',
  })
  const failedClaw = createClaw({
    deploymentId: 'deployment-1',
    status: 'failed',
    runtimeState: 'failed',
    consoleUrl: 'http://stale-console.example',
  })
  const rows = buildHermesManagementRows({
    orders: [
      createOrder({
        paymentStatus: 'paid',
        deploymentStatus: 'failed',
        deployment: failedDeployment,
        deployments: [failedDeployment],
        instance: failedClaw,
      }),
    ],
    claws: [failedClaw],
  })

  assert.equal(rows.length, 1)
  assert.equal(canHermesManagementConsole(rows[0]), false)
})
