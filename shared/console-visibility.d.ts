import type { ClawInstanceRecord, ConsoleData, DeploymentRecord, OrderRecord } from '../src/app-types'

export type HermesManagementRow = {
  id: string
  order: OrderRecord
  deployment: DeploymentRecord | null
  claw: ClawInstanceRecord | null
  isLatestForOrder: boolean
}

export type ConsoleMetrics = {
  trackedOrders: number
  unpaidOrders: number
  paidOrders: number
  liveClaws: number
  createdClaws: number
  totalDeploymentsIncluded: number
  availableTriggers: number
}

export type RedeployManagementState = {
  visible: boolean
  disabled: boolean
  label: string
}

export function buildHermesManagementRows(consoleData: ConsoleData): HermesManagementRow[]
export function getRedeployManagementState(row: HermesManagementRow): RedeployManagementState
export function canHermesManagementConsole(row: HermesManagementRow): boolean
export function canRedeployManagementRow(row: HermesManagementRow): boolean
export function buildConsoleMetrics(consoleData: ConsoleData): ConsoleMetrics
export function buildOrdersReadyForDeployment(consoleData: ConsoleData): OrderRecord[]
export function buildPendingPaymentOrders(consoleData: ConsoleData): OrderRecord[]
export function canPayForOrder(order: OrderRecord): boolean
