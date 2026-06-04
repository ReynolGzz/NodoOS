import { Order, OrderItem } from './models'
import { OrderStatus } from './enums'

// ─── Client → Server ──────────────────────────────────────────────────────────

export interface SubscribeOrderEvent {
  orderId: string
}

export interface JoinKitchenEvent {
  branchId: string
  token: string
}

export interface KitchenStatusChangeEvent {
  orderId: string
  newStatus: OrderStatus
}

// ─── Server → Client ──────────────────────────────────────────────────────────

export interface OrderUpdatedEvent {
  orderId: string
  status: OrderStatus
  estimatedMinutes?: number
  updatedAt: string
}

export interface NewOrderEvent {
  order: Order & {
    tableNumber: number
    zoneName?: string
  }
}

export interface OrderStatusChangedEvent {
  orderId: string
  status: OrderStatus
  tableNumber: number
}

// ─── Socket event names ────────────────────────────────────────────────────────

export const SOCKET_EVENTS = {
  // Client → Server
  ORDER_SUBSCRIBE: 'order:subscribe',
  KITCHEN_JOIN: 'kitchen:join',
  KITCHEN_STATUS_CHANGE: 'kitchen:status:change',

  // Server → Client (customer)
  ORDER_UPDATED: 'order:updated',

  // Server → Kitchen
  ORDER_NEW: 'order:new',
  ORDER_STATUS_CHANGED: 'order:status:changed',
} as const
