import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm'
import { Table } from './table.entity'
import { TableMode } from '@nodo/types'

@Entity('table_sessions')
export class TableSession {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'table_id' })
  tableId: string

  @ManyToOne(() => Table)
  @JoinColumn({ name: 'table_id' })
  table: Table

  @Column({ name: 'user_id', nullable: true })
  userId: string | null

  @Column({ default: TableMode.CASUAL, length: 20 })
  mode: TableMode

  @Column({ type: 'jsonb', default: '[]' })
  participants: string[]

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null
}
