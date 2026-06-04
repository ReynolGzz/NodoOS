import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Branch } from './branch.entity'
import { Table } from './table.entity'

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ length: 50 })
  name: string

  @ManyToOne(() => Branch, (b) => b.zones)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch

  @OneToMany(() => Table, (t) => t.zone)
  tables: Table[]
}
