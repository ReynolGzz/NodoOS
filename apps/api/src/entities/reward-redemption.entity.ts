import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Reward } from './reward.entity'

@Entity('reward_redemptions')
export class RewardRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'reward_id' })
  rewardId: string

  @Column({ name: 'order_id', nullable: true })
  orderId: string | null

  @CreateDateColumn({ name: 'redeemed_at' })
  redeemedAt: Date

  @ManyToOne(() => User, (u) => u.rewardRedemptions)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Reward)
  @JoinColumn({ name: 'reward_id' })
  reward: Reward
}
