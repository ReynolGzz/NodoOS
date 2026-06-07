import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserGamification } from '../../entities/user-gamification.entity'
import { Badge } from '../../entities/badge.entity'
import { UserBadge } from '../../entities/user-badge.entity'
import { Challenge } from '../../entities/challenge.entity'
import { UserChallenge } from '../../entities/user-challenge.entity'
import { CafeEvent } from '../../entities/event.entity'
import { SecretMenuItem } from '../../entities/secret-menu-item.entity'
import { Order } from '../../entities/order.entity'
import { UserLevel } from '@nodo/types'

// XP thresholds per level
const XP_THRESHOLDS: Record<UserLevel, number> = {
  [UserLevel.BRONZE]: 0,
  [UserLevel.SILVER]: 500,
  [UserLevel.GOLD]: 2000,
  [UserLevel.BLACK]: 10000,
}

const NEXT_LEVEL: Partial<Record<UserLevel, UserLevel>> = {
  [UserLevel.BRONZE]: UserLevel.SILVER,
  [UserLevel.SILVER]: UserLevel.GOLD,
  [UserLevel.GOLD]: UserLevel.BLACK,
}

export function computeLevel(xp: number): UserLevel {
  if (xp >= 10000) return UserLevel.BLACK
  if (xp >= 2000) return UserLevel.GOLD
  if (xp >= 500) return UserLevel.SILVER
  return UserLevel.BRONZE
}

export function levelProgress(xp: number) {
  const current = computeLevel(xp)
  const next = NEXT_LEVEL[current]
  if (!next) return { current, next: null, xpToNext: 0, progress: 100 }
  const from = XP_THRESHOLDS[current]
  const to = XP_THRESHOLDS[next]
  const progress = Math.min(100, Math.round(((xp - from) / (to - from)) * 100))
  return { current, next, xpToNext: to - xp, progress }
}

export interface EarnXpResult {
  xp: number
  level: UserLevel
  leveledUp: boolean
  newBadges: Badge[]
}

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(UserGamification) private userGamRepo: Repository<UserGamification>,
    @InjectRepository(Badge) private badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge) private userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(Challenge) private challengeRepo: Repository<Challenge>,
    @InjectRepository(UserChallenge) private userChallengeRepo: Repository<UserChallenge>,
    @InjectRepository(CafeEvent) private eventRepo: Repository<CafeEvent>,
    @InjectRepository(SecretMenuItem) private secretRepo: Repository<SecretMenuItem>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  // ─── XP ───────────────────────────────────────────────────────────────────────

  async earnXp(userId: string, amount: number): Promise<EarnXpResult> {
    let gam = await this.userGamRepo.findOne({ where: { userId } })
    if (!gam) {
      gam = this.userGamRepo.create({ userId, xp: 0, level: UserLevel.BRONZE })
    }

    const prevLevel = gam.level
    gam.xp += amount
    gam.level = computeLevel(gam.xp)
    await this.userGamRepo.save(gam)

    const leveledUp = prevLevel !== gam.level
    const newBadges: Badge[] = []

    if (leveledUp) {
      const levelBadge = await this.awardBadgeBySlug(userId, `level-${gam.level}`)
      if (levelBadge) newBadges.push(levelBadge)
    }

    return { xp: gam.xp, level: gam.level, leveledUp, newBadges }
  }

  async getGamificationProfile(userId: string) {
    let gam = await this.userGamRepo.findOne({ where: { userId } })
    if (!gam) gam = { userId, xp: 0, level: UserLevel.BRONZE, createdAt: new Date() } as UserGamification

    const userBadges = await this.userBadgeRepo.find({ where: { userId }, order: { earnedAt: 'DESC' } })
    const allBadges = await this.badgeRepo.find()
    const earnedIds = new Set(userBadges.map((ub) => ub.badgeId))

    const challenges = await this.getUserChallenges(userId)

    return {
      xp: gam.xp,
      level: gam.level,
      ...levelProgress(gam.xp),
      badges: allBadges.map((b) => ({
        ...b,
        earned: earnedIds.has(b.id),
        earnedAt: userBadges.find((ub) => ub.badgeId === b.id)?.earnedAt ?? null,
      })),
      challenges,
    }
  }

  // ─── Badges ───────────────────────────────────────────────────────────────────

  private async awardBadgeBySlug(userId: string, slug: string): Promise<Badge | null> {
    const badge = await this.badgeRepo.findOne({ where: { slug } })
    if (!badge) return null
    const exists = await this.userBadgeRepo.findOne({ where: { userId, badgeId: badge.id } })
    if (exists) return null
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId, badgeId: badge.id }))
    return badge
  }

  async checkOrderBadges(userId: string): Promise<Badge[]> {
    const orderCount = await this.orderRepo.count({ where: { userId } })
    return this.checkThresholdBadges(userId, 'order_count', orderCount)
  }

  async checkVisitBadges(userId: string, totalVisits: number): Promise<Badge[]> {
    return this.checkThresholdBadges(userId, 'visit_count', totalVisits)
  }

  async checkSpendBadges(userId: string, totalSpent: number): Promise<Badge[]> {
    return this.checkThresholdBadges(userId, 'spend_total', Math.floor(totalSpent))
  }

  async checkCategoryBadges(userId: string): Promise<Badge[]> {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.items', 'i')
      .innerJoin('i.product', 'p')
      .select('COUNT(DISTINCT p.category_id)', 'count')
      .where('o.userId = :userId', { userId })
      .getRawOne<{ count: string }>()
    const count = parseInt(result?.count ?? '0', 10)
    return this.checkThresholdBadges(userId, 'category_count', count)
  }

  private async checkThresholdBadges(userId: string, triggerType: string, value: number): Promise<Badge[]> {
    const candidates = await this.badgeRepo.find({ where: { triggerType } })
    const earned = await this.userBadgeRepo.find({ where: { userId } })
    const earnedIds = new Set(earned.map((ub) => ub.badgeId))

    const newBadges: Badge[] = []
    for (const badge of candidates) {
      if (!earnedIds.has(badge.id) && badge.triggerValue <= value) {
        await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId, badgeId: badge.id }))
        newBadges.push(badge)
      }
    }
    return newBadges
  }

  // ─── Challenges ───────────────────────────────────────────────────────────────

  async getUserChallenges(userId: string) {
    const active = await this.challengeRepo.find({ where: { isActive: true } })
    const now = new Date()

    const result = []
    for (const challenge of active) {
      if (challenge.expiresAt && challenge.expiresAt < now) continue
      const uc = await this.userChallengeRepo.findOne({
        where: { userId, challengeId: challenge.id },
      })
      result.push({
        ...challenge,
        progress: uc?.progress ?? 0,
        completedAt: uc?.completedAt ?? null,
      })
    }
    return result
  }

  async incrementChallengeProgress(userId: string, challengeType: string, amount = 1): Promise<void> {
    const active = await this.challengeRepo.find({ where: { challengeType: challengeType as any, isActive: true } })
    const now = new Date()

    for (const challenge of active) {
      if (challenge.expiresAt && challenge.expiresAt < now) continue

      let uc = await this.userChallengeRepo.findOne({ where: { userId, challengeId: challenge.id } })
      if (uc?.completedAt) continue

      if (!uc) {
        uc = this.userChallengeRepo.create({ userId, challengeId: challenge.id, progress: 0 })
      }

      uc.progress = Math.min(challenge.targetValue, uc.progress + amount)

      if (uc.progress >= challenge.targetValue && !uc.completedAt) {
        uc.completedAt = new Date()
        this.earnXp(userId, challenge.xpReward).catch(() => {})
      }

      await this.userChallengeRepo.save(uc)
    }
  }

  // ─── Events ───────────────────────────────────────────────────────────────────

  async getUpcomingEvents(branchId: string) {
    const now = new Date()
    return this.eventRepo.find({
      where: { branchId, isActive: true },
      order: { startsAt: 'ASC' },
    })
  }

  async attendEvent(userId: string, eventId: string): Promise<EarnXpResult> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } })
    if (!event) throw new Error('Event not found')
    return this.earnXp(userId, event.xpReward)
  }

  // ─── Secret Menu ──────────────────────────────────────────────────────────────

  async getUnlockedSecretItems(userId: string, userLevel: UserLevel): Promise<SecretMenuItem[]> {
    const items = await this.secretRepo.find({
      where: { isActive: true },
      relations: ['product', 'product.options', 'product.options.values'],
    })

    const now = new Date()
    const hour = now.getHours()

    const levelOrder: Record<UserLevel, number> = {
      [UserLevel.BRONZE]: 0,
      [UserLevel.SILVER]: 1,
      [UserLevel.GOLD]: 2,
      [UserLevel.BLACK]: 3,
    }

    return items.filter((item) => {
      if (item.unlockCondition === 'level') {
        const required = (item.unlockConfig as { requiredLevel?: UserLevel }).requiredLevel
        if (!required) return false
        return levelOrder[userLevel] >= levelOrder[required]
      }
      if (item.unlockCondition === 'time') {
        const hours = (item.unlockConfig as { hours?: number[] }).hours ?? []
        return hours.includes(hour)
      }
      return false
    })
  }
}
