import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'
import { PointsTransaction } from '../../entities/points-transaction.entity'
import { Reward } from '../../entities/reward.entity'
import { RewardRedemption } from '../../entities/reward-redemption.entity'

// 1 point per $10 MXN spent + 5 points per visit
const POINTS_PER_PESO = 0.1
const POINTS_PER_VISIT = 5

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(PointsTransaction) private txRepo: Repository<PointsTransaction>,
    @InjectRepository(Reward) private rewardRepo: Repository<Reward>,
    @InjectRepository(RewardRedemption) private redemptionRepo: Repository<RewardRedemption>,
  ) {}

  async earnFromPurchase(userId: string, orderId: string, total: number) {
    const points = Math.floor(total * POINTS_PER_PESO)
    if (points <= 0) return
    await this.txRepo.save(this.txRepo.create({ userId, orderId, points, reason: 'purchase' }))
    await this.userRepo.increment({ id: userId }, 'totalPoints', points)
    return points
  }

  async earnFromVisit(userId: string) {
    await this.txRepo.save(this.txRepo.create({ userId, points: POINTS_PER_VISIT, reason: 'visit' }))
    await this.userRepo.increment({ id: userId }, 'totalPoints', POINTS_PER_VISIT)
  }

  async getBalance(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')
    return { balance: user.totalPoints }
  }

  async getHistory(userId: string) {
    return this.txRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    })
  }

  async getRewards(branchId: string) {
    return this.rewardRepo.find({ where: { branchId, isActive: true } })
  }

  async redeem(userId: string, rewardId: string, orderId?: string) {
    const [user, reward] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.rewardRepo.findOne({ where: { id: rewardId, isActive: true } }),
    ])

    if (!user) throw new NotFoundException('User not found')
    if (!reward) throw new NotFoundException('Reward not found')
    if (user.totalPoints < reward.pointsCost) {
      throw new BadRequestException('Insufficient points')
    }

    await this.txRepo.save(this.txRepo.create({
      userId,
      orderId: orderId ?? null,
      points: -reward.pointsCost,
      reason: 'reward_redemption',
    }))
    await this.userRepo.decrement({ id: userId }, 'totalPoints', reward.pointsCost)
    const redemption = await this.redemptionRepo.save(
      this.redemptionRepo.create({ userId, rewardId, orderId: orderId ?? null })
    )
    return { redemption, reward, remainingPoints: user.totalPoints - reward.pointsCost }
  }
}
