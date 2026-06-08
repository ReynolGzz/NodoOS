import { Controller, Get, Post, Body, Param, Req, RawBodyRequest, Headers, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { BillingService } from './billing.service'
import { TenantPlan } from '../../entities/tenant.entity'

@Controller('api/billing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Get('plans')
  getPlans() {
    return this.billing.getPlans()
  }

  @UseGuards(JwtAuthGuard)
  @Get(':tenantId/status')
  getStatus(@Param('tenantId') tenantId: string) {
    return this.billing.getSubscriptionStatus(tenantId)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':tenantId/checkout')
  createCheckout(
    @Param('tenantId') tenantId: string,
    @Body() body: { plan: TenantPlan; locale?: string },
  ) {
    return this.billing.createCheckoutSession(tenantId, body.plan, body.locale ?? 'es')
  }

  @UseGuards(JwtAuthGuard)
  @Post(':tenantId/portal')
  createPortal(@Param('tenantId') tenantId: string) {
    return this.billing.createPortalSession(tenantId)
  }

  @Post('webhook/billing')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    await this.billing.handleWebhook(req.rawBody!, sig)
    return { received: true }
  }
}
