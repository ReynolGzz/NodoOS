import {
  Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm'

@Entity('events')
export class CafeEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'name_es', length: 200 })
  nameEs: string

  @Column({ name: 'name_en', length: 200 })
  nameEn: string

  @Column({ name: 'description_es', type: 'text', nullable: true })
  descriptionEs: string | null

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string | null

  // 'coffee_night' | 'jazz' | 'coding' | 'tasting' | 'workshop'
  @Column({ name: 'event_type', length: 30 })
  eventType: string

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date

  @Column({ name: 'xp_reward', default: 50 })
  xpReward: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean
}
