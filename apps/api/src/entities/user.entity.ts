import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany,
} from 'typeorm'
import { AuthProvider as AuthProviderEntity } from './auth-provider.entity'
import { PointsTransaction } from './points-transaction.entity'
import { RewardRedemption } from './reward-redemption.entity'
import { UserFavorite } from './user-favorite.entity'
import { PushSubscription } from './push-subscription.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 255, unique: true, nullable: true })
  email: string | null

  @Column({ length: 150, nullable: true })
  name: string | null

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null

  @Column({ length: 30, nullable: true })
  phone: string | null

  @Column({ type: 'jsonb', default: '{}' })
  preferences: {
    locale?: string
    theme?: string
    preferredMilk?: string
    preferredSugar?: string
  }

  @Column({ name: 'total_points', default: 0 })
  totalPoints: number

  @Column({ name: 'total_visits', default: 0 })
  totalVisits: number

  @Column({
    name: 'total_spent',
    type: 'decimal', precision: 12, scale: 2, default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  totalSpent: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @OneToMany(() => AuthProviderEntity, (a) => a.user, { cascade: true })
  authProviders: AuthProviderEntity[]

  @OneToMany(() => PointsTransaction, (p) => p.user)
  pointsTransactions: PointsTransaction[]

  @OneToMany(() => RewardRedemption, (r) => r.user)
  rewardRedemptions: RewardRedemption[]

  @OneToMany(() => UserFavorite, (f) => f.user)
  favorites: UserFavorite[]

  @OneToMany(() => PushSubscription, (s) => s.user)
  pushSubscriptions: PushSubscription[]
}
