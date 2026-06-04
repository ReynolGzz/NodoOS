import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm'
import { Branch } from './branch.entity'
import { Table } from './table.entity'
import { OrderItem } from './order-item.entity'
import { OrderStatus, PaymentMethod, PaymentStatus } from '@nodo/types'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'table_id' })
  tableId: string

  @Column({ name: 'session_token', nullable: true })
  sessionToken: string | null

  @Column({ name: 'user_id', nullable: true })
  userId: string | null

  @Column({ default: OrderStatus.RECEIVED, length: 30 })
  status: OrderStatus

  @Column({ name: 'payment_status', default: PaymentStatus.PENDING, length: 20 })
  paymentStatus: PaymentStatus

  @Column({ name: 'payment_method', length: 30, nullable: true })
  paymentMethod: PaymentMethod | null

  @Column({ name: 'payment_intent_id', length: 200, nullable: true })
  paymentIntentId: string | null

  @Column({
    type: 'decimal', precision: 10, scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  subtotal: number

  @Column({
    type: 'decimal', precision: 10, scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  total: number

  @Column({ type: 'text', nullable: true })
  notes: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Branch, (b) => b.orders)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch

  @ManyToOne(() => Table, (t) => t.orders)
  @JoinColumn({ name: 'table_id' })
  table: Table

  @OneToMany(() => OrderItem, (i) => i.order, { eager: true, cascade: true })
  items: OrderItem[]
}
