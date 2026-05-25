import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Sembrando base de datos...')

  // ── Roles ────────────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { nombre: 'Admin' },
      update: {},
      create: { nombre: 'Admin', descripcion: 'Acceso total al sistema' },
    }),
    prisma.role.upsert({
      where: { nombre: 'Inventario' },
      update: {},
      create: { nombre: 'Inventario', descripcion: 'Gestión de insumos, productos y movimientos' },
    }),
    prisma.role.upsert({
      where: { nombre: 'Produccion' },
      update: {},
      create: { nombre: 'Produccion', descripcion: 'Vista del dashboard de producción y proformas' },
    }),
  ])

  const [roleAdmin, roleInventario, roleProduccion] = roles
  console.log('✅  Roles creados:', roles.map((r) => r.nombre).join(', '))

  // ── Usuarios de prueba ───────────────────────────────────────────────────
  const hash = (pwd: string) => bcrypt.hash(pwd, 10)

  await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'admin@dulsere.com' },
      update: {},
      create: {
        email: 'admin@dulsere.com',
        passwordHash: await hash('admin123'),
        nombre: 'Andrea Pérez',
        roleId: roleAdmin.id,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'inventario@dulsere.com' },
      update: {},
      create: {
        email: 'inventario@dulsere.com',
        passwordHash: await hash('inv123'),
        nombre: 'Carlos Mora',
        roleId: roleInventario.id,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'produccion@dulsere.com' },
      update: {},
      create: {
        email: 'produccion@dulsere.com',
        passwordHash: await hash('prod123'),
        nombre: 'Valeria Torres',
        roleId: roleProduccion.id,
      },
    }),
  ])
  console.log('✅  Usuarios de prueba creados')

  // ── Insumos ──────────────────────────────────────────────────────────────
  const insumosData = [
    { nombre: 'Harina de trigo',    unidadMedida: 'g',  stockActual: 5000, stockMinimo: 1000, costoUnitario: 0.0015 },
    { nombre: 'Azúcar blanca',      unidadMedida: 'g',  stockActual: 3000, stockMinimo: 500,  costoUnitario: 0.0012 },
    { nombre: 'Mantequilla',        unidadMedida: 'g',  stockActual: 800,  stockMinimo: 200,  costoUnitario: 0.012  },
    { nombre: 'Huevos',             unidadMedida: 'ud', stockActual: 24,   stockMinimo: 12,   costoUnitario: 0.22   },
    { nombre: 'Leche entera',       unidadMedida: 'ml', stockActual: 2000, stockMinimo: 500,  costoUnitario: 0.0009 },
    { nombre: 'Crema de leche',     unidadMedida: 'ml', stockActual: 500,  stockMinimo: 200,  costoUnitario: 0.0025 },
    { nombre: 'Chocolate negro',    unidadMedida: 'g',  stockActual: 600,  stockMinimo: 150,  costoUnitario: 0.018  },
    { nombre: 'Cacao en polvo',     unidadMedida: 'g',  stockActual: 300,  stockMinimo: 100,  costoUnitario: 0.008  },
    { nombre: 'Vainilla extracto',  unidadMedida: 'ml', stockActual: 80,   stockMinimo: 20,   costoUnitario: 0.05   },
    { nombre: 'Polvo de hornear',   unidadMedida: 'g',  stockActual: 150,  stockMinimo: 50,   costoUnitario: 0.006  },
    { nombre: 'Sal',                unidadMedida: 'g',  stockActual: 500,  stockMinimo: 100,  costoUnitario: 0.001  },
    { nombre: 'Fresas frescas',     unidadMedida: 'g',  stockActual: 80,   stockMinimo: 200,  costoUnitario: 0.006  },
  ]

  const insumos: Record<string, number> = {}
  for (const ins of insumosData) {
    const created = await prisma.insumo.upsert({
      where: { id: (await prisma.insumo.findFirst({ where: { nombre: ins.nombre } }))?.id ?? 0 },
      update: {},
      create: ins,
    })
    insumos[ins.nombre] = created.id
  }
  console.log('✅  Insumos creados:', Object.keys(insumos).length)

  // ── Productos ────────────────────────────────────────────────────────────
  const productosData = [
    { nombre: 'Torta de Chocolate',     descripcion: 'Torta húmeda de chocolate con ganache', precioVenta: 28.00 },
    { nombre: 'Torta de Vainilla',      descripcion: 'Torta clásica de vainilla con buttercream', precioVenta: 24.00 },
    { nombre: 'Cupcakes x12',           descripcion: 'Docena de cupcakes personalizados', precioVenta: 18.00 },
    { nombre: 'Torta de Fresas',        descripcion: 'Torta con crema y fresas frescas', precioVenta: 32.00 },
    { nombre: 'Cheesecake',             descripcion: 'Cheesecake de frutos rojos', precioVenta: 22.00 },
    { nombre: 'Brownies x9',            descripcion: 'Bandeja de brownies fudge', precioVenta: 12.00 },
  ]

  const productos: Record<string, number> = {}
  for (const prod of productosData) {
    const created = await prisma.producto.upsert({
      where: { id: (await prisma.producto.findFirst({ where: { nombre: prod.nombre } }))?.id ?? 0 },
      update: {},
      create: prod,
    })
    productos[prod.nombre] = created.id
  }
  console.log('✅  Productos creados:', Object.keys(productos).length)

  // ── Recetas BOM ──────────────────────────────────────────────────────────
  const bomData = [
    // Torta de Chocolate (1 unidad)
    { producto: 'Torta de Chocolate', insumo: 'Harina de trigo',  cantidad: 300 },
    { producto: 'Torta de Chocolate', insumo: 'Azúcar blanca',    cantidad: 250 },
    { producto: 'Torta de Chocolate', insumo: 'Mantequilla',      cantidad: 150 },
    { producto: 'Torta de Chocolate', insumo: 'Huevos',           cantidad: 3   },
    { producto: 'Torta de Chocolate', insumo: 'Chocolate negro',  cantidad: 200 },
    { producto: 'Torta de Chocolate', insumo: 'Cacao en polvo',   cantidad: 50  },
    { producto: 'Torta de Chocolate', insumo: 'Leche entera',     cantidad: 120 },
    // Torta de Vainilla (1 unidad)
    { producto: 'Torta de Vainilla',  insumo: 'Harina de trigo',  cantidad: 280 },
    { producto: 'Torta de Vainilla',  insumo: 'Azúcar blanca',    cantidad: 200 },
    { producto: 'Torta de Vainilla',  insumo: 'Mantequilla',      cantidad: 120 },
    { producto: 'Torta de Vainilla',  insumo: 'Huevos',           cantidad: 3   },
    { producto: 'Torta de Vainilla',  insumo: 'Vainilla extracto', cantidad: 5  },
    { producto: 'Torta de Vainilla',  insumo: 'Leche entera',     cantidad: 100 },
    // Cupcakes x12
    { producto: 'Cupcakes x12',       insumo: 'Harina de trigo',  cantidad: 200 },
    { producto: 'Cupcakes x12',       insumo: 'Azúcar blanca',    cantidad: 150 },
    { producto: 'Cupcakes x12',       insumo: 'Mantequilla',      cantidad: 100 },
    { producto: 'Cupcakes x12',       insumo: 'Huevos',           cantidad: 2   },
    { producto: 'Cupcakes x12',       insumo: 'Leche entera',     cantidad: 80  },
    // Torta de Fresas
    { producto: 'Torta de Fresas',    insumo: 'Harina de trigo',  cantidad: 280 },
    { producto: 'Torta de Fresas',    insumo: 'Azúcar blanca',    cantidad: 180 },
    { producto: 'Torta de Fresas',    insumo: 'Mantequilla',      cantidad: 120 },
    { producto: 'Torta de Fresas',    insumo: 'Huevos',           cantidad: 3   },
    { producto: 'Torta de Fresas',    insumo: 'Crema de leche',   cantidad: 200 },
    { producto: 'Torta de Fresas',    insumo: 'Fresas frescas',   cantidad: 300 },
    // Brownies x9
    { producto: 'Brownies x9',        insumo: 'Harina de trigo',  cantidad: 120 },
    { producto: 'Brownies x9',        insumo: 'Azúcar blanca',    cantidad: 200 },
    { producto: 'Brownies x9',        insumo: 'Mantequilla',      cantidad: 100 },
    { producto: 'Brownies x9',        insumo: 'Huevos',           cantidad: 2   },
    { producto: 'Brownies x9',        insumo: 'Chocolate negro',  cantidad: 150 },
  ]

  for (const bom of bomData) {
    const pid = productos[bom.producto]
    const iid = insumos[bom.insumo]
    if (!pid || !iid) continue
    await prisma.recetaBom.upsert({
      where: { productoId_insumoId: { productoId: pid, insumoId: iid } },
      update: {},
      create: { productoId: pid, insumoId: iid, cantidadRequerida: bom.cantidad },
    })
  }
  console.log('✅  Recetas BOM creadas')

  // ── Clientes ─────────────────────────────────────────────────────────────
  const clientesData = [
    { nombre: 'María García',     cedulaRuc: '1709123456',    telefono: '0991234567', email: 'maria@gmail.com',    direccionEntrega: 'Av. República del Salvador N35-12, Quito' },
    { nombre: 'Empresa TECH S.A.',cedulaRuc: '1791234560001', telefono: '022345678',  email: 'eventos@tech.ec',    direccionEntrega: 'Av. Naciones Unidas E2-39, piso 8' },
    { nombre: 'Laura Sánchez',    cedulaRuc: '1700987654',    telefono: '0987654321', email: null,                 direccionEntrega: 'Cumbayá, Jardines del Este Mz. 5' },
    { nombre: 'Roberto Alvarado', cedulaRuc: '1712345670',    telefono: '0976543210', email: 'rob.alvarado@out.com', direccionEntrega: null },
  ]

  const clienteIds: number[] = []
  for (const cli of clientesData) {
    const created = await prisma.cliente.upsert({
      where: { cedulaRuc: cli.cedulaRuc },
      update: {},
      create: cli,
    })
    clienteIds.push(created.id)
  }
  console.log('✅  Clientes creados:', clienteIds.length)

  // ── Proformas de muestra ─────────────────────────────────────────────────
  const now = new Date()
  const days = (n: number) => new Date(now.getTime() + n * 86_400_000)

  const proformasData = [
    // Pendiente — entrega hoy
    {
      clienteId: clienteIds[0],
      estado: 'Pendiente',
      fechaEntrega: days(0),
      subtotal: 56.00,
      total: 62.72,
      montoIva: 6.72,
      porcentajeIva: 12,
      detalles: [
        { productoId: productos['Torta de Chocolate'], cantidad: 1, precioUnitario: 28.00, subtotal: 28.00 },
        { productoId: productos['Cupcakes x12'],       cantidad: 2, precioUnitario: 18.00, subtotal: 36.00 },
      ],
      pagos: [{ monto: 30.00, tipoPago: 'Anticipo', metodoPago: 'Transferencia', referencia: 'TRF-001' }],
    },
    // Definitiva — entrega en 2 días
    {
      clienteId: clienteIds[1],
      estado: 'Definitiva',
      fechaEntrega: days(2),
      subtotal: 80.00,
      total: 89.60,
      montoIva: 9.60,
      porcentajeIva: 12,
      detalles: [
        { productoId: productos['Torta de Vainilla'], cantidad: 2, precioUnitario: 24.00, subtotal: 48.00 },
        { productoId: productos['Torta de Fresas'],   cantidad: 1, precioUnitario: 32.00, subtotal: 32.00 },
      ],
      pagos: [{ monto: 50.00, tipoPago: 'Anticipo', metodoPago: 'Efectivo', referencia: null }],
    },
    // Pendiente — entrega en 5 días
    {
      clienteId: clienteIds[2],
      estado: 'Pendiente',
      fechaEntrega: days(5),
      subtotal: 46.00,
      total: 51.52,
      montoIva: 5.52,
      porcentajeIva: 12,
      detalles: [
        { productoId: productos['Torta de Fresas'], cantidad: 1, precioUnitario: 32.00, subtotal: 32.00 },
        { productoId: productos['Brownies x9'],     cantidad: 1, precioUnitario: 12.00, subtotal: 12.00 },
      ],
      pagos: [],
    },
    // Cerrada — entregada
    {
      clienteId: clienteIds[0],
      estado: 'Cerrada',
      fechaEntrega: days(-7),
      subtotal: 50.00,
      total: 56.00,
      montoIva: 6.00,
      porcentajeIva: 12,
      detalles: [
        { productoId: productos['Cupcakes x12'],      cantidad: 2, precioUnitario: 18.00, subtotal: 36.00 },
        { productoId: productos['Cheesecake'],        cantidad: 1, precioUnitario: 22.00, subtotal: 22.00 },
      ],
      pagos: [{ monto: 56.00, tipoPago: 'Total', metodoPago: 'Transferencia', referencia: 'TRF-002' }],
    },
  ]

  for (const pf of proformasData) {
    const { detalles, pagos, ...pfData } = pf
    const created = await prisma.proforma.create({
      data: {
        ...pfData,
        detalles: { create: detalles },
        pagos:    { create: pagos },
      },
    })
    console.log(`   📄 Proforma #${created.id} — ${created.estado} — $${created.total}`)
  }

  // ── Movimientos de inventario ─────────────────────────────────────────────
  const adminUser = await prisma.usuario.findUnique({ where: { email: 'admin@dulsere.com' } })

  const movimientosData = [
    { insumoId: insumos['Harina de trigo'],  tipoMovimiento: 'Entrada', cantidad: 2000, motivo: 'Compra proveedor La Italiana', usuarioId: adminUser!.id },
    { insumoId: insumos['Azúcar blanca'],    tipoMovimiento: 'Entrada', cantidad: 1000, motivo: 'Compra supermercado', usuarioId: adminUser!.id },
    { insumoId: insumos['Chocolate negro'],  tipoMovimiento: 'Salida',  cantidad: 200,  motivo: 'Producción Torta Chocolate pedido #1', usuarioId: adminUser!.id },
    { insumoId: insumos['Huevos'],           tipoMovimiento: 'Ajuste',  cantidad: 24,   motivo: 'Conteo físico — inventario inicial', usuarioId: adminUser!.id },
    { insumoId: insumos['Fresas frescas'],   tipoMovimiento: 'Entrada', cantidad: 500,  motivo: 'Compra mercado Iñaquito', usuarioId: adminUser!.id },
  ]

  for (const mov of movimientosData) {
    await prisma.movimientoInventario.create({ data: mov })
  }
  console.log('✅  Movimientos creados:', movimientosData.length)

  console.log('\n🎉  Seed completado exitosamente!\n')
  console.log('─────────────────────────────────────')
  console.log('Usuarios de prueba:')
  console.log('  Admin      → admin@dulsere.com      / admin123')
  console.log('  Inventario → inventario@dulsere.com / inv123')
  console.log('  Producción → produccion@dulsere.com / prod123')
  console.log('─────────────────────────────────────\n')
}

main()
  .catch((e) => { console.error('❌  Error en seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
