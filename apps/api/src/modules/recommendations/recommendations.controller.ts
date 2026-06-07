import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { RecommendationsService } from './recommendations.service'

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get context-aware product recommendations and personalized greeting' })
  @ApiQuery({ name: 'branchId', required: true })
  @ApiQuery({ name: 'locale', required: false, enum: ['es', 'en'] })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'userName', required: false })
  getRecommendations(
    @Query('branchId') branchId: string,
    @Query('locale') locale = 'es',
    @Query('userId') userId?: string,
    @Query('userName') userName?: string,
  ) {
    return this.service.getRecommendations(branchId, locale, userId, userName)
  }
}
