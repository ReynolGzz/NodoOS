import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { OrdersGateway } from './orders.gateway'
import { Order } from '../../entities/order.entity'
import { OrderItem } from '../../entities/order-item.entity'
import { Product } from '../../entities/product.entity'
import { Table } from '../../entities/table.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, Table])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
