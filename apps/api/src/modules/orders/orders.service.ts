import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from '../../entities/order.entity'
import { OrderItem } from '../../entities/order-item.entity'
import { Product } from '../../entities/product.entity'
import { Table } from '../../entities/table.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { OrderStatus } from '@nodo/types'
import { UserProfileService } from '../recommendations/user-profile.service'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Table) private tableRepo: Repository<Table>,
    private userProfileService: UserProfileService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const table = await this.tableRepo.findOne({
      where: { qrToken: dto.tableToken, isActive: true },
    })
    if (!table) throw new NotFoundException('Table not found')

    // Validate and price items
    const itemData: {
      product: Product
      dto: CreateOrderDto['items'][number]
    }[] = []

    for (const itemDto of dto.items) {
      const product = await this.productRepo.findOne({
        where: { id: itemDto.productId, isAvailable: true },
        relations: ['options', 'options.values'],
      })
      if (!product) throw new BadRequestException(`Product ${itemDto.productId} not found or unavailable`)
      itemData.push({ product, dto: itemDto })
    }

    // Calculate prices
    let subtotal = 0
    const items: Partial<OrderItem>[] = itemData.map(({ product, dto: itemDto }) => {
      let unitPrice = product.price
      const enrichedCustomizations = itemDto.customizations.map((c) => {
        const opt = product.options.find((o) => o.id === c.optionId)
        const val = opt?.values.find((v) => v.id === c.valueId)
        if (!opt || !val) throw new BadRequestException(`Invalid option/value combination`)
        unitPrice += val.priceDelta
        return {
          optionId: c.optionId,
          valueId: c.valueId,
          optionName: opt.nameEs,
          valueName: val.nameEs,
          priceDelta: val.priceDelta,
        }
      })
      subtotal += unitPrice * itemDto.quantity
      return {
        productId: itemDto.productId,
        quantity: itemDto.quantity,
        unitPrice,
        notes: itemDto.notes ?? null,
        customizations: enrichedCustomizations,
      }
    })

    const order = this.orderRepo.create({
      branchId: table.branchId,
      tableId: table.id,
      sessionToken: dto.sessionToken ?? null,
      userId: dto.userId ?? null,
      paymentMethod: dto.paymentMethod,
      subtotal,
      total: subtotal,
      notes: dto.notes ?? null,
      status: OrderStatus.RECEIVED,
    })

    const savedOrder = await this.orderRepo.save(order)

    const savedItems = this.itemRepo.create(
      items.map((item) => ({ ...item, orderId: savedOrder.id }))
    )
    await this.itemRepo.save(savedItems)

    return this.findById(savedOrder.id)
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'table'],
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findById(id)
    order.status = status
    await this.orderRepo.save(order)

    if (status === OrderStatus.DELIVERED && order.userId) {
      this.userProfileService.updateAfterOrder(order.userId, order as any).catch(() => {})
    }

    return order
  }

  async getActiveOrdersByBranch(branchId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: {
        branchId,
        status: OrderStatus.RECEIVED,
      },
      relations: ['items', 'items.product', 'table'],
      order: { createdAt: 'ASC' },
    })
  }
}
