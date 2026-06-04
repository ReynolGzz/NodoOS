import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm'
import { Branch } from './branch.entity'
import { Product } from './product.entity'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'name_es', length: 100 })
  nameEs: string

  @Column({ name: 'name_en', length: 100 })
  nameEn: string

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @ManyToOne(() => Branch, (b) => b.categories)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch

  @OneToMany(() => Product, (p) => p.category)
  products: Product[]
}
