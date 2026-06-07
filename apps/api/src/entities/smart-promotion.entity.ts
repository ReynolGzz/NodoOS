import {
  Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm'

@Entity('smart_promotions')
export class SmartPromotion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  // 'inactivity' | 'birthday' | 'weather' | 'time' | 'frequency'
  @Column({ name: 'trigger_type', length: 50 })
  triggerType: string

  @Column({ name: 'trigger_config', type: 'jsonb' })
  triggerConfig: Record<string, unknown>

  // 'discount' | 'free_item' | 'upgrade'
  @Column({ name: 'reward_type', length: 30 })
  rewardType: string

  @Column({ name: 'reward_value', type: 'jsonb' })
  rewardValue: Record<string, unknown>

  @Column({ name: 'message_es', type: 'text', nullable: true })
  messageEs: string | null

  @Column({ name: 'message_en', type: 'text', nullable: true })
  messageEn: string | null

  @Column({ name: 'is_active', default: true })
  isActive: boolean
}
