import { Controller, Post, Body, Req, Headers, RawBodyRequest } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Request } from 'express'
import { PaymentsService } from './payments.service'
import { PaymentMethod } from '@nodo/types'
import { IsEnum, IsUUID } from 'class-validator'

class CreatePaymentIntentDto {
  @IsUUID()
  orderId: string

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @ApiOperation({ summary: 'Create payment intent for an order' })
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto.orderId, dto.paymentMethod)
  }

  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleStripeWebhook(req.rawBody!, signature)
  }

  @Post('webhooks/mercadopago')
  @ApiOperation({ summary: 'MercadoPago webhook handler' })
  mercadopagoWebhook(@Body() data: any) {
    return this.paymentsService.handleMercadoPagoWebhook(data)
  }
}
