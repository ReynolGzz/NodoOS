import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Challenge } from './challenge.entity'

@Entity('user_challenges')
export class UserChallenge {
  @PrimaryColumn({ name: 'user_id' })
  userId: string

  @PrimaryColumn({ name: 'challenge_id' })
  challengeId: string

  @Column({ default: 0 })
  progress: number

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Challenge, (c) => c.userChallenges, { eager: true })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge
}
