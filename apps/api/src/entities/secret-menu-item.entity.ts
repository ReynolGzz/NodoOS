import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm'
import { Product } from './product.entity'

@Entity('secret_menu_items')
export class SecretMenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'product_id' })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product

  // 'level' | 'time' | 'challenge'
  @Column({ name: 'unlock_condition', length: 20 })
  unlockCondition: string

  // { requiredLevel?: string; hours?: number[]; challengeId?: string }
  @Column({ name: 'unlock_config', type: 'jsonb' })
  unlockConfig: Record<string, unknown>

  @Column({ name: 'is_active', default: true })
  isActive: boolean
}
