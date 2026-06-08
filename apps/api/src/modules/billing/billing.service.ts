import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import Stripe from 'stripe'
import { Tenant, TenantPlan } from '../../entities/tenant.entity'

export const PLANS: Record<TenantPlan, {
  label: string
  priceMonthlyMXN: number
  maxBranches: number
  maxOrdersPerMonth: number | null
  stripePriceId: string | null
  features: string[]
}> = {
  starter: {
    label: 'Starter',
    priceMonthlyMXN: 499,
    maxBranches: 1,
    maxOrdersPerMonth: 500,
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? null,
    features: ['1 sucursal', '500 órdenes/mes', 'Dashboard básico', 'Soporte por email'],
  },
  pro: {
    label: 'Pro',
    priceMonthlyMXN: 1499,
    maxBranches: 3,
    maxOrdersPerMonth: null,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
    features: ['Hasta 3 sucursales', 'Órdenes ilimitadas', 'Analytics + Forecast', 'CRM + Campañas', 'Soporte prioritario'],
  },
  enterprise: {
    label: 'Enterprise',
    priceMonthlyMXN: 3999,
    maxBranches: Infinity,
    maxOrdersPerMonth: null,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE ?? null,
    features: ['Sucursales ilimitadas', 'White-label completo', 'Dominio propio', 'SLA 99.9%', 'Soporte dedicado'],
  },
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name)
  private stripe: Stripe | null = null

  constructor(
    private config: ConfigService,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
  ) {
    const key = config.get<string>('STRIPE_SECRET_KEY')
    if (key) this.stripe = new Stripe(key)
  }

  getPlans() {
    return Object.entries(PLANS).map(([key, plan]) => ({
      id: key as TenantPlan,
      ...plan,
    }))
  }

  async createCheckoutSession(tenantId: string, plan: TenantPlan, locale: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    if (!tenant || !this.stripe) return null

    const planConfig = PLANS[plan]
    if (!planConfig.stripePriceId) return null

    let customerId = tenant.stripeCustomerId
    if (!customerId) {
      const customer = await this.stripe.customers.create({ name: tenant.name, metadata: { tenantId } })
      customerId = customer.id
      await this.tenantRepo.update(tenantId, { stripeCustomerId: customerId })
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
      success_url: `${this.config.get('ADMIN_URL')}/billing?success=1`,
      cancel_url: `${this.config.get('ADMIN_URL')}/billing?cancelled=1`,
      metadata: { tenantId, plan },
      locale: locale === 'en' ? 'en' : 'es',
    })

    return { url: session.url, sessionId: session.id }
  }

  async createPortalSession(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    if (!tenant?.stripeCustomerId || !this.stripe) return null

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${this.config.get('ADMIN_URL')}/billing`,
    })

    return { url: session.url }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) return

    const webhookSecret = this.config.get<string>('STRIPE_BILLING_WEBHOOK_SECRET')
    if (!webhookSecret) return

    let event: Stripe.Event
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch {
      this.logger.warn('Billing webhook signature validation failed')
      return
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { tenantId, plan } = session.metadata ?? {}
      if (tenantId && plan) {
        await this.tenantRepo.update(tenantId, {
          plan: plan as TenantPlan,
          stripeSubscriptionId: session.subscription as string,
        })
        this.logger.log(`Tenant ${tenantId} upgraded to ${plan}`)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const tenant = await this.tenantRepo.findOne({
        where: { stripeSubscriptionId: sub.id },
      })
      if (tenant) {
        await this.tenantRepo.update(tenant.id, { plan: 'starter', stripeSubscriptionId: null })
        this.logger.log(`Tenant ${tenant.id} downgraded to starter (sub cancelled)`)
      }
    }
  }

  async getSubscriptionStatus(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    if (!tenant) return null

    const plan = PLANS[tenant.plan]
    let stripeStatus: string | null = null

    if (tenant.stripeSubscriptionId && this.stripe) {
      try {
        const sub = await this.stripe.subscriptions.retrieve(tenant.stripeSubscriptionId)
        stripeStatus = sub.status
      } catch {
        stripeStatus = null
      }
    }

    return {
      tenantId,
      currentPlan: tenant.plan,
      planDetails: plan,
      stripeStatus,
      stripeCustomerId: tenant.stripeCustomerId,
    }
  }
}
