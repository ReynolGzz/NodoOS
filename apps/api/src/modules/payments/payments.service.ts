import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from '../../entities/order.entity'
import { StripeService } from './stripe.service'
import { MercadoPagoService } from './mercadopago.service'
import { LoyaltyService } from '../users/loyalty.service'
import { PaymentMethod, PaymentStatus } from '@nodo/types'

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private stripeService: StripeService,
    private mpService: MercadoPagoService,
    private loyaltyService: LoyaltyService,
  ) {}

  async createPaymentIntent(orderId: string, method: PaymentMethod) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')

    const amountCents = Math.round(order.total * 100)

    if (method === PaymentMethod.STRIPE || method === PaymentMethod.APPLE_PAY || method === PaymentMethod.GOOGLE_PAY) {
      const intent = await this.stripeService.createPaymentIntent(
        amountCents,
        'mxn',
        { orderId },
      )
      await this.orderRepo.update(orderId, { paymentIntentId: intent.id })
      return { clientSecret: intent.client_secret }
    }

    if (method === PaymentMethod.MERCADOPAGO) {
      const items = [{ title: `Orden NODO #${orderId.slice(-6)}`, quantity: 1, unit_price: order.total }]
      const pref = await this.mpService.createPreference(orderId, items, {
        success: `${process.env.APP_URL}/order/${orderId}?payment=success`,
        failure: `${process.env.APP_URL}/order/${orderId}?payment=failed`,
        pending: `${process.env.APP_URL}/order/${orderId}?payment=pending`,
      })
      return { preferenceId: pref.id, initPoint: pref.init_point }
    }

    throw new Error(`Unsupported payment method: ${method}`)
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const event = this.stripeService.constructWebhookEvent(payload, signature)

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string; metadata: { orderId?: string } }
      if (intent.metadata.orderId) {
        await this.orderRepo.update(intent.metadata.orderId, {
          paymentStatus: PaymentStatus.PAID,
          paymentIntentId: intent.id,
        })
        const order = await this.orderRepo.findOne({ where: { id: intent.metadata.orderId } })
        if (order?.userId) {
          await this.loyaltyService.earnFromPurchase(order.userId, order.id, order.total)
        }
      }
    }
  }

  async handleMercadoPagoWebhook(data: { type: string; data: { id: string } }) {
    if (data.type === 'payment') {
      // Validate payment via MP API and update order
      // Full implementation pending MP payment lookup
    }
  }
}
