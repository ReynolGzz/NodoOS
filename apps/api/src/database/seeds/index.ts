import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { nanoid } from 'nanoid'

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://nodoos:nodoos_dev_password@localhost:5432/nodoos',
  entities: [__dirname + '/../../entities/*.entity{.ts,.js}'],
  synchronize: true,
})

async function seed() {
  await AppDataSource.initialize()
  console.log('🌱 Seeding database...')

  const branchRepo = AppDataSource.getRepository('Branch')
  const zoneRepo = AppDataSource.getRepository('Zone')
  const tableRepo = AppDataSource.getRepository('Table')
  const categoryRepo = AppDataSource.getRepository('Category')
  const productRepo = AppDataSource.getRepository('Product')
  const optionRepo = AppDataSource.getRepository('ProductOption')
  const valueRepo = AppDataSource.getRepository('OptionValue')

  // Branch
  const branch = await branchRepo.save(branchRepo.create({
    name: 'NODO Café — Centro',
    slug: 'centro',
    address: 'Av. Juárez 100, Centro Histórico',
    timezone: 'America/Mexico_City',
  }))
  console.log('✓ Branch created:', branch.id)

  // Zones
  const [interior, terraza] = await zoneRepo.save([
    zoneRepo.create({ branchId: branch.id, name: 'Interior' }),
    zoneRepo.create({ branchId: branch.id, name: 'Terraza' }),
  ])

  // Tables (1–10 interior, 11–15 terraza)
  const tables = []
  for (let n = 1; n <= 10; n++) {
    tables.push(tableRepo.create({ branchId: branch.id, zoneId: interior.id, number: n, qrToken: nanoid(12) }))
  }
  for (let n = 11; n <= 15; n++) {
    tables.push(tableRepo.create({ branchId: branch.id, zoneId: terraza.id, number: n, qrToken: nanoid(12) }))
  }
  await tableRepo.save(tables)
  console.log(`✓ ${tables.length} tables created`)

  // Categories
  const [cafes, teas, bakery, food] = await categoryRepo.save([
    categoryRepo.create({ branchId: branch.id, nameEs: 'Cafés', nameEn: 'Coffees', sortOrder: 1 }),
    categoryRepo.create({ branchId: branch.id, nameEs: 'Tés & Matcha', nameEn: 'Teas & Matcha', sortOrder: 2 }),
    categoryRepo.create({ branchId: branch.id, nameEs: 'Panadería', nameEn: 'Bakery', sortOrder: 3 }),
    categoryRepo.create({ branchId: branch.id, nameEs: 'Platillos', nameEn: 'Food', sortOrder: 4 }),
  ])

  // Products
  const espresso = await productRepo.save(productRepo.create({
    branchId: branch.id,
    categoryId: cafes.id,
    nameEs: 'Espresso',
    nameEn: 'Espresso',
    descriptionEs: 'Shot doble de espresso de origen único',
    descriptionEn: 'Double shot of single-origin espresso',
    price: 55,
    sortOrder: 1,
  }))

  const latte = await productRepo.save(productRepo.create({
    branchId: branch.id,
    categoryId: cafes.id,
    nameEs: 'Latte',
    nameEn: 'Latte',
    descriptionEs: 'Espresso con leche vaporizada y arte latte',
    descriptionEn: 'Espresso with steamed milk and latte art',
    price: 80,
    sortOrder: 2,
  }))

  const cappuccino = await productRepo.save(productRepo.create({
    branchId: branch.id,
    categoryId: cafes.id,
    nameEs: 'Cappuccino',
    nameEn: 'Cappuccino',
    descriptionEs: 'Espresso con espuma de leche densa',
    descriptionEn: 'Espresso with thick milk foam',
    price: 75,
    sortOrder: 3,
  }))

  const matchaLatte = await productRepo.save(productRepo.create({
    branchId: branch.id,
    categoryId: teas.id,
    nameEs: 'Matcha Latte',
    nameEn: 'Matcha Latte',
    descriptionEs: 'Matcha ceremonial grado A con leche de avena',
    descriptionEn: 'Ceremonial grade A matcha with oat milk',
    price: 95,
    sortOrder: 1,
  }))

  await productRepo.save([
    productRepo.create({ branchId: branch.id, categoryId: bakery.id, nameEs: 'Croissant de Mantequilla', nameEn: 'Butter Croissant', price: 65, sortOrder: 1 }),
    productRepo.create({ branchId: branch.id, categoryId: bakery.id, nameEs: 'Pain au Chocolat', nameEn: 'Pain au Chocolat', price: 70, sortOrder: 2 }),
    productRepo.create({ branchId: branch.id, categoryId: food.id, nameEs: 'Tostada de Aguacate', nameEn: 'Avocado Toast', descriptionEs: 'Pan artesanal, aguacate, semillas de cáñamo', descriptionEn: 'Artisan bread, avocado, hemp seeds', price: 120, sortOrder: 1 }),
  ])

  // Options for latte/cappuccino
  for (const product of [latte, cappuccino, matchaLatte]) {
    const milkOpt = await optionRepo.save(optionRepo.create({
      productId: product.id,
      nameEs: 'Tipo de leche',
      nameEn: 'Milk type',
      type: 'single',
      isRequired: false,
    }))
    await valueRepo.save([
      valueRepo.create({ optionId: milkOpt.id, nameEs: 'Entera', nameEn: 'Whole', priceDelta: 0 }),
      valueRepo.create({ optionId: milkOpt.id, nameEs: 'Avena', nameEn: 'Oat', priceDelta: 15 }),
      valueRepo.create({ optionId: milkOpt.id, nameEs: 'Almendra', nameEn: 'Almond', priceDelta: 15 }),
      valueRepo.create({ optionId: milkOpt.id, nameEs: 'Descremada', nameEn: 'Skim', priceDelta: 0 }),
    ])

    const sizeOpt = await optionRepo.save(optionRepo.create({
      productId: product.id,
      nameEs: 'Tamaño',
      nameEn: 'Size',
      type: 'single',
      isRequired: false,
    }))
    await valueRepo.save([
      valueRepo.create({ optionId: sizeOpt.id, nameEs: 'Chico (8 oz)', nameEn: 'Small (8 oz)', priceDelta: -10 }),
      valueRepo.create({ optionId: sizeOpt.id, nameEs: 'Mediano (12 oz)', nameEn: 'Medium (12 oz)', priceDelta: 0 }),
      valueRepo.create({ optionId: sizeOpt.id, nameEs: 'Grande (16 oz)', nameEn: 'Large (16 oz)', priceDelta: 15 }),
    ])
  }

  console.log('✓ Products and options created')
  console.log('\n🎉 Seed complete!')
  console.log(`\nBranch ID: ${branch.id}`)
  console.log('Table QR tokens:')
  tables.slice(0, 3).forEach((t) => console.log(`  Mesa ${t.number}: /m/${t.qrToken}`))

  await AppDataSource.destroy()
}

seed().catch((e) => { console.error('Seed failed:', e); process.exit(1) })
