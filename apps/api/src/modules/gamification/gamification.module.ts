import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GamificationController } from './gamification.controller'
import { GamificationService } from './gamification.service'
import { UserGamification } from '../../entities/user-gamification.entity'
import { Badge } from '../../entities/badge.entity'
import { UserBadge } from '../../entities/user-badge.entity'
import { Challenge } from '../../entities/challenge.entity'
import { UserChallenge } from '../../entities/user-challenge.entity'
import { CafeEvent } from '../../entities/event.entity'
import { SecretMenuItem } from '../../entities/secret-menu-item.entity'
import { Order } from '../../entities/order.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserGamification, Badge, UserBadge,
      Challenge, UserChallenge,
      CafeEvent, SecretMenuItem,
      Order,
    ]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
