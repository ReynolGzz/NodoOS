import { Controller, Get, Post, Param, Query, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { GamificationService } from './gamification.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Request } from 'express'

interface AuthRequest extends Request {
  user: { sub: string; email: string }
}

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private service: GamificationService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user XP, level, badges, challenges' })
  getProfile(@Req() req: AuthRequest) {
    return this.service.getGamificationProfile(req.user.sub)
  }

  @Get('events')
  @ApiOperation({ summary: 'Get upcoming events for a branch' })
  getEvents(@Query('branchId') branchId: string) {
    return this.service.getUpcomingEvents(branchId)
  }

  @Post('events/:eventId/attend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register event attendance and earn XP' })
  attendEvent(@Param('eventId') eventId: string, @Req() req: AuthRequest) {
    return this.service.attendEvent(req.user.sub, eventId)
  }

  @Get('secret-menu')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get secret menu items unlocked for the authenticated user' })
  async getSecretMenu(@Req() req: AuthRequest) {
    const profile = await this.service.getGamificationProfile(req.user.sub)
    return this.service.getUnlockedSecretItems(req.user.sub, profile.level)
  }
}
