import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm'
import { ProductOption } from './product-option.entity'

@Entity('option_values')
export class OptionValue {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'option_id' })
  optionId: string

  @Column({ name: 'name_es', length: 100 })
  nameEs: string

  @Column({ name: 'name_en', length: 100 })
  nameEn: string

  @Column({
    name: 'price_delta',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  priceDelta: number

  @ManyToOne(() => ProductOption, (o) => o.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'option_id' })
  option: ProductOption
}
