import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from '../../entities/order.entity'
import { OrderItem } from '../../entities/order-item.entity'
import { User } from '../../entities/user.entity'
import { DemandForecast } from '../../entities/demand-forecast.entity'
import { CrmSegment } from '../../entities/crm-segment.entity'
import { Campaign } from '../../entities/campaign.entity'
import { AnalyticsService } from './analytics.service'
import { ForecastingService } from './forecasting.service'
import { CrmService } from './crm.service'
import { CampaignsService } from './campaigns.service'
import { AnalyticsController } from './analytics.controller'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, DemandForecast, CrmSegment, Campaign]),
    UsersModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ForecastingService, CrmService, CampaignsService],
  exports: [AnalyticsService, ForecastingService],
})
export class AnalyticsModule {}
