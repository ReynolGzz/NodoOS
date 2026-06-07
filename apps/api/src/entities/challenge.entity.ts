import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany,
} from 'typeorm'
import { UserChallenge } from './user-challenge.entity'

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 80, unique: true })
  slug: string

  @Column({ name: 'name_es', length: 150 })
  nameEs: string

  @Column({ name: 'name_en', length: 150 })
  nameEn: string

  @Column({ name: 'description_es', type: 'text', nullable: true })
  descriptionEs: string | null

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string | null

  // 'order_count' | 'spend_amount' | 'category_count' | 'visit_count'
  @Column({ name: 'challenge_type', length: 30 })
  challengeType: string

  @Column({ name: 'target_value' })
  targetValue: number

  @Column({ name: 'xp_reward' })
  xpReward: number

  @Column({ name: 'badge_id', nullable: true })
  badgeId: string | null

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @OneToMany(() => UserChallenge, (uc) => uc.challenge)
  userChallenges: UserChallenge[]
}
