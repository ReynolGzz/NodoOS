import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RecommendationsController } from './recommendations.controller'
import { RecommendationsService } from './recommendations.service'
import { WeatherService } from './weather.service'
import { UserProfileService } from './user-profile.service'
import { Product } from '../../entities/product.entity'
import { UserProfile } from '../../entities/user-profile.entity'
import { RecommendationEvent } from '../../entities/recommendation-event.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Product, UserProfile, RecommendationEvent])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, WeatherService, UserProfileService],
  exports: [RecommendationsService, UserProfileService],
})
export class RecommendationsModule {}
