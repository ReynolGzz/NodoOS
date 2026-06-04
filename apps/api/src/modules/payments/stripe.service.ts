import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'

@Injectable()
export class StripeService {
  private stripe: Stripe

  constructor(private config: ConfigService) {
    this.stripe = new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
    })
  }

  async createPaymentIntent(amountCents: number, currency: string, metadata: Record<string, string>) {
    return this.stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    })
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.getOrThrow('STRIPE_WEBHOOK_SECRET'),
    )
  }
}
