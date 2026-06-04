import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MenuService } from './menu.service'

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':tableToken')
  @ApiOperation({ summary: 'Get menu by table QR token' })
  getMenu(@Param('tableToken') tableToken: string) {
    return this.menuService.getMenuByTableToken(tableToken)
  }
}
