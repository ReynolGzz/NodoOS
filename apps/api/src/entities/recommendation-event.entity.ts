import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm'

@Entity('recommendation_events')
export class RecommendationEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', nullable: true })
  userId: string | null

  @Column({ name: 'product_id' })
  productId: string

  @Column({ name: 'recommendation_context', type: 'jsonb' })
  recommendationContext: {
    weather?: number
    temperature?: number
    hour: number
    day: number
    month: number
  }

  @Column({ name: 'was_clicked', default: false })
  wasClicked: boolean

  @Column({ name: 'was_ordered', default: false })
  wasOrdered: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
