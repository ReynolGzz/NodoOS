import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { AdminService } from './admin.service'

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getDashboard(@Query('branchId') branchId: string) {
    return this.adminService.getDashboardStats(branchId)
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all products for a branch' })
  getProducts(@Query('branchId') branchId: string) {
    return this.adminService.getProducts(branchId)
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product' })
  createProduct(@Query('branchId') branchId: string, @Body() dto: any) {
    return this.adminService.createProduct(branchId, dto)
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product' })
  updateProduct(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateProduct(id, dto)
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product' })
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id)
  }

  @Get('tables')
  @ApiOperation({ summary: 'Get tables for a branch' })
  getTables(@Query('branchId') branchId: string) {
    return this.adminService.getTables(branchId)
  }

  @Post('tables')
  @ApiOperation({ summary: 'Create a table and generate QR token' })
  createTable(@Query('branchId') branchId: string, @Body() dto: { number: number; zoneId?: string }) {
    return this.adminService.createTable(branchId, dto.number, dto.zoneId)
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get categories for a branch' })
  getCategories(@Query('branchId') branchId: string) {
    return this.adminService.getCategories(branchId)
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get recent orders' })
  getOrders(@Query('branchId') branchId: string, @Query('limit') limit?: number) {
    return this.adminService.getRecentOrders(branchId, limit)
  }
}
