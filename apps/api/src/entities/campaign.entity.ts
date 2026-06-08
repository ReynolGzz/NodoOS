import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'segment_id', nullable: true })
  segmentId: string | null

  @Column()
  name: string

  @Column()
  channel: string // push | whatsapp | email

  @Column()
  trigger: string // manual | inactivity | birthday | milestone

  @Column({ name: 'message_template', type: 'jsonb' })
  messageTemplate: { es: string; en: string }

  @Column({ name: 'sent_count', default: 0 })
  sentCount: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @Column({ name: 'last_run_at', nullable: true })
  lastRunAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
