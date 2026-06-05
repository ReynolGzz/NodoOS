import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest()
    const auth = req.headers['authorization'] as string | undefined
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException()

    try {
      req.user = this.jwt.verify(auth.slice(7), {
        secret: this.config.getOrThrow('JWT_SECRET'),
      })
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}
