import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

export type TenantPlan = 'starter' | 'pro' | 'enterprise'

export interface TenantBranding {
  logoUrl: string | null
  primaryColor: string
  accentColor: string
  fontFamily: string | null
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true, length: 50 })
  slug: string

  @Column({ length: 150 })
  name: string

  @Column({ default: 'starter', length: 20 })
  plan: TenantPlan

  @Column({ name: 'stripe_customer_id', length: 200, nullable: true })
  stripeCustomerId: string | null

  @Column({ name: 'stripe_subscription_id', length: 200, nullable: true })
  stripeSubscriptionId: string | null

  @Column({ type: 'jsonb', default: '{"primaryColor":"#c8973a","accentColor":"#e8b355","logoUrl":null,"fontFamily":null}' })
  branding: TenantBranding

  @Column({ name: 'custom_domain', length: 200, nullable: true })
  customDomain: string | null

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
