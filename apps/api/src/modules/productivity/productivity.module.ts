import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductivityController } from './productivity.controller'
import { ProductivityService } from './productivity.service'
import { TableSession } from '../../entities/table-session.entity'
import { Reservation } from '../../entities/reservation.entity'
import { PlaylistVote } from '../../entities/playlist-vote.entity'
import { Table } from '../../entities/table.entity'
import { Order } from '../../entities/order.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TableSession, Reservation, PlaylistVote, Table, Order])],
  controllers: [ProductivityController],
  providers: [ProductivityService],
  exports: [ProductivityService],
})
export class ProductivityModule {}
