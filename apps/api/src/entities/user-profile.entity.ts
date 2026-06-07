import {
  Entity, PrimaryColumn, Column, UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn({ name: 'user_id' })
  userId: string

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'preferred_milk', length: 50, nullable: true })
  preferredMilk: string | null

  @Column({ name: 'preferred_sugar', length: 20, nullable: true })
  preferredSugar: string | null

  @Column({
    name: 'avg_ticket',
    type: 'decimal', precision: 10, scale: 2, nullable: true,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  avgTicket: number | null

  // { morning: 0.7, afternoon: 0.2, evening: 0.1 }
  @Column({ name: 'peak_hours', type: 'jsonb', default: '{}' })
  peakHours: Record<string, number>

  // [{ categoryId, frequency }] sorted descending
  @Column({ name: 'top_categories', type: 'jsonb', default: '[]' })
  topCategories: Array<{ categoryId: string; frequency: number }>

  // [{ productId, orderCount }] sorted descending
  @Column({ name: 'top_products', type: 'jsonb', default: '[]' })
  topProducts: Array<{ productId: string; orderCount: number }>

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date
}
