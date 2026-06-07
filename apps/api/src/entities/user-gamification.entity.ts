import {
  Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn,
} from 'typeorm'
import { User } from './user.entity'
import { UserLevel } from '@nodo/types'

@Entity('user_gamification')
export class UserGamification {
  @PrimaryColumn({ name: 'user_id' })
  userId: string

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ default: 0 })
  xp: number

  @Column({ default: UserLevel.BRONZE, length: 20 })
  level: UserLevel

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
