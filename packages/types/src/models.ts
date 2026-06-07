import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductOptionType,
  RewardType,
  UserLevel,
  TableMode,
  AuthProvider,
  UserRole,
} from './enums'

// ─── Branch & Table ────────────────────────────────────────────────────────────

export interface Branch {
  id: string
  name: string
  slug: string
  address?: string
  timezone: string
  isActive: boolean
  createdAt: string
}

export interface Zone {
  id: string
  branchId: string
  name: string
}

export interface Table {
  id: string
  branchId: string
  zoneId?: string
  number: number
  qrToken: string
  capacity: number
  isActive: boolean
}

export interface TableContext {
  table: Table
  branch: Branch
  zone?: Zone
}

// ─── Menu ──────────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  branchId: string
  nameEs: string
  nameEn: string
  sortOrder: number
  isActive: boolean
}

export interface OptionValue {
  id: string
  optionId: string
  nameEs: string
  nameEn: string
  priceDelta: number
}

export interface ProductOption {
  id: string
  productId: string
  nameEs: string
  nameEn: string
  type: ProductOptionType
  isRequired: boolean
  values: OptionValue[]
}

export interface Product {
  id: string
  branchId: string
  categoryId: string
  nameEs: string
  nameEn: string
  descriptionEs?: string
  descriptionEn?: string
  price: number
  imageUrl?: string
  isAvailable: boolean
  sortOrder: number
  options: ProductOption[]
}

export interface MenuData {
  branch: Branch
  table: Table
  zone?: Zone
  categories: Category[]
  products: Product[]
}

// ─── Cart & Order ──────────────────────────────────────────────────────────────

export interface CartItemCustomization {
  optionId: string
  valueId: string
  optionName: string
  valueName: string
  priceDelta: number
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  notes?: string
  customizations: CartItemCustomization[]
}

export interface Order {
  id: string
  branchId: string
  tableId: string
  table?: Pick<Table, 'number'>
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  subtotal: number
  total: number
  notes?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Pick<Product, 'nameEs' | 'nameEn' | 'imageUrl'>
  quantity: number
  unitPrice: number
  notes?: string
  customizations: CartItemCustomization[]
}

// ─── User & Auth ───────────────────────────────────────────────────────────────

export interface UserPreferences {
  locale?: string
  theme?: string
  preferredMilk?: string
  preferredSugar?: string
}

export interface User {
  id: string
  email?: string
  name?: string
  avatarUrl?: string
  phone?: string
  preferences: UserPreferences
  totalPoints: number
  totalVisits: number
  totalSpent: number
  level?: UserLevel
  xp?: number
  createdAt: string
}

export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: string
}

// ─── Loyalty & Rewards ─────────────────────────────────────────────────────────

export interface PointsTransaction {
  id: string
  userId: string
  orderId?: string
  points: number
  reason: string
  createdAt: string
}

export interface Reward {
  id: string
  branchId: string
  nameEs: string
  nameEn: string
  pointsCost: number
  rewardType: RewardType
  value?: number
  productId?: string
  isActive: boolean
}

// ─── Staff ─────────────────────────────────────────────────────────────────────

export interface Staff {
  id: string
  userId: string
  user: Pick<User, 'name' | 'email' | 'avatarUrl'>
  role: UserRole
  branchId?: string
}

// ─── Productivity ─────────────────────────────────────────────────────────────

export interface TableSessionDto {
  id: string
  tableId: string
  userId: string | null
  mode: TableMode
  participants: string[]
  startedAt: string
  endedAt: string | null
}

export interface ReservationDto {
  id: string
  branchId: string
  userId: string
  tableId: string | null
  reservedAt: string
  durationMinutes: number
  partySize: number
  mode: string | null
  status: string
  notes: string | null
  createdAt: string
}

export interface BillSplit {
  orderId: string
  total: number
  partySize: number
  perPerson: number
  items: Array<{ name: string; price: number; quantity: number; subtotal: number }>
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface BadgeDto {
  id: string
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  icon: string
  xpReward: number
  earned: boolean
  earnedAt: string | null
}

export interface ChallengeDto {
  id: string
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  challengeType: string
  targetValue: number
  xpReward: number
  progress: number
  completedAt: string | null
  expiresAt: string | null
}

export interface CafeEvent {
  id: string
  branchId: string
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  eventType: string
  startsAt: string
  endsAt: string
  xpReward: number
}

export interface GamificationProfile {
  xp: number
  level: UserLevel
  next: UserLevel | null
  xpToNext: number
  progress: number
  badges: BadgeDto[]
  challenges: ChallengeDto[]
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface RecommendationResult {
  products: Product[]
  greeting: string
}

export interface UserProfile {
  userId: string
  preferredMilk: string | null
  preferredSugar: string | null
  avgTicket: number | null
  peakHours: Record<string, number>
  topCategories: Array<{ categoryId: string; frequency: number }>
  topProducts: Array<{ productId: string; orderCount: number }>
  lastUpdated: string
}
