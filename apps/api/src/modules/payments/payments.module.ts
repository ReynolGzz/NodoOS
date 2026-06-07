import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { StripeService } from './stripe.service'
import { MercadoPagoService } from './mercadopago.service'
import { Order } from '../../entities/order.entity'
import { OrdersModule } from '../orders/orders.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Order]), OrdersModule, UsersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, MercadoPagoService],
})
export class PaymentsModule {}
