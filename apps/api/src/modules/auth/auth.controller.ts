import { Controller, Post, Get, Body, Query, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString } from 'class-validator'
import { AuthService } from './auth.service'

class SendMagicLinkDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  locale?: string
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  @ApiOperation({ summary: 'Send magic link email' })
  sendMagicLink(@Body() dto: SendMagicLinkDto) {
    return this.authService.sendMagicLink(dto.email, dto.locale)
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify magic link token' })
  async verifyMagicLink(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token required')
    const result = await this.authService.verifyMagicLink(token)
    if (!result) throw new BadRequestException('Invalid or expired token')
    return result
  }
}
