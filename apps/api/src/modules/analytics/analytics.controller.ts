import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AnalyticsService } from './analytics.service'
import { ForecastingService } from './forecasting.service'
import { CrmService } from './crm.service'
import { CampaignsService } from './campaigns.service'
import { SegmentRules } from '../../entities/crm-segment.entity'

@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private analytics: AnalyticsService,
    private forecasting: ForecastingService,
    private crm: CrmService,
    private campaigns: CampaignsService,
  ) {}

  // ── Dashboard stats ──────────────────────────────────────────
  @Get('dashboard')
  getDashboard(@Query('branchId') branchId: string, @Query('days') days?: string) {
    return this.analytics.getDashboardStats(branchId, days ? parseInt(days) : 30)
  }

  @Get('hourly')
  getHourly(@Query('branchId') branchId: string, @Query('date') date?: string) {
    return this.analytics.getHourlyRevenue(branchId, date)
  }

  @Get('daily')
  getDaily(@Query('branchId') branchId: string, @Query('days') days?: string) {
    return this.analytics.getDailyRevenue(branchId, days ? parseInt(days) : 14)
  }

  @Get('top-products')
  getTopProducts(@Query('branchId') branchId: string, @Query('limit') limit?: string) {
    return this.analytics.getTopProducts(branchId, limit ? parseInt(limit) : 10)
  }

  @Get('customers')
  getCustomers(@Query('branchId') branchId: string, @Query('days') days?: string) {
    return this.analytics.getCustomerStats(branchId, days ? parseInt(days) : 30)
  }

  // ── Demand forecast ──────────────────────────────────────────
  @Get('forecast')
  getForecast(@Query('branchId') branchId: string, @Query('date') date?: string) {
    return this.forecasting.getForecast(branchId, date)
  }

  @Post('forecast/generate')
  generateForecast(@Body() body: { branchId: string; date?: string }) {
    return this.forecasting.generateForecast(body.branchId, body.date)
  }

  // ── CRM segments ─────────────────────────────────────────────
  @Get('segments')
  getSegments(@Query('branchId') branchId: string) {
    return this.crm.getSegments(branchId)
  }

  @Post('segments')
  createSegment(@Body() body: { branchId: string; name: string; description: string; rules: SegmentRules }) {
    return this.crm.createSegment(body.branchId, body.name, body.description, body.rules)
  }

  @Put('segments/:id')
  updateSegment(
    @Param('id') id: string,
    @Body() body: { name: string; description: string; rules: SegmentRules },
  ) {
    return this.crm.updateSegment(id, body.name, body.description, body.rules)
  }

  @Delete('segments/:id')
  deleteSegment(@Param('id') id: string) {
    return this.crm.deleteSegment(id)
  }

  @Get('segments/:id/users')
  getSegmentUsers(@Param('id') segmentId: string) {
    return this.crm.getUsersInSegment(segmentId)
  }

  // ── Campaigns ────────────────────────────────────────────────
  @Get('campaigns')
  getCampaigns(@Query('branchId') branchId: string) {
    return this.campaigns.getCampaigns(branchId)
  }

  @Post('campaigns')
  createCampaign(
    @Body() body: {
      branchId: string
      name: string
      segmentId?: string
      channel: string
      trigger: string
      messageTemplate: { es: string; en: string }
    },
  ) {
    return this.campaigns.createCampaign(body)
  }

  @Put('campaigns/:id')
  updateCampaign(@Param('id') id: string, @Body() body: any) {
    return this.campaigns.updateCampaign(id, body)
  }

  @Delete('campaigns/:id')
  deleteCampaign(@Param('id') id: string) {
    return this.campaigns.deleteCampaign(id)
  }

  @Post('campaigns/:id/send')
  sendCampaign(@Param('id') id: string, @Body() body: { locale?: 'es' | 'en' }) {
    return this.campaigns.sendCampaign(id, body.locale ?? 'es')
  }
}
