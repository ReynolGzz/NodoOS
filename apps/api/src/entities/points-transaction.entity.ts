import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity('points_transactions')
export class PointsTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'order_id', nullable: true })
  orderId: string | null

  @Column()
  points: number

  @Column({ length: 50 })
  reason: 'purchase' | 'visit' | 'reward_redemption' | 'referral' | 'event'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => User, (u) => u.pointsTransactions)
  @JoinColumn({ name: 'user_id' })
  user: User
}
