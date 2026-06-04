import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThanOrEqual } from 'typeorm'
import { Order } from '../../entities/order.entity'
import { Product } from '../../entities/product.entity'
import { Category } from '../../entities/category.entity'
import { Table } from '../../entities/table.entity'
import { Branch } from '../../entities/branch.entity'
import { OrderStatus, PaymentStatus } from '@nodo/types'
import { nanoid } from 'nanoid'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Table) private tableRepo: Repository<Table>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
  ) {}

  async getDashboardStats(branchId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayOrders, activeOrders] = await Promise.all([
      this.orderRepo.find({
        where: {
          branchId,
          paymentStatus: PaymentStatus.PAID,
          createdAt: MoreThanOrEqual(today),
        },
      }),
      this.orderRepo.count({
        where: {
          branchId,
          status: OrderStatus.RECEIVED,
        },
      }),
    ])

    const totalRevenueToday = todayOrders.reduce((s, o) => s + o.total, 0)
    const avgOrderValue = todayOrders.length > 0 ? totalRevenueToday / todayOrders.length : 0

    return {
      totalOrdersToday: todayOrders.length,
      totalRevenueToday,
      activeOrders,
      avgOrderValue,
    }
  }

  async getProducts(branchId: string) {
    return this.productRepo.find({
      where: { branchId },
      relations: ['category', 'options', 'options.values'],
      order: { categoryId: 'ASC', sortOrder: 'ASC' },
    })
  }

  async createProduct(branchId: string, dto: Partial<Product>) {
    const product = this.productRepo.create({ ...dto, branchId })
    return this.productRepo.save(product)
  }

  async updateProduct(id: string, dto: Partial<Product>) {
    await this.productRepo.update(id, dto)
    return this.productRepo.findOne({ where: { id }, relations: ['options', 'options.values'] })
  }

  async deleteProduct(id: string) {
    await this.productRepo.delete(id)
  }

  async getTables(branchId: string) {
    return this.tableRepo.find({ where: { branchId }, relations: ['zone'] })
  }

  async createTable(branchId: string, number: number, zoneId?: string) {
    const qrToken = nanoid(12)
    const table = this.tableRepo.create({ branchId, number, zoneId: zoneId ?? null, qrToken })
    return this.tableRepo.save(table)
  }

  async getCategories(branchId: string) {
    return this.categoryRepo.find({
      where: { branchId, isActive: true },
      order: { sortOrder: 'ASC' },
    })
  }

  async getRecentOrders(branchId: string, limit = 50) {
    return this.orderRepo.find({
      where: { branchId },
      relations: ['items', 'table'],
      order: { createdAt: 'DESC' },
      take: limit,
    })
  }
}
