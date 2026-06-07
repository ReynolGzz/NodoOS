import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany,
} from 'typeorm'
import { UserBadge } from './user-badge.entity'

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 80, unique: true })
  slug: string

  @Column({ name: 'name_es', length: 100 })
  nameEs: string

  @Column({ name: 'name_en', length: 100 })
  nameEn: string

  @Column({ name: 'description_es', type: 'text', nullable: true })
  descriptionEs: string | null

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string | null

  @Column({ length: 10 })
  icon: string

  @Column({ name: 'xp_reward', default: 0 })
  xpReward: number

  // 'order_count' | 'visit_count' | 'spend_total' | 'category_count' | 'level_up'
  @Column({ name: 'trigger_type', length: 30 })
  triggerType: string

  @Column({ name: 'trigger_value', default: 1 })
  triggerValue: number

  @OneToMany(() => UserBadge, (ub) => ub.badge)
  userBadges: UserBadge[]
}
