import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import * as crypto from 'crypto'

// In-memory magic link store (use Redis in production)
const magicLinks = new Map<string, { email: string; expiresAt: number }>()

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async sendMagicLink(email: string, locale = 'es') {
    const token = crypto.randomBytes(32).toString('hex')
    magicLinks.set(token, { email, expiresAt: Date.now() + 15 * 60 * 1000 })

    const verifyUrl = `${this.config.get('APP_URL')}/api/auth/verify?token=${token}`

    const transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT', 587),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    })

    const subject = locale === 'en' ? 'Your NODO magic link' : 'Tu enlace mágico NODO'
    const html = locale === 'en'
      ? `<p>Click <a href="${verifyUrl}">here</a> to sign in to NODO OS. Link expires in 15 minutes.</p>`
      : `<p>Haz clic <a href="${verifyUrl}">aquí</a> para iniciar sesión en NODO OS. El enlace expira en 15 minutos.</p>`

    await transporter.sendMail({ from: this.config.get('SMTP_FROM'), to: email, subject, html })
    return { message: 'Magic link sent' }
  }

  async verifyMagicLink(token: string) {
    const entry = magicLinks.get(token)
    if (!entry || Date.now() > entry.expiresAt) {
      return null
    }
    magicLinks.delete(token)

    // In full implementation: upsert user record in DB
    const accessToken = this.jwt.sign({ email: entry.email, sub: entry.email })
    return { accessToken, email: entry.email }
  }
}
