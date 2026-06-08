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

  const branchRepo    = AppDataSource.getRepository('Branch')
  const zoneRepo      = AppDataSource.getRepository('Zone')
  const tableRepo     = AppDataSource.getRepository('Table')
  const categoryRepo  = AppDataSource.getRepository('Category')
  const productRepo   = AppDataSource.getRepository('Product')
  const optionRepo    = AppDataSource.getRepository('ProductOption')
  const valueRepo     = AppDataSource.getRepository('OptionValue')
  const badgeRepo     = AppDataSource.getRepository('Badge')
  const challengeRepo = AppDataSource.getRepository('Challenge')
  const eventRepo     = AppDataSource.getRepository('CafeEvent')
  const tenantRepo    = AppDataSource.getRepository('Tenant')
  const roleRepo      = AppDataSource.getRepository('Role')
  const userRepo      = AppDataSource.getRepository('User')
  const staffRepo     = AppDataSource.getRepository('Staff')

  // ── Tenant ──────────────────────────────────────────────────────────────────
  const tenant = await tenantRepo.save(tenantRepo.create({
    slug: 'nodo-demo',
    name: 'NODO Demo',
    plan: 'pro',
    branding: { primaryColor: '#c8973a', accentColor: '#e8b355', logoUrl: null, fontFamily: null },
  }))
  console.log('✓ Tenant created:', tenant.id)

  // Default roles for the tenant
  const [adminRole] = await roleRepo.save([
    roleRepo.create({ tenantId: tenant.id, name: 'admin',   permissions: { orders: ['read','write','delete'], products: ['read','write','delete'], tables: ['read','write'], reports: ['read'], staff: ['read','write','delete'], billing: ['read','write'] } }),
    roleRepo.create({ tenantId: tenant.id, name: 'manager', permissions: { orders: ['read','write'], products: ['read','write'], tables: ['read','write'], reports: ['read'], staff: ['read'], billing: ['read'] } }),
    roleRepo.create({ tenantId: tenant.id, name: 'barista', permissions: { orders: ['read','write'], products: ['read'], tables: ['read'] } }),
    roleRepo.create({ tenantId: tenant.id, name: 'waiter',  permissions: { orders: ['read','write'], tables: ['read','write'] } }),
  ])
  console.log('✓ Roles created')

  // Superadmin user
  const superadminEmail = process.env.SUPERADMIN_EMAIL ?? 'admin@nodo.cafe'
  let adminUser = await userRepo.findOne({ where: { email: superadminEmail } })
  if (!adminUser) {
    adminUser = await userRepo.save(userRepo.create({ email: superadminEmail, name: 'Admin' }))
    console.log('✓ Superadmin user created:', superadminEmail)
  }
  await staffRepo.save(staffRepo.create({ tenantId: tenant.id, userId: adminUser.id, roleId: adminRole.id }))
  console.log('✓ Admin staff record created')

  // ── Branch ──────────────────────────────────────────────────────────────────
  const branch = await branchRepo.save(branchRepo.create({
    name: 'NODO Café — Centro',
    slug: 'centro',
    address: 'Av. Juárez 100, Centro Histórico',
    timezone: 'America/Mexico_City',
    tenantId: tenant.id,
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

  // ── Badges ──────────────────────────────────────────────────────────────────
  await badgeRepo.save([
    badgeRepo.create({ slug: 'first-order',    nameEs: 'Primera Orden',      nameEn: 'First Order',       descriptionEs: 'Hiciste tu primer pedido', descriptionEn: 'You placed your first order', icon: '☕', xpReward: 50,  triggerType: 'order_count',  triggerValue: 1 }),
    badgeRepo.create({ slug: 'coffee-regular', nameEs: 'Café Regular',       nameEn: 'Coffee Regular',    descriptionEs: '5 visitas al café',        descriptionEn: '5 visits to the café',       icon: '⭐', xpReward: 100, triggerType: 'visit_count',  triggerValue: 5 }),
    badgeRepo.create({ slug: 'explorer',       nameEs: 'Explorador',         nameEn: 'Explorer',          descriptionEs: 'Probaste 3 categorías',    descriptionEn: 'Tried 3 different categories', icon: '🗺️', xpReward: 75,  triggerType: 'category_count', triggerValue: 3 }),
    badgeRepo.create({ slug: 'coffee-addict',  nameEs: 'Café Addict',        nameEn: 'Coffee Addict',     descriptionEs: '10 órdenes completadas',   descriptionEn: '10 orders completed',        icon: '🏆', xpReward: 200, triggerType: 'order_count',  triggerValue: 10 }),
    badgeRepo.create({ slug: 'big-spender',    nameEs: 'Gran Gastador',      nameEn: 'Big Spender',       descriptionEs: 'Gastaste $500 en total',   descriptionEn: 'Spent $500 total',           icon: '💰', xpReward: 150, triggerType: 'spend_total',  triggerValue: 500 }),
    badgeRepo.create({ slug: 'level-silver',   nameEs: 'Plata',              nameEn: 'Silver',            descriptionEs: 'Alcanzaste nivel Plata',   descriptionEn: 'Reached Silver level',       icon: '🥈', xpReward: 0,   triggerType: 'level_up',     triggerValue: 500 }),
    badgeRepo.create({ slug: 'level-gold',     nameEs: 'Oro',                nameEn: 'Gold',              descriptionEs: 'Alcanzaste nivel Oro',     descriptionEn: 'Reached Gold level',         icon: '🥇', xpReward: 0,   triggerType: 'level_up',     triggerValue: 2000 }),
    badgeRepo.create({ slug: 'level-black',    nameEs: 'Leyenda',            nameEn: 'Legend',            descriptionEs: 'Nivel máximo: Black',      descriptionEn: 'Max level: Black',           icon: '⚫', xpReward: 0,   triggerType: 'level_up',     triggerValue: 10000 }),
  ])
  console.log('✓ Badges seeded')

  // ── Challenges (weekly, rolling) ─────────────────────────────────────────────
  const nextMonday = new Date()
  nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7 || 7)
  nextMonday.setHours(23, 59, 59, 0)

  await challengeRepo.save([
    challengeRepo.create({ slug: 'weekly-3-orders',      nameEs: '3 pedidos esta semana',       nameEn: '3 orders this week',         descriptionEs: 'Realiza 3 pedidos en 7 días',     descriptionEn: 'Place 3 orders in 7 days',           challengeType: 'order_count',  targetValue: 3,   xpReward: 100, expiresAt: nextMonday }),
    challengeRepo.create({ slug: 'weekly-try-3-cats',    nameEs: 'Explorador semanal',          nameEn: 'Weekly explorer',            descriptionEs: 'Prueba 3 categorías diferentes',  descriptionEn: 'Try 3 different categories',         challengeType: 'category_count', targetValue: 3, xpReward: 150, expiresAt: nextMonday }),
    challengeRepo.create({ slug: 'weekly-spend-300',     nameEs: 'Gasta $300 esta semana',      nameEn: 'Spend $300 this week',       descriptionEs: 'Acumula $300 en pedidos',         descriptionEn: 'Accumulate $300 in orders',          challengeType: 'spend_amount', targetValue: 300, xpReward: 200, expiresAt: nextMonday }),
    challengeRepo.create({ slug: 'lifetime-10-visits',   nameEs: '10 visitas',                  nameEn: '10 visits',                  descriptionEs: 'Visita el café 10 veces en total', descriptionEn: 'Visit the café 10 times total',     challengeType: 'visit_count',  targetValue: 10,  xpReward: 250 }),
  ])
  console.log('✓ Challenges seeded')

  // ── Events ───────────────────────────────────────────────────────────────────
  const eventBase = (daysAhead: number, hour: number) => {
    const d = new Date(); d.setDate(d.getDate() + daysAhead); d.setHours(hour, 0, 0, 0); return d
  }
  await eventRepo.save([
    eventRepo.create({ branchId: branch.id, nameEs: 'Jazz & Coffee Mondays', nameEn: 'Jazz & Coffee Mondays', descriptionEs: 'Música en vivo y café de especialidad', descriptionEn: 'Live music and specialty coffee', eventType: 'jazz',     startsAt: eventBase(1, 19), endsAt: eventBase(1, 22), xpReward: 50 }),
    eventRepo.create({ branchId: branch.id, nameEs: 'Noche de Código',       nameEn: 'Coding Night',           descriptionEs: 'Trabaja con otros makers',              descriptionEn: 'Work alongside fellow makers',   eventType: 'coding',   startsAt: eventBase(3, 18), endsAt: eventBase(3, 22), xpReward: 50 }),
    eventRepo.create({ branchId: branch.id, nameEs: 'Cata de Café',          nameEn: 'Coffee Tasting',         descriptionEs: 'Descubre tres orígenes diferentes',     descriptionEn: 'Discover three different origins', eventType: 'tasting', startsAt: eventBase(5, 17), endsAt: eventBase(5, 19), xpReward: 75 }),
  ])
  console.log('✓ Events seeded')

  console.log('\n🎉 Seed complete!')
  console.log(`\nTenant ID: ${tenant.id}`)
  console.log(`Branch ID:  ${branch.id}`)
  console.log(`Admin user: ${superadminEmail}`)
  console.log('\nTable QR tokens:')
  tables.slice(0, 3).forEach((t) => console.log(`  Mesa ${t.number}: /m/${t.qrToken}`))

  await AppDataSource.destroy()
}

seed().catch((e) => { console.error('Seed failed:', e); process.exit(1) })
