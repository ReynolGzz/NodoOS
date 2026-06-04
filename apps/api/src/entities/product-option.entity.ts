import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm'
import { Product } from './product.entity'
import { OptionValue } from './option-value.entity'

@Entity('product_options')
export class ProductOption {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'product_id' })
  productId: string

  @Column({ name: 'name_es', length: 100 })
  nameEs: string

  @Column({ name: 'name_en', length: 100 })
  nameEn: string

  @Column({ length: 20 })
  type: 'single' | 'multiple'

  @Column({ name: 'is_required', default: false })
  isRequired: boolean

  @ManyToOne(() => Product, (p) => p.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product

  @OneToMany(() => OptionValue, (v) => v.option, { eager: true })
  values: OptionValue[]
}
