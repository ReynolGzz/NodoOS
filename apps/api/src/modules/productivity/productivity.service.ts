import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThanOrEqual } from 'typeorm'
import { TableSession } from '../../entities/table-session.entity'
import { Reservation } from '../../entities/reservation.entity'
import { PlaylistVote } from '../../entities/playlist-vote.entity'
import { Table } from '../../entities/table.entity'
import { Order } from '../../entities/order.entity'
import { TableMode } from '@nodo/types'

export interface BillSplit {
  orderId: string
  total: number
  partySize: number
  perPerson: number
  items: Array<{ name: string; price: number; quantity: number; subtotal: number }>
}

@Injectable()
export class ProductivityService {
  constructor(
    @InjectRepository(TableSession) private sessionRepo: Repository<TableSession>,
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
    @InjectRepository(PlaylistVote) private voteRepo: Repository<PlaylistVote>,
    @InjectRepository(Table) private tableRepo: Repository<Table>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  // ─── Sessions ─────────────────────────────────────────────────────────────────

  async startOrUpdateSession(tableToken: string, mode: TableMode, userId?: string): Promise<TableSession> {
    const table = await this.tableRepo.findOne({ where: { qrToken: tableToken, isActive: true } })
    if (!table) throw new NotFoundException('Table not found')

    // Close any open session for this table
    await this.sessionRepo.update(
      { tableId: table.id, endedAt: undefined as any },
      { endedAt: new Date() },
    )

    const session = this.sessionRepo.create({
      tableId: table.id,
      userId: userId ?? null,
      mode,
      participants: userId ? [userId] : [],
    })
    return this.sessionRepo.save(session)
  }

  async getActiveSession(tableToken: string): Promise<TableSession | null> {
    const table = await this.tableRepo.findOne({ where: { qrToken: tableToken, isActive: true } })
    if (!table) return null
    return this.sessionRepo.findOne({
      where: { tableId: table.id, endedAt: undefined as any },
      order: { startedAt: 'DESC' },
    })
  }

  async endSession(tableToken: string): Promise<void> {
    const table = await this.tableRepo.findOne({ where: { qrToken: tableToken } })
    if (!table) return
    await this.sessionRepo.update({ tableId: table.id, endedAt: undefined as any }, { endedAt: new Date() })
  }

  // ─── Reservations ─────────────────────────────────────────────────────────────

  async createReservation(dto: {
    branchId: string
    reservedAt: string
    durationMinutes?: number
    partySize?: number
    mode?: string
    notes?: string
  }, userId: string): Promise<Reservation> {
    const reservation = this.reservationRepo.create({
      branchId: dto.branchId,
      userId,
      reservedAt: new Date(dto.reservedAt),
      durationMinutes: dto.durationMinutes ?? 120,
      partySize: dto.partySize ?? 1,
      mode: dto.mode ?? null,
      notes: dto.notes ?? null,
      status: 'confirmed',
    })
    return this.reservationRepo.save(reservation)
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return this.reservationRepo.find({
      where: {
        userId,
        status: 'confirmed',
        reservedAt: MoreThanOrEqual(new Date()),
      },
      order: { reservedAt: 'ASC' },
    })
  }

  async getBranchReservations(branchId: string, date?: string): Promise<Reservation[]> {
    const start = date ? new Date(date) : new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    return this.reservationRepo
      .createQueryBuilder('r')
      .where('r.branchId = :branchId', { branchId })
      .andWhere('r.reservedAt >= :start', { start })
      .andWhere('r.reservedAt < :end', { end })
      .andWhere("r.status != 'cancelled'")
      .orderBy('r.reservedAt', 'ASC')
      .getMany()
  }

  async cancelReservation(reservationId: string, userId: string): Promise<void> {
    const reservation = await this.reservationRepo.findOne({ where: { id: reservationId } })
    if (!reservation) throw new NotFoundException('Reservation not found')
    if (reservation.userId !== userId) throw new ForbiddenException()
    await this.reservationRepo.update(reservationId, { status: 'cancelled' })
  }

  // ─── Bill Split ───────────────────────────────────────────────────────────────

  async splitBill(orderId: string, partySize: number): Promise<BillSplit> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    })
    if (!order) throw new NotFoundException('Order not found')

    const perPerson = parseFloat((order.total / partySize).toFixed(2))

    const items = order.items.map((item) => {
      const name = item.product?.nameEs ?? 'Producto'
      const subtotal = parseFloat((item.unitPrice * item.quantity).toFixed(2))
      return { name, price: item.unitPrice, quantity: item.quantity, subtotal }
    })

    return { orderId, total: order.total, partySize, perPerson, items }
  }

  // ─── Playlist Voting ──────────────────────────────────────────────────────────

  async votePlaylist(branchId: string, playlistId: string, playlistName: string, userId?: string): Promise<void> {
    await this.voteRepo.save(
      this.voteRepo.create({ branchId, playlistId, playlistName, userId: userId ?? null })
    )
  }

  async getTopPlaylists(branchId: string): Promise<Array<{ playlistId: string; playlistName: string; votes: number }>> {
    const rows = await this.voteRepo
      .createQueryBuilder('v')
      .select('v.playlistId', 'playlistId')
      .addSelect('v.playlistName', 'playlistName')
      .addSelect('COUNT(*)', 'votes')
      .where('v.branchId = :branchId', { branchId })
      .groupBy('v.playlistId, v.playlistName')
      .orderBy('votes', 'DESC')
      .limit(5)
      .getRawMany<{ playlistId: string; playlistName: string; votes: string }>()
    return rows.map((r) => ({ ...r, votes: parseInt(r.votes, 10) }))
  }
}
