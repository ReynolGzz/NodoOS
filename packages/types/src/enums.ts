export enum OrderStatus {
  RECEIVED = 'received',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  MERCADOPAGO = 'mercadopago',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  CASH = 'cash',
}

export enum ProductOptionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  BARISTA = 'barista',
  WAITER = 'waiter',
  CUSTOMER = 'customer',
}

export enum AuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  EMAIL = 'email',
}

export enum TableMode {
  CASUAL = 'casual',
  WORK = 'work',
  STUDY = 'study',
  MEETING = 'meeting',
}

export enum UserLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  BLACK = 'black',
}

export enum RewardType {
  DISCOUNT = 'discount',
  FREE_ITEM = 'free_item',
  UPGRADE = 'upgrade',
  REFILL = 'refill',
}

export enum Locale {
  ES = 'es',
  EN = 'en',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}
