import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm'
import { Branch } from './branch.entity'

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'name_es', length: 150 })
  nameEs: string

  @Column({ name: 'name_en', length: 150 })
  nameEn: string

  @Column({ name: 'points_cost' })
  pointsCost: number

  @Column({ name: 'reward_type', length: 30 })
  rewardType: 'discount' | 'free_item' | 'upgrade' | 'refill'

  @Column({
    type: 'decimal', precision: 10, scale: 2, nullable: true,
    transformer: { to: (v: number) => v, from: (v: string) => v ? parseFloat(v) : null },
  })
  value: number | null

  @Column({ name: 'product_id', nullable: true })
  productId: string | null

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch
}
