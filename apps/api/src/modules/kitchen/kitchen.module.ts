import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { KitchenController } from './kitchen.controller'
import { Order } from '../../entities/order.entity'
import { OrdersModule } from '../orders/orders.module'

@Module({
  imports: [TypeOrmModule.forFeature([Order]), OrdersModule],
  controllers: [KitchenController],
})
export class KitchenModule {}
