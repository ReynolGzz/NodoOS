import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { TablesService } from './tables.service'

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get('by-token/:token')
  @ApiOperation({ summary: 'Get table context by QR token' })
  findByToken(@Param('token') token: string) {
    return this.tablesService.findByQrToken(token)
  }
}
