import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm'

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'table_id', nullable: true })
  tableId: string | null

  @Column({ name: 'reserved_at', type: 'timestamptz' })
  reservedAt: Date

  @Column({ name: 'duration_minutes', default: 120 })
  durationMinutes: number

  @Column({ name: 'party_size', default: 1 })
  partySize: number

  @Column({ length: 20, nullable: true })
  mode: string | null

  @Column({ default: 'confirmed', length: 20 })
  status: string

  @Column({ type: 'text', nullable: true })
  notes: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
