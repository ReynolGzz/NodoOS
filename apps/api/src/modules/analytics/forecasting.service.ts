import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { Order, OrderStatus } from '../../entities/order.entity'
import { DemandForecast } from '../../entities/demand-forecast.entity'

const FORECASTING_URL = process.env.FORECASTING_URL ?? ''

@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name)

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(DemandForecast) private forecastRepo: Repository<DemandForecast>,
  ) {}

  async generateForecast(branchId: string, targetDate?: string): Promise<DemandForecast[]> {
    const date = targetDate ?? this.nextDay()

    const historical = await this.getHistoricalHourly(branchId)

    let predictions: Array<{ hour: number; orders: number; revenue: number; confidence: number }>

    if (FORECASTING_URL) {
      predictions = await this.callPythonForecast(branchId, historical, date)
    } else {
      predictions = this.simpleMovingAverage(historical, date)
    }

    await this.forecastRepo.delete({ branchId, forecastDate: date })

    const forecasts = predictions.map((p) =>
      this.forecastRepo.create({
        branchId,
        forecastDate: date,
        hourOfDay: p.hour,
        predictedOrders: p.orders,
        predictedRevenue: p.revenue,
        confidenceScore: p.confidence,
      }),
    )

    return this.forecastRepo.save(forecasts)
  }

  async getForecast(branchId: string, date?: string): Promise<DemandForecast[]> {
    const targetDate = date ?? this.nextDay()
    const existing = await this.forecastRepo.find({
      where: { branchId, forecastDate: targetDate },
      order: { hourOfDay: 'ASC' },
    })
    if (existing.length > 0) return existing
    return this.generateForecast(branchId, targetDate)
  }

  private async getHistoricalHourly(branchId: string) {
    const since = new Date()
    since.setDate(since.getDate() - 90)

    const orders = await this.orderRepo.find({
      where: {
        branchId,
        status: OrderStatus.DELIVERED,
        createdAt: Between(since, new Date()),
      },
      select: ['total', 'createdAt'],
    })

    const buckets: Record<string, { orders: number; revenue: number; count: number }> = {}
    for (const o of orders) {
      const d = new Date(o.createdAt)
      const key = `${d.getDay()}_${d.getHours()}`
      if (!buckets[key]) buckets[key] = { orders: 0, revenue: 0, count: 0 }
      buckets[key].orders++
      buckets[key].revenue += o.total
      buckets[key].count++
    }

    return buckets
  }

  private simpleMovingAverage(
    historical: Record<string, { orders: number; revenue: number; count: number }>,
    date: string,
  ) {
    const dow = new Date(date).getDay()
    const predictions = []

    for (let h = 0; h < 24; h++) {
      const exact = historical[`${dow}_${h}`]
      const weekCount = Object.keys(historical).filter((k) => k.endsWith(`_${h}`)).length
      const totalOrders = Object.entries(historical)
        .filter(([k]) => k.endsWith(`_${h}`))
        .reduce((s, [, v]) => s + v.orders, 0)
      const totalRevenue = Object.entries(historical)
        .filter(([k]) => k.endsWith(`_${h}`))
        .reduce((s, [, v]) => s + v.revenue, 0)

      const avgOrders = weekCount > 0 ? totalOrders / weekCount : 0
      const avgRevenue = weekCount > 0 ? totalRevenue / weekCount : 0

      const confidence = exact ? Math.min(0.85, 0.4 + exact.count * 0.05) : 0.3

      predictions.push({
        hour: h,
        orders: Math.round(exact ? exact.orders * 0.7 + avgOrders * 0.3 : avgOrders),
        revenue: Math.round((exact ? exact.revenue * 0.7 + avgRevenue * 0.3 : avgRevenue) * 100) / 100,
        confidence,
      })
    }

    return predictions
  }

  private async callPythonForecast(
    branchId: string,
    historical: Record<string, unknown>,
    date: string,
  ) {
    try {
      const res = await fetch(`${FORECASTING_URL}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, historical, targetDate: date }),
      })
      const data = await res.json()
      return data.predictions
    } catch (err) {
      this.logger.warn('Python forecasting service unavailable, using built-in model')
      return this.simpleMovingAverage(historical, date)
    }
  }

  private nextDay() {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }
}
