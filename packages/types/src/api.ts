import { CartItem, Order, User, Reward, PointsTransaction } from './models'
import { OrderStatus, PaymentMethod } from './enums'

// ─── Generic ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface CreateOrderDto {
  tableToken: string
  sessionToken?: string
  userId?: string
  items: CreateOrderItemDto[]
  notes?: string
  paymentMethod: PaymentMethod
}

export interface CreateOrderItemDto {
  productId: string
  quantity: number
  notes?: string
  customizations: {
    optionId: string
    valueId: string
  }[]
}

export interface UpdateOrderStatusDto {
  status: OrderStatus
}

export interface CreatePaymentIntentDto {
  orderId: string
  paymentMethod: PaymentMethod
}

export interface PaymentIntentResponse {
  clientSecret?: string
  preferenceId?: string
  initPoint?: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface SendMagicLinkDto {
  email: string
  locale?: string
}

export interface VerifyMagicLinkDto {
  token: string
}

export interface UpdateProfileDto {
  name?: string
  phone?: string
  preferences?: {
    locale?: string
    theme?: string
    preferredMilk?: string
    preferredSugar?: string
  }
}

// ─── Loyalty ──────────────────────────────────────────────────────────────────

export interface RedeemRewardDto {
  rewardId: string
  orderId: string
}

export interface ReorderDto {
  sourceOrderId: string
  tableToken: string
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrdersToday: number
  totalRevenueToday: number
  activeOrders: number
  avgOrderValue: number
  topProducts: { productId: string; name: string; count: number }[]
}

export interface CreateProductDto {
  categoryId: string
  nameEs: string
  nameEn: string
  descriptionEs?: string
  descriptionEn?: string
  price: number
  imageUrl?: string
  isAvailable?: boolean
  sortOrder?: number
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
