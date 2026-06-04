import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Branch } from '../../entities/branch.entity'

@Injectable()
export class BranchesService {
  constructor(@InjectRepository(Branch) private repo: Repository<Branch>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true } })
  }

  async findOne(id: string) {
    const branch = await this.repo.findOne({ where: { id } })
    if (!branch) throw new NotFoundException('Branch not found')
    return branch
  }

  create(dto: Partial<Branch>) {
    return this.repo.save(this.repo.create(dto))
  }
}
