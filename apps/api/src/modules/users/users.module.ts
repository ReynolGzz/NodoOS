import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { LoyaltyService } from './loyalty.service'
import { PushService } from './push.service'
import { User } from '../../entities/user.entity'
import { AuthProvider } from '../../entities/auth-provider.entity'
import { PointsTransaction } from '../../entities/points-transaction.entity'
import { Reward } from '../../entities/reward.entity'
import { RewardRedemption } from '../../entities/reward-redemption.entity'
import { UserFavorite } from '../../entities/user-favorite.entity'
import { PushSubscription } from '../../entities/push-subscription.entity'
import { Order } from '../../entities/order.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, AuthProvider, PointsTransaction, Reward,
      RewardRedemption, UserFavorite, PushSubscription, Order,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, LoyaltyService, PushService],
  exports: [UsersService, LoyaltyService],
})
export class UsersModule {}
