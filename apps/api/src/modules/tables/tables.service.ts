import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Table } from '../../entities/table.entity'

@Injectable()
export class TablesService {
  constructor(@InjectRepository(Table) private repo: Repository<Table>) {}

  async findByQrToken(token: string) {
    const table = await this.repo.findOne({
      where: { qrToken: token, isActive: true },
      relations: ['branch', 'zone'],
    })
    if (!table) throw new NotFoundException('Table not found')
    return table
  }

  findByBranch(branchId: string) {
    return this.repo.find({ where: { branchId }, relations: ['zone'] })
  }
}
