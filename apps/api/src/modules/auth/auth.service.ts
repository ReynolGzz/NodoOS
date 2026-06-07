import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import * as crypto from 'crypto'
import { UsersService } from '../users/users.service'
import { GamificationService } from '../gamification/gamification.service'

// In-memory magic link store — swap for Redis in production
const magicLinks = new Map<string, { email: string; expiresAt: number }>()

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private usersService: UsersService,
    private gamificationService: GamificationService,
  ) {}

  private signToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email }, { expiresIn: '30d' })
  }

  async sendMagicLink(email: string, locale = 'es') {
    const token = crypto.randomBytes(32).toString('hex')
    magicLinks.set(token, { email, expiresAt: Date.now() + 15 * 60 * 1000 })

    const verifyUrl = `${this.config.get('APP_URL')}/api/auth/verify?token=${token}`

    const host = this.config.get('SMTP_HOST')
    if (host) {
      const transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        auth: { user: this.config.get('SMTP_USER'), pass: this.config.get('SMTP_PASS') },
      })
      const subject = locale === 'en' ? 'Your NODO magic link' : 'Tu enlace mágico NODO'
      const html = locale === 'en'
        ? `<p>Click <a href="${verifyUrl}">here</a> to sign in to NODO OS. Expires in 15 min.</p>`
        : `<p>Haz clic <a href="${verifyUrl}">aquí</a> para iniciar sesión en NODO OS. Expira en 15 min.</p>`
      await transporter.sendMail({ from: this.config.get('SMTP_FROM'), to: email, subject, html })
    }

    return { message: 'Magic link sent', ...(process.env.NODE_ENV === 'development' ? { devToken: token } : {}) }
  }

  async verifyMagicLink(token: string) {
    const entry = magicLinks.get(token)
    if (!entry || Date.now() > entry.expiresAt) return null
    magicLinks.delete(token)

    const user = await this.usersService.findOrCreateByEmail(entry.email)
    await this.usersService.incrementVisit(user.id)

    // Award visit XP + check visit badges (fire-and-forget)
    this.gamificationService.earnXp(user.id, 10).then(async () => {
      await this.gamificationService.checkVisitBadges(user.id, user.totalVisits + 1)
      await this.gamificationService.incrementChallengeProgress(user.id, 'visit_count')
    }).catch(() => {})

    return {
      accessToken: this.signToken(user.id, user.email!),
      user: { id: user.id, email: user.email, name: user.name, totalPoints: user.totalPoints },
    }
  }

  async handleGoogleUser(profile: { email: string; name: string; picture?: string; googleId: string }) {
    const user = await this.usersService.findOrCreateByEmail(profile.email)
    // Update name/avatar from Google if not set
    if (!user.name && profile.name) {
      await this.usersService.updateProfile(user.id, { name: profile.name })
    }
    return {
      accessToken: this.signToken(user.id, user.email!),
      user: { id: user.id, email: user.email, name: user.name ?? profile.name },
    }
  }
}
