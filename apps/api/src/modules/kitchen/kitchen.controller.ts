import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { OrdersService } from '../orders/orders.service'

@ApiTags('Kitchen')
@Controller('kitchen')
export class KitchenController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Get all active orders for a branch (Kitchen Display)' })
  getActiveOrders(@Query('branchId') branchId: string) {
    return this.ordersService.getActiveOrdersByBranch(branchId)
  }
}
