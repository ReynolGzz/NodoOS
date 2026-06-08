import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { Order } from '../../entities/order.entity'
import { OrderItem } from '../../entities/order-item.entity'
import { User } from '../../entities/user.entity'
import { OrderStatus } from '../../entities/order.entity'

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getDashboardStats(branchId: string, days = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [todayOrders, periodOrders, activeOrders] = await Promise.all([
      this.orderRepo.find({
        where: {
          branchId,
          status: OrderStatus.DELIVERED,
          createdAt: Between(todayStart, todayEnd),
        },
      }),
      this.orderRepo.find({
        where: {
          branchId,
          status: OrderStatus.DELIVERED,
          createdAt: Between(since, new Date()),
        },
      }),
      this.orderRepo.count({
        where: [
          { branchId, status: OrderStatus.RECEIVED },
          { branchId, status: OrderStatus.PREPARING },
          { branchId, status: OrderStatus.READY },
        ],
      }),
    ])

    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0)
    const periodRevenue = periodOrders.reduce((s, o) => s + o.total, 0)
    const avgOrderValue = periodOrders.length > 0 ? periodRevenue / periodOrders.length : 0

    return {
      totalOrdersToday: todayOrders.length,
      totalRevenueToday: todayRevenue,
      activeOrders,
      avgOrderValue,
      totalOrdersPeriod: periodOrders.length,
      totalRevenuePeriod: periodRevenue,
    }
  }

  async getHourlyRevenue(branchId: string, date?: string) {
    const day = date ? new Date(date) : new Date()
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    const orders = await this.orderRepo.find({
      where: { branchId, status: OrderStatus.DELIVERED, createdAt: Between(start, end) },
    })

    const byHour: Record<number, { orders: number; revenue: number }> = {}
    for (let h = 0; h < 24; h++) byHour[h] = { orders: 0, revenue: 0 }

    for (const order of orders) {
      const h = new Date(order.createdAt).getHours()
      byHour[h].orders++
      byHour[h].revenue += order.total
    }

    return Object.entries(byHour).map(([hour, data]) => ({
      hour: parseInt(hour),
      orders: data.orders,
      revenue: Math.round(data.revenue * 100) / 100,
    }))
  }

  async getTopProducts(branchId: string, limit = 10) {
    const result = await this.itemRepo
      .createQueryBuilder('item')
      .select('item.productId', 'productId')
      .addSelect('p.nameEs', 'nameEs')
      .addSelect('p.nameEn', 'nameEn')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.quantity * item.unitPrice)', 'totalRevenue')
      .innerJoin('item.product', 'p')
      .innerJoin('item.order', 'o')
      .where('o.branchId = :branchId', { branchId })
      .andWhere('o.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy('item.productId')
      .addGroupBy('p.nameEs')
      .addGroupBy('p.nameEn')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit)
      .getRawMany()

    return result.map((r) => ({
      productId: r['item_productId'] ?? r.productId,
      nameEs: r['p_nameEs'] ?? r.nameEs,
      nameEn: r['p_nameEn'] ?? r.nameEn,
      totalQuantity: parseInt(r.totalQuantity),
      totalRevenue: parseFloat(r.totalRevenue),
    }))
  }

  async getCustomerStats(branchId: string, days = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const orders = await this.orderRepo.find({
      where: {
        branchId,
        status: OrderStatus.DELIVERED,
        createdAt: Between(since, new Date()),
      },
      select: ['userId', 'createdAt'],
    })

    const userFirstSeen: Record<string, Date> = {}
    for (const o of orders) {
      if (!o.userId) continue
      if (!userFirstSeen[o.userId] || o.createdAt < userFirstSeen[o.userId]) {
        userFirstSeen[o.userId] = o.createdAt
      }
    }

    const newCutoff = new Date()
    newCutoff.setDate(newCutoff.getDate() - days)
    let newUsers = 0
    let returningUsers = 0
    for (const firstDate of Object.values(userFirstSeen)) {
      if (firstDate >= newCutoff) newUsers++
      else returningUsers++
    }

    const totalUsers = await this.userRepo.count()

    return { newUsers, returningUsers, totalUsers, period: days }
  }

  async getDailyRevenue(branchId: string, days = 14) {
    const result: Array<{ date: string; orders: number; revenue: number }> = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const start = new Date(d)
      start.setHours(0, 0, 0, 0)
      const end = new Date(d)
      end.setHours(23, 59, 59, 999)

      const orders = await this.orderRepo.find({
        where: { branchId, status: OrderStatus.DELIVERED, createdAt: Between(start, end) },
        select: ['total'],
      })

      result.push({
        date: d.toISOString().split('T')[0],
        orders: orders.length,
        revenue: Math.round(orders.reduce((s, o) => s + o.total, 0) * 100) / 100,
      })
    }

    return result
  }
}
