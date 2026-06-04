import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MercadoPagoConfig, Preference } from 'mercadopago'

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig
  private preference: Preference

  constructor(private config: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: this.config.getOrThrow('MERCADOPAGO_ACCESS_TOKEN'),
    })
    this.preference = new Preference(this.client)
  }

  async createPreference(orderId: string, items: { title: string; quantity: number; unit_price: number }[], backUrls: { success: string; failure: string; pending: string }) {
    return this.preference.create({
      body: {
        items,
        external_reference: orderId,
        back_urls: backUrls,
        auto_return: 'approved',
      },
    })
  }
}
