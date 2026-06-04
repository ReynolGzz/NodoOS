import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm'
import { Branch } from './branch.entity'
import { Zone } from './zone.entity'
import { Order } from './order.entity'

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'zone_id', nullable: true })
  zoneId: string | null

  @Column()
  number: number

  @Column({ name: 'qr_token', unique: true, length: 100 })
  qrToken: string

  @Column({ default: 4 })
  capacity: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @ManyToOne(() => Branch, (b) => b.tables)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch

  @ManyToOne(() => Zone, (z) => z.tables, { nullable: true })
  @JoinColumn({ name: 'zone_id' })
  zone: Zone | null

  @OneToMany(() => Order, (o) => o.table)
  orders: Order[]
}
