import {
  Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Badge } from './badge.entity'

@Entity('user_badges')
export class UserBadge {
  @PrimaryColumn({ name: 'user_id' })
  userId: string

  @PrimaryColumn({ name: 'badge_id' })
  badgeId: string

  @CreateDateColumn({ name: 'earned_at' })
  earnedAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Badge, (b) => b.userBadges, { eager: true })
  @JoinColumn({ name: 'badge_id' })
  badge: Badge
}
