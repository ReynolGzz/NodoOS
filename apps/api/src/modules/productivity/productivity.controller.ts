import {
  Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { IsString, IsInt, IsOptional, IsEnum, Min, Max, IsDateString } from 'class-validator'
import { ProductivityService } from './productivity.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TableMode } from '@nodo/types'
import { Request } from 'express'

interface AuthReq extends Request { user: { sub: string } }

class StartSessionDto {
  @IsString() tableToken: string
  @IsEnum(TableMode) mode: TableMode
}

class CreateReservationDto {
  @IsString() branchId: string
  @IsDateString() reservedAt: string
  @IsOptional() @IsInt() @Min(30) @Max(480) durationMinutes?: number
  @IsOptional() @IsInt() @Min(1) @Max(20) partySize?: number
  @IsOptional() @IsString() mode?: string
  @IsOptional() @IsString() notes?: string
}

class SplitBillDto {
  @IsString() orderId: string
  @IsInt() @Min(2) @Max(20) partySize: number
}

class PlaylistVoteDto {
  @IsString() branchId: string
  @IsString() playlistId: string
  @IsString() playlistName: string
}

@ApiTags('Productivity')
@Controller('productivity')
export class ProductivityController {
  constructor(private service: ProductivityService) {}

  // ─── Sessions ─────────────────────────────────────────────────────────────────

  @Post('sessions')
  @ApiOperation({ summary: 'Start or switch table session mode' })
  startSession(@Body() dto: StartSessionDto, @Req() req: Request) {
    const userId = (req as any).user?.sub
    return this.service.startOrUpdateSession(dto.tableToken, dto.mode, userId)
  }

  @Get('sessions/active')
  @ApiOperation({ summary: 'Get active session for a table' })
  getActiveSession(@Query('tableToken') tableToken: string) {
    return this.service.getActiveSession(tableToken)
  }

  @Delete('sessions')
  @ApiOperation({ summary: 'End active session for a table' })
  endSession(@Query('tableToken') tableToken: string) {
    return this.service.endSession(tableToken)
  }

  // ─── Reservations ─────────────────────────────────────────────────────────────

  @Post('reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a table reservation' })
  createReservation(@Body() dto: CreateReservationDto, @Req() req: AuthReq) {
    return this.service.createReservation(dto, req.user.sub)
  }

  @Get('reservations/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user reservations' })
  getMyReservations(@Req() req: AuthReq) {
    return this.service.getUserReservations(req.user.sub)
  }

  @Get('reservations')
  @ApiOperation({ summary: 'Get branch reservations for a date' })
  getBranchReservations(@Query('branchId') branchId: string, @Query('date') date?: string) {
    return this.service.getBranchReservations(branchId, date)
  }

  @Delete('reservations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancelReservation(@Param('id') id: string, @Req() req: AuthReq) {
    return this.service.cancelReservation(id, req.user.sub)
  }

  // ─── Bill Split ───────────────────────────────────────────────────────────────

  @Post('split')
  @ApiOperation({ summary: 'Calculate bill split for an order' })
  splitBill(@Body() dto: SplitBillDto) {
    return this.service.splitBill(dto.orderId, dto.partySize)
  }

  // ─── Playlist ─────────────────────────────────────────────────────────────────

  @Post('playlist/vote')
  @ApiOperation({ summary: 'Vote for a playlist' })
  votePlaylist(@Body() dto: PlaylistVoteDto, @Req() req: Request) {
    const userId = (req as any).user?.sub
    return this.service.votePlaylist(dto.branchId, dto.playlistId, dto.playlistName, userId)
  }

  @Get('playlist/top')
  @ApiOperation({ summary: 'Get top voted playlists for a branch' })
  getTopPlaylists(@Query('branchId') branchId: string) {
    return this.service.getTopPlaylists(branchId)
  }
}
