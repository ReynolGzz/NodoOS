import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Tenant } from '../../entities/tenant.entity'
import { Role } from '../../entities/role.entity'
import { Staff } from '../../entities/staff.entity'
import { User } from '../../entities/user.entity'
import { Branch } from '../../entities/branch.entity'
import { Order } from '../../entities/order.entity'
import { TenantsService } from './tenants.service'
import { TenantsController } from './tenants.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Role, Staff, User, Branch, Order])],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
