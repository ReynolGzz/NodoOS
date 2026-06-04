import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MenuController } from './menu.controller'
import { MenuService } from './menu.service'
import { Branch } from '../../entities/branch.entity'
import { Table } from '../../entities/table.entity'
import { Zone } from '../../entities/zone.entity'
import { Category } from '../../entities/category.entity'
import { Product } from '../../entities/product.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Table, Zone, Category, Product])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
