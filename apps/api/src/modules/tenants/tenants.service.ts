import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tenant, TenantBranding, TenantPlan } from '../../entities/tenant.entity'
import { Role, RolePermissions } from '../../entities/role.entity'
import { Staff } from '../../entities/staff.entity'
import { User } from '../../entities/user.entity'
import { Branch } from '../../entities/branch.entity'
import { Order, OrderStatus } from '../../entities/order.entity'

const DEFAULT_ROLES: Array<{ name: string; permissions: RolePermissions }> = [
  {
    name: 'admin',
    permissions: {
      orders: ['read', 'write', 'delete'],
      products: ['read', 'write', 'delete'],
      tables: ['read', 'write'],
      reports: ['read'],
      staff: ['read', 'write', 'delete'],
      billing: ['read', 'write'],
    },
  },
  {
    name: 'manager',
    permissions: {
      orders: ['read', 'write'],
      products: ['read', 'write'],
      tables: ['read', 'write'],
      reports: ['read'],
      staff: ['read'],
      billing: ['read'],
    },
  },
  {
    name: 'barista',
    permissions: { orders: ['read', 'write'], products: ['read'], tables: ['read'] },
  },
  {
    name: 'waiter',
    permissions: { orders: ['read', 'write'], tables: ['read', 'write'] },
  },
]

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async createTenant(slug: string, name: string, plan: TenantPlan = 'starter') {
    const existing = await this.tenantRepo.findOne({ where: { slug } })
    if (existing) throw new ConflictException(`Tenant slug "${slug}" already taken`)

    const tenant = this.tenantRepo.create({ slug, name, plan })
    const saved = await this.tenantRepo.save(tenant)

    const roles = DEFAULT_ROLES.map((r) =>
      this.roleRepo.create({ tenantId: saved.id, name: r.name, permissions: r.permissions }),
    )
    await this.roleRepo.save(roles)

    return saved
  }

  getTenant(id: string) {
    return this.tenantRepo.findOne({ where: { id } })
  }

  getTenantBySlug(slug: string) {
    return this.tenantRepo.findOne({ where: { slug } })
  }

  getAllTenants() {
    return this.tenantRepo.find({ order: { createdAt: 'DESC' } })
  }

  async updateBranding(tenantId: string, branding: Partial<TenantBranding>) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    if (!tenant) throw new NotFoundException('Tenant not found')
    tenant.branding = { ...tenant.branding, ...branding }
    return this.tenantRepo.save(tenant)
  }

  async updatePlan(tenantId: string, plan: TenantPlan, stripeSubscriptionId?: string) {
    await this.tenantRepo.update(tenantId, {
      plan,
      stripeSubscriptionId: stripeSubscriptionId ?? null,
    })
    return this.tenantRepo.findOne({ where: { id: tenantId } })
  }

  // ── Roles ────────────────────────────────────────────────────
  getRoles(tenantId: string) {
    return this.roleRepo.find({ where: { tenantId } })
  }

  // ── Staff ────────────────────────────────────────────────────
  getStaff(tenantId: string) {
    return this.staffRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } })
  }

  async addStaff(tenantId: string, email: string, roleId: string, branchId?: string) {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) throw new NotFoundException(`No user found with email ${email}`)

    const existing = await this.staffRepo.findOne({ where: { tenantId, userId: user.id } })
    if (existing) throw new ConflictException('User is already staff in this tenant')

    const staff = this.staffRepo.create({
      tenantId,
      userId: user.id,
      roleId,
      branchId: branchId ?? null,
    })
    return this.staffRepo.save(staff)
  }

  async updateStaffRole(staffId: string, roleId: string, branchId?: string) {
    await this.staffRepo.update(staffId, { roleId, branchId: branchId ?? null })
    return this.staffRepo.findOne({ where: { id: staffId } })
  }

  async removeStaff(staffId: string) {
    await this.staffRepo.delete(staffId)
  }

  async isStaff(tenantId: string, userId: string) {
    return this.staffRepo.findOne({ where: { tenantId, userId } })
  }

  // ── Multi-branch overview ─────────────────────────────────────
  async getTenantOverview(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    if (!tenant) throw new NotFoundException('Tenant not found')

    const branches = await this.branchRepo.find({ where: { tenantId } })

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const branchStats = await Promise.all(
      branches.map(async (branch) => {
        const [todayOrders, activeCount, staffCount] = await Promise.all([
          this.orderRepo.find({
            where: { branchId: branch.id, status: OrderStatus.DELIVERED },
            select: ['total'],
          }),
          this.orderRepo.count({
            where: [
              { branchId: branch.id, status: OrderStatus.RECEIVED },
              { branchId: branch.id, status: OrderStatus.PREPARING },
              { branchId: branch.id, status: OrderStatus.READY },
            ],
          }),
          this.staffRepo.count({ where: { tenantId, branchId: branch.id } }),
        ])

        return {
          branch: { id: branch.id, name: branch.name, slug: branch.slug },
          todayOrders: todayOrders.length,
          todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
          activeOrders: activeCount,
          staffCount,
        }
      }),
    )

    const totalRevenue = branchStats.reduce((s, b) => s + b.todayRevenue, 0)
    const totalOrders = branchStats.reduce((s, b) => s + b.todayOrders, 0)

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        branding: tenant.branding,
      },
      summary: { totalRevenue, totalOrders, totalBranches: branches.length },
      branches: branchStats,
    }
  }
}
