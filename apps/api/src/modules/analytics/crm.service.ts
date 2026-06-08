import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CrmSegment, SegmentRules } from '../../entities/crm-segment.entity'
import { User } from '../../entities/user.entity'

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(CrmSegment) private segmentRepo: Repository<CrmSegment>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  getSegments(branchId: string) {
    return this.segmentRepo.find({ where: { branchId }, order: { updatedAt: 'DESC' } })
  }

  async createSegment(branchId: string, name: string, description: string, rules: SegmentRules) {
    const segment = this.segmentRepo.create({ branchId, name, description, rules, userCount: 0 })
    const saved = await this.segmentRepo.save(segment)
    await this.refreshSegmentCount(saved.id)
    return this.segmentRepo.findOne({ where: { id: saved.id } })
  }

  async updateSegment(id: string, name: string, description: string, rules: SegmentRules) {
    const segment = await this.segmentRepo.findOne({ where: { id } })
    if (!segment) throw new NotFoundException('Segment not found')
    Object.assign(segment, { name, description, rules })
    await this.segmentRepo.save(segment)
    await this.refreshSegmentCount(id)
    return this.segmentRepo.findOne({ where: { id } })
  }

  async deleteSegment(id: string) {
    await this.segmentRepo.delete(id)
  }

  async getUsersInSegment(segmentId: string): Promise<User[]> {
    const segment = await this.segmentRepo.findOne({ where: { id: segmentId } })
    if (!segment) throw new NotFoundException('Segment not found')
    return this.applyRules(segment.rules)
  }

  async refreshSegmentCount(segmentId: string) {
    const segment = await this.segmentRepo.findOne({ where: { id: segmentId } })
    if (!segment) return
    const users = await this.applyRules(segment.rules)
    await this.segmentRepo.update(segmentId, { userCount: users.length })
  }

  private async applyRules(rules: SegmentRules): Promise<User[]> {
    let qb = this.userRepo.createQueryBuilder('u')

    if (rules.minVisits !== undefined) {
      qb = qb.andWhere('u.totalVisits >= :minVisits', { minVisits: rules.minVisits })
    }
    if (rules.maxVisits !== undefined) {
      qb = qb.andWhere('u.totalVisits <= :maxVisits', { maxVisits: rules.maxVisits })
    }
    if (rules.minSpent !== undefined) {
      qb = qb.andWhere('u.totalSpent >= :minSpent', { minSpent: rules.minSpent })
    }
    if (rules.maxSpent !== undefined) {
      qb = qb.andWhere('u.totalSpent <= :maxSpent', { maxSpent: rules.maxSpent })
    }
    if (rules.minPoints !== undefined) {
      qb = qb.andWhere('u.totalPoints >= :minPoints', { minPoints: rules.minPoints })
    }
    if (rules.level) {
      qb = qb
        .innerJoin('user_gamification', 'ug', 'ug.user_id = u.id')
        .andWhere('ug.level = :level', { level: rules.level })
    }
    if (rules.lastVisitDays !== undefined) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - rules.lastVisitDays)
      qb = qb.andWhere('u.createdAt <= :cutoff', { cutoff })
    }

    return qb.getMany()
  }
}
