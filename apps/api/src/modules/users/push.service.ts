import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import * as webpush from 'web-push'
import { PushSubscription } from '../../entities/push-subscription.entity'

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(PushSubscription) private subRepo: Repository<PushSubscription>,
    private config: ConfigService,
  ) {
    const vapidPublic = config.get<string>('VAPID_PUBLIC_KEY')
    const vapidPrivate = config.get<string>('VAPID_PRIVATE_KEY')
    const vapidSubject = config.get<string>('VAPID_SUBJECT', 'mailto:noreply@nodo.cafe')

    if (vapidPublic && vapidPrivate) {
      webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)
    }
  }

  async subscribe(userId: string, subscription: PushSubscription['subscription']) {
    const existing = await this.subRepo.findOne({
      where: { userId, subscription: { endpoint: subscription.endpoint } as any },
    })
    if (existing) return existing
    return this.subRepo.save(this.subRepo.create({ userId, subscription }))
  }

  async sendToUser(userId: string, payload: { title: string; body: string; icon?: string; url?: string }) {
    const subs = await this.subRepo.find({ where: { userId } })
    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(s.subscription as any, JSON.stringify(payload)).catch(() => {
          // Remove invalid subscription
          this.subRepo.delete(s.id)
        })
      )
    )
    return results
  }

  async broadcast(userIds: string[], payload: { title: string; body: string; url?: string }) {
    await Promise.all(userIds.map((uid) => this.sendToUser(uid, payload)))
  }
}
