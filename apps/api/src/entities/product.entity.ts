import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm'
import { Category } from './category.entity'
import { ProductOption } from './product-option.entity'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'category_id' })
  categoryId: string

  @Column({ name: 'name_es', length: 150 })
  nameEs: string

  @Column({ name: 'name_en', length: 150 })
  nameEn: string

  @Column({ name: 'description_es', type: 'text', nullable: true })
  descriptionEs: string | null

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string | null

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  price: number

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number

  @ManyToOne(() => Category, (c) => c.products)
  @JoinColumn({ name: 'category_id' })
  category: Category

  @OneToMany(() => ProductOption, (o) => o.product, { eager: true })
  options: ProductOption[]
}
