import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

const decimalTransformer = { to: (v: number) => v, from: (v: string) => parseFloat(v) }

@Entity('demand_forecasts')
export class DemandForecast {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'forecast_date', type: 'date' })
  forecastDate: string

  @Column({ name: 'hour_of_day' })
  hourOfDay: number

  @Column({ name: 'predicted_orders', default: 0 })
  predictedOrders: number

  @Column({ name: 'predicted_revenue', type: 'decimal', precision: 10, scale: 2, default: 0, transformer: decimalTransformer })
  predictedRevenue: number

  @Column({ name: 'confidence_score', type: 'decimal', precision: 3, scale: 2, default: 0.5, transformer: decimalTransformer })
  confidenceScore: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
