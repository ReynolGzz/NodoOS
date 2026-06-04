import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm'
import { Order } from './order.entity'
import { Product } from './product.entity'

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'order_id' })
  orderId: string

  @Column({ name: 'product_id' })
  productId: string

  @Column()
  quantity: number

  @Column({
    name: 'unit_price',
    type: 'decimal', precision: 10, scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  unitPrice: number

  @Column({ type: 'text', nullable: true })
  notes: string | null

  @Column({ type: 'jsonb', default: '[]' })
  customizations: {
    optionId: string
    valueId: string
    optionName: string
    valueName: string
    priceDelta: number
  }[]

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product
}
