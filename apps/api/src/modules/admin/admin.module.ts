import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { Order } from '../../entities/order.entity'
import { Product } from '../../entities/product.entity'
import { Category } from '../../entities/category.entity'
import { Table } from '../../entities/table.entity'
import { Branch } from '../../entities/branch.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Category, Table, Branch])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
