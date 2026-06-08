import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Campaign } from '../../entities/campaign.entity'
import { CrmService } from './crm.service'
import { PushService } from '../users/push.service'

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name)

  constructor(
    @InjectRepository(Campaign) private campaignRepo: Repository<Campaign>,
    private crmService: CrmService,
    private pushService: PushService,
  ) {}

  getCampaigns(branchId: string) {
    return this.campaignRepo.find({ where: { branchId }, order: { createdAt: 'DESC' } })
  }

  createCampaign(dto: {
    branchId: string
    name: string
    segmentId?: string
    channel: string
    trigger: string
    messageTemplate: { es: string; en: string }
  }) {
    const campaign = this.campaignRepo.create({
      ...dto,
      segmentId: dto.segmentId ?? null,
      isActive: true,
      sentCount: 0,
    })
    return this.campaignRepo.save(campaign)
  }

  async updateCampaign(id: string, dto: Partial<Campaign>) {
    const campaign = await this.campaignRepo.findOne({ where: { id } })
    if (!campaign) throw new NotFoundException('Campaign not found')
    Object.assign(campaign, dto)
    return this.campaignRepo.save(campaign)
  }

  async deleteCampaign(id: string) {
    await this.campaignRepo.delete(id)
  }

  async sendCampaign(campaignId: string, locale: 'es' | 'en' = 'es') {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } })
    if (!campaign) throw new NotFoundException('Campaign not found')

    const message = campaign.messageTemplate[locale]
    let sentCount = 0

    if (campaign.channel === 'push') {
      let users: Array<{ id: string }> = []

      if (campaign.segmentId) {
        users = await this.crmService.getUsersInSegment(campaign.segmentId)
      }

      for (const user of users) {
        try {
          await this.pushService.sendToUser(user.id, {
            title: 'NODO',
            body: message,
          })
          sentCount++
        } catch {
          // ignore individual push failures
        }
      }
    } else {
      this.logger.log(`Campaign ${campaignId} (${campaign.channel}): ${message}`)
      sentCount = campaign.segmentId ? 1 : 0
    }

    await this.campaignRepo.update(campaignId, {
      sentCount: () => `sent_count + ${sentCount}`,
      lastRunAt: new Date(),
    })

    return { campaignId, sentCount, message }
  }
}
