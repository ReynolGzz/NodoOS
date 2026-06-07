import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { Product } from '../../entities/product.entity'
import { UserProfile } from '../../entities/user-profile.entity'
import { RecommendationEvent } from '../../entities/recommendation-event.entity'
import { WeatherService, WeatherData } from './weather.service'
import { UserProfileService } from './user-profile.service'

interface RecommendationContext {
  userId?: string
  branchId: string
  hour: number
  dayOfWeek: number
  month: number
  weatherCode?: number
  temperature?: number
  locale: string
  userName?: string
}

export interface RecommendationResult {
  products: Product[]
  greeting: string
}

@Injectable()
export class RecommendationsService {
  private anthropic: Anthropic | null = null

  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
    @InjectRepository(RecommendationEvent) private eventRepo: Repository<RecommendationEvent>,
    private weatherService: WeatherService,
    private userProfileService: UserProfileService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY')
    if (apiKey) this.anthropic = new Anthropic({ apiKey })
  }

  async getRecommendations(
    branchId: string,
    locale: string,
    userId?: string,
    userName?: string,
  ): Promise<RecommendationResult> {
    const now = new Date()
    const weather = await this.weatherService.getWeatherForBranch()

    const ctx: RecommendationContext = {
      userId,
      branchId,
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      month: now.getMonth() + 1,
      weatherCode: weather?.weatherCode,
      temperature: weather?.temperature,
      locale,
      userName,
    }

    const products = await this.productRepo.find({
      where: { branchId, isAvailable: true },
      relations: ['options', 'options.values'],
    })

    const sorted = this.applyRules(products, ctx)
    const top = sorted.slice(0, 6)

    // Fire-and-forget event logging
    this.eventRepo
      .save(
        top.map((p) =>
          this.eventRepo.create({
            userId: userId ?? null,
            productId: p.id,
            recommendationContext: {
              weather: weather?.weatherCode,
              temperature: weather?.temperature,
              hour: ctx.hour,
              day: ctx.dayOfWeek,
              month: ctx.month,
            },
          }),
        ),
      )
      .catch(() => {})

    let profile: UserProfile | null = null
    if (userId) {
      profile = await this.userProfileService.getProfile(userId)
    }

    const greeting = await this.generateGreeting(ctx, profile, weather)

    return { products: top, greeting }
  }

  private applyRules(products: Product[], ctx: RecommendationContext): Product[] {
    return [...products].sort((a, b) => this.score(b, ctx) - this.score(a, ctx))
  }

  private score(product: Product, ctx: RecommendationContext): number {
    let s = product.sortOrder * -1

    const raw = `${product.nameEs} ${product.nameEn ?? ''}`.toLowerCase()
    const isHot = /caliente|cappuccino|latte|americano|espresso|macchiato|té\b|tea\b|hot\b/.test(raw)
    const isCold = /frap|cold brew|iced|helad|smoothie|limon/.test(raw)
    const isBreakfast = /croissant|bagel|waffle|panqu|muffin|desayuno|avena|granola/.test(raw)
    const isSnack = /cookie|brownie|sandwich|tostada|pastel|cake|pan /.test(raw)

    const temp = ctx.temperature
    if (temp !== undefined) {
      if (temp < 15 && isHot) s += 20
      if (temp > 28 && isCold) s += 20
      if (temp > 28 && isHot) s -= 10
      if (temp < 15 && isCold) s -= 10
    }

    const h = ctx.hour
    if (h >= 6 && h < 11) {
      if (isBreakfast) s += 15
      if (isHot) s += 8
    }
    if (h >= 11 && h < 14) {
      if (isSnack) s += 5
    }
    if (h >= 14 && h < 17) {
      if (isCold) s += 8
      if (isSnack) s += 5
    }
    if (h >= 17 && h < 21) {
      if (isSnack) s += 10
    }

    return s
  }

  private async generateGreeting(
    ctx: RecommendationContext,
    profile: UserProfile | null,
    weather: WeatherData | null,
  ): Promise<string> {
    if (!this.anthropic) return this.fallbackGreeting(ctx)

    try {
      const es = ctx.locale === 'es'
      const part = ctx.hour < 12 ? (es ? 'mañana' : 'morning') : ctx.hour < 17 ? (es ? 'tarde' : 'afternoon') : (es ? 'noche' : 'evening')
      const nameClause = ctx.userName ? (es ? `, ${ctx.userName}` : `, ${ctx.userName}`) : ''
      const weatherClause = weather
        ? (es ? ` Clima: ${weather.temperature.toFixed(0)}°C, ${weather.description}.` : ` Weather: ${weather.temperature.toFixed(0)}°C, ${weather.description}.`)
        : ''
      const milkClause = profile?.preferredMilk
        ? (es ? ` Prefiere leche de ${profile.preferredMilk}.` : ` They prefer ${profile.preferredMilk} milk.`)
        : ''

      const prompt = es
        ? `Genera un saludo breve y cálido (1-2 oraciones) para un cliente de café en la ${part}${nameClause ? ` llamado "${ctx.userName}"` : ''}.${weatherClause}${milkClause} Sé natural, amigable y contextual. Sin comillas, sin mencionar puntos o recompensas.`
        : `Generate a brief, warm greeting (1-2 sentences) for a café customer in the ${part}${nameClause ? ` named "${ctx.userName}"` : ''}.${weatherClause}${milkClause} Be natural, friendly and contextual. No quotes, no mention of points or rewards.`

      const msg = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{ role: 'user', content: prompt }],
      })

      const block = msg.content[0]
      return block.type === 'text' ? block.text.trim() : this.fallbackGreeting(ctx)
    } catch {
      return this.fallbackGreeting(ctx)
    }
  }

  private fallbackGreeting(ctx: RecommendationContext): string {
    const es = ctx.locale === 'es'
    const name = ctx.userName ? `, ${ctx.userName}` : ''
    if (es) {
      if (ctx.hour < 12) return `¡Buenos días${name}! ¿Qué te apetece hoy?`
      if (ctx.hour < 17) return `¡Buenas tardes${name}! Estamos listos para servirte.`
      return `¡Buenas noches${name}! Bienvenido.`
    }
    if (ctx.hour < 12) return `Good morning${name}! What can we get for you today?`
    if (ctx.hour < 17) return `Good afternoon${name}! Ready to serve you.`
    return `Good evening${name}! Welcome in.`
  }
}
