import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany,
} from 'typeorm'
import { Table } from './table.entity'
import { Zone } from './zone.entity'
import { Category } from './category.entity'
import { Order } from './order.entity'

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ unique: true, length: 50 })
  slug: string

  @Column({ type: 'text', nullable: true })
  address: string | null

  @Column({ default: 'America/Mexico_City' })
  timezone: string

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string | null

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @OneToMany(() => Table, (t) => t.branch)
  tables: Table[]

  @OneToMany(() => Zone, (z) => z.branch)
  zones: Zone[]

  @OneToMany(() => Category, (c) => c.branch)
  categories: Category[]

  @OneToMany(() => Order, (o) => o.branch)
  orders: Order[]
}
