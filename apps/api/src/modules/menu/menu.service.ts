import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Branch } from '../../entities/branch.entity'
import { Table } from '../../entities/table.entity'
import { Zone } from '../../entities/zone.entity'
import { Category } from '../../entities/category.entity'
import { Product } from '../../entities/product.entity'

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(Table) private tableRepo: Repository<Table>,
    @InjectRepository(Zone) private zoneRepo: Repository<Zone>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async getMenuByTableToken(tableToken: string) {
    const table = await this.tableRepo.findOne({
      where: { qrToken: tableToken, isActive: true },
      relations: ['branch', 'zone'],
    })

    if (!table) throw new NotFoundException('Table not found')

    const [categories, products] = await Promise.all([
      this.categoryRepo.find({
        where: { branchId: table.branchId, isActive: true },
        order: { sortOrder: 'ASC' },
      }),
      this.productRepo.find({
        where: { branchId: table.branchId, isAvailable: true },
        relations: ['options', 'options.values'],
        order: { sortOrder: 'ASC' },
      }),
    ])

    return {
      branch: table.branch,
      table: { id: table.id, number: table.number, qrToken: table.qrToken },
      zone: table.zone ?? undefined,
      categories,
      products,
    }
  }
}
