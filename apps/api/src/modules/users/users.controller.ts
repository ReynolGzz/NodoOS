import {
  Controller, Get, Patch, Post, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { LoyaltyService } from './loyalty.service'
import { PushService } from './push.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { IsUUID, IsOptional, IsObject } from 'class-validator'

class RedeemRewardDto {
  @IsUUID()
  rewardId: string

  @IsOptional()
  @IsUUID()
  orderId?: string
}

class PushSubscribeDto {
  @IsObject()
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly loyaltyService: LoyaltyService,
    private readonly pushService: PushService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.sub)
  }

  @Patch()
  @ApiOperation({ summary: 'Update profile / preferences' })
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto)
  }

  @Get('history')
  @ApiOperation({ summary: 'Get order history' })
  getHistory(@Req() req: any) {
    return this.usersService.getOrderHistory(req.user.sub)
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get favorite products' })
  getFavorites(@Req() req: any) {
    return this.usersService.getFavorites(req.user.sub)
  }

  @Post('favorites/:productId')
  @ApiOperation({ summary: 'Add product to favorites' })
  addFavorite(@Req() req: any, @Param('productId') productId: string) {
    return this.usersService.addFavorite(req.user.sub, productId)
  }

  @Delete('favorites/:productId')
  @ApiOperation({ summary: 'Remove from favorites' })
  removeFavorite(@Req() req: any, @Param('productId') productId: string) {
    return this.usersService.removeFavorite(req.user.sub, productId)
  }

  @Get('points')
  @ApiOperation({ summary: 'Get points balance and history' })
  async getPoints(@Req() req: any) {
    const [balance, history] = await Promise.all([
      this.loyaltyService.getBalance(req.user.sub),
      this.loyaltyService.getHistory(req.user.sub),
    ])
    return { ...balance, history }
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Get available rewards for a branch' })
  getRewards(@Query('branchId') branchId: string) {
    return this.loyaltyService.getRewards(branchId)
  }

  @Post('rewards/redeem')
  @ApiOperation({ summary: 'Redeem a reward with points' })
  redeem(@Req() req: any, @Body() dto: RedeemRewardDto) {
    return this.loyaltyService.redeem(req.user.sub, dto.rewardId, dto.orderId)
  }

  @Get('last-order')
  @ApiOperation({ summary: 'Get last order for "Lo de siempre" reorder' })
  getLastOrder(@Req() req: any, @Query('branchId') branchId: string) {
    return this.usersService.getLastOrder(req.user.sub, branchId)
  }

  @Post('push/subscribe')
  @ApiOperation({ summary: 'Register push notification subscription' })
  subscribePush(@Req() req: any, @Body() dto: PushSubscribeDto) {
    return this.pushService.subscribe(req.user.sub, dto.subscription)
  }
}
