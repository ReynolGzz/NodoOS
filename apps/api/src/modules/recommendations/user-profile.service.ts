import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserProfile } from '../../entities/user-profile.entity'
import { Order } from '../../entities/order.entity'
import { OrderItem } from '../../entities/order-item.entity'

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
  ) {}

  async getOrCreate(userId: string): Promise<UserProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } })
    if (!profile) {
      profile = this.profileRepo.create({
        userId,
        peakHours: {},
        topCategories: [],
        topProducts: [],
      })
      await this.profileRepo.save(profile)
    }
    return profile
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profileRepo.findOne({ where: { userId } })
  }

  // Called after a completed order (items must be loaded with product relation)
  async updateAfterOrder(userId: string, order: Order & { items: Array<OrderItem & { product?: { categoryId: string } | null }> }) {
    const profile = await this.getOrCreate(userId)

    // Rolling average ticket
    const prev = profile.avgTicket ?? order.total
    profile.avgTicket = (prev + order.total) / 2

    // Peak-hour frequency (normalized)
    const hour = new Date(order.createdAt).getHours()
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    const hours: Record<string, number> = { ...profile.peakHours }
    hours[period] = (hours[period] ?? 0) + 1
    const total = Object.values(hours).reduce((a, b) => a + b, 0)
    for (const k of Object.keys(hours)) hours[k] = hours[k] / total
    profile.peakHours = hours

    // Top categories
    const catMap = new Map<string, number>(
      profile.topCategories.map((c) => [c.categoryId, c.frequency]),
    )
    for (const item of order.items) {
      const catId = item.product?.categoryId
      if (catId) catMap.set(catId, (catMap.get(catId) ?? 0) + item.quantity)
    }
    profile.topCategories = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoryId, frequency]) => ({ categoryId, frequency }))

    // Top products
    const prodMap = new Map<string, number>(
      profile.topProducts.map((p) => [p.productId, p.orderCount]),
    )
    for (const item of order.items) {
      prodMap.set(item.productId, (prodMap.get(item.productId) ?? 0) + item.quantity)
    }
    profile.topProducts = Array.from(prodMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId, orderCount]) => ({ productId, orderCount }))

    await this.profileRepo.save(profile)
  }
}
