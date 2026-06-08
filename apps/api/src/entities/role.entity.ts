import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface RolePermissions {
  orders?: ('read' | 'write' | 'delete')[]
  products?: ('read' | 'write' | 'delete')[]
  tables?: ('read' | 'write')[]
  reports?: ('read')[]
  staff?: ('read' | 'write' | 'delete')[]
  billing?: ('read' | 'write')[]
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'tenant_id' })
  tenantId: string

  @Column({ length: 30 })
  name: string // admin | manager | barista | waiter

  @Column({ type: 'jsonb' })
  permissions: RolePermissions
}
