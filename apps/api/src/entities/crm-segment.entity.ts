import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm'

export interface SegmentRules {
  minVisits?: number
  maxVisits?: number
  minSpent?: number
  maxSpent?: number
  minPoints?: number
  lastVisitDays?: number
  level?: string
}

@Entity('crm_segments')
export class CrmSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ type: 'jsonb' })
  rules: SegmentRules

  @Column({ name: 'user_count', default: 0 })
  userCount: number

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
