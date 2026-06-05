import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'
import { AuthProvider } from '../../entities/auth-provider.entity'
import { UserFavorite } from '../../entities/user-favorite.entity'
import { Order } from '../../entities/order.entity'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { OrderStatus } from '@nodo/types'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(AuthProvider) private authProviderRepo: Repository<AuthProvider>,
    @InjectRepository(UserFavorite) private favoriteRepo: Repository<UserFavorite>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async findOrCreateByEmail(email: string): Promise<User> {
    let user = await this.userRepo.findOne({ where: { email } })
    if (!user) {
      user = await this.userRepo.save(this.userRepo.create({ email }))
    }
    return user
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id)
    if (dto.name !== undefined) user.name = dto.name
    if (dto.phone !== undefined) user.phone = dto.phone
    if (dto.preferences) {
      user.preferences = { ...user.preferences, ...dto.preferences }
    }
    return this.userRepo.save(user)
  }

  async getOrderHistory(userId: string) {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.product', 'table'],
      order: { createdAt: 'DESC' },
      take: 50,
    })
  }

  async getFavorites(userId: string) {
    return this.favoriteRepo.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    })
  }

  async addFavorite(userId: string, productId: string) {
    const exists = await this.favoriteRepo.findOne({ where: { userId, productId } })
    if (exists) return exists
    return this.favoriteRepo.save(this.favoriteRepo.create({ userId, productId }))
  }

  async removeFavorite(userId: string, productId: string) {
    await this.favoriteRepo.delete({ userId, productId })
  }

  async getLastOrder(userId: string, branchId: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { userId, branchId, status: OrderStatus.DELIVERED },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    })
  }

  async incrementVisit(userId: string) {
    await this.userRepo.increment({ id: userId }, 'totalVisits', 1)
  }

  async addSpent(userId: string, amount: number) {
    await this.userRepo.increment({ id: userId }, 'totalSpent', amount)
  }
}
