import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, Req, ForbiddenException,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { TenantsService } from './tenants.service'
import { TenantBranding, TenantPlan } from '../../entities/tenant.entity'

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? ''

function isSuperAdmin(req: any) {
  return req.user?.email && req.user.email === SUPERADMIN_EMAIL
}

@Controller('api/tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private service: TenantsService) {}

  // ── Superadmin: all tenants ──────────────────────────────────
  @Get()
  getAllTenants(@Req() req: any) {
    if (!isSuperAdmin(req)) throw new ForbiddenException()
    return this.service.getAllTenants()
  }

  @Post()
  createTenant(
    @Req() req: any,
    @Body() body: { slug: string; name: string; plan?: TenantPlan },
  ) {
    if (!isSuperAdmin(req)) throw new ForbiddenException()
    return this.service.createTenant(body.slug, body.name, body.plan)
  }

  // ── Tenant public info (for white-label) ─────────────────────
  @Get('by-slug/:slug')
  getTenantBySlug(@Param('slug') slug: string) {
    return this.service.getTenantBySlug(slug)
  }

  // ── Tenant overview (multi-branch dashboard) ─────────────────
  @Get(':id/overview')
  getOverview(@Param('id') id: string, @Req() req: any) {
    return this.service.getTenantOverview(id)
  }

  // ── Branding ─────────────────────────────────────────────────
  @Patch(':id/branding')
  updateBranding(@Param('id') id: string, @Body() body: Partial<TenantBranding>) {
    return this.service.updateBranding(id, body)
  }

  // ── Plan ─────────────────────────────────────────────────────
  @Patch(':id/plan')
  updatePlan(@Param('id') id: string, @Body() body: { plan: TenantPlan; subscriptionId?: string }) {
    return this.service.updatePlan(id, body.plan, body.subscriptionId)
  }

  // ── Roles ────────────────────────────────────────────────────
  @Get(':id/roles')
  getRoles(@Param('id') id: string) {
    return this.service.getRoles(id)
  }

  // ── Staff ────────────────────────────────────────────────────
  @Get(':id/staff')
  getStaff(@Param('id') id: string) {
    return this.service.getStaff(id)
  }

  @Post(':id/staff')
  addStaff(
    @Param('id') tenantId: string,
    @Body() body: { email: string; roleId: string; branchId?: string },
  ) {
    return this.service.addStaff(tenantId, body.email, body.roleId, body.branchId)
  }

  @Put(':id/staff/:staffId')
  updateStaff(
    @Param('staffId') staffId: string,
    @Body() body: { roleId: string; branchId?: string },
  ) {
    return this.service.updateStaffRole(staffId, body.roleId, body.branchId)
  }

  @Delete(':id/staff/:staffId')
  removeStaff(@Param('staffId') staffId: string) {
    return this.service.removeStaff(staffId)
  }
}
