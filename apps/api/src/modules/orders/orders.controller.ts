import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { OrdersGateway } from './orders.gateway'
import { CreateOrderDto } from './dto/create-order.dto'
import { IsEnum } from 'class-validator'
import { OrderStatus } from '@nodo/types'

class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus
}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(dto)
    // Notify kitchen in real-time
    this.ordersGateway.emitNewOrder(order.branchId, order)
    return order
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (kitchen use)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const order = await this.ordersService.updateStatus(id, dto.status)
    // Notify customer in real-time
    this.ordersGateway.emitOrderUpdated(order.id, order.status)
    // Notify kitchen display of status change
    this.ordersGateway.emitOrderStatusChanged(
      order.branchId,
      order.id,
      order.status,
      order.table.number,
    )
    return order
  }
}
