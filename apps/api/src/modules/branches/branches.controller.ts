import { Controller, Get, Post, Param, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { BranchesService } from './branches.service'

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'List all branches' })
  findAll() {
    return this.branchesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by ID' })
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a branch' })
  create(@Body() dto: any) {
    return this.branchesService.create(dto)
  }
}
