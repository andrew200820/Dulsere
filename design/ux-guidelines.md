# Guía UX/CX — Dulseré ERP

Principios de experiencia de usuario adaptados a la marca: cercana, elegante, cálida.

---

## Principios de Diseño

1. **Claridad sobre decoración** — Los usuarios gestionan pedidos y stock reales. La interfaz no debe distraer.
2. **Feedback inmediato** — Cada acción del usuario recibe una respuesta visual en menos de 100ms.
3. **Calidez de marca** — Aunque es un ERP, el tono y los colores deben recordar que Dulseré es una marca con identidad personal y cálida.
4. **Progresión natural** — Los flujos siguen el orden lógico del negocio: cliente → proforma → pago → entrega.

---

## Estructura de Navegación

### Top Navbar (visible siempre)
```
[Logo DULSERÉ]  |  [módulos si hay espacio]  |  [Notificaciones]  [Avatar + Rol]
```

### Sidebar (principal, 240px)
```
─────────────────
  MÓDULOS
  📊 Dashboard
  
  INVENTARIO
  📦 Insumos
  🧁 Productos
  📋 Movimientos
  
  VENTAS
  📄 Proformas
  👤 Clientes
  
  ADMINISTRACIÓN  (solo rol Admin)
  ⚙️  Configuración
  👥 Usuarios
─────────────────
```

### Jerarquía de páginas
```
/login
/dashboard
/inventario/insumos
/inventario/insumos/:id
/inventario/productos
/inventario/productos/:id
/inventario/movimientos
/proformas
/proformas/nueva
/proformas/:id
/clientes
/clientes/:id
/admin/usuarios
/admin/configuracion
```

---

## Flujos Principales

### 1. Login
```
[Pantalla login]
  → ingresa email + contraseña
  → error: toast error + shake en inputs
  → éxito: redirect a /dashboard
  → spinner en botón mientras carga
```

### 2. Dashboard
```
Layout: 4 métricas arriba + 2 columnas abajo

Métricas superiores (cards de métrica):
  - Proformas activas (Pendiente + Definitiva)
  - Ingresos del mes (suma de proformas cerradas)
  - Insumos bajo stock mínimo (alerta roja si > 0)
  - Pedidos pendientes de entrega

Columna izquierda (60%):
  - Tabla "Proformas recientes" — últimas 5, con badge de estado

Columna derecha (40%):
  - "Insumos críticos" — lista de insumos bajo mínimo
  - Acceso rápido: [+ Nueva Proforma] [+ Registrar Movimiento]
```

### 3. Crear Proforma
```
[/proformas] → botón [+ Nueva Proforma]
  → drawer o página /proformas/nueva

Pasos del formulario (flujo lineal):
  Paso 1: Cliente
    - Buscar cliente existente (autocomplete por nombre/RUC)
    - O crear cliente nuevo (modal rápido)
  
  Paso 2: Detalle de productos
    - Tabla editable: [Producto] [Cantidad] [Precio unit.] [Descuento] [Subtotal]
    - Botón [+ Agregar ítem]
    - Resumen: subtotal, descuento total, IVA, TOTAL
  
  Paso 3: Condiciones
    - Fecha de entrega (date picker)
    - Notas / instrucciones especiales (textarea)
    - Anticipo requerido (opcional)
  
  Acciones:
    - [Guardar como Pendiente] (secondary)
    - [Crear Definitiva] (primary)
    - [Cancelar] (ghost)

Al guardar: toast success + redirect a /proformas/:id
```

### 4. Gestionar Proforma existente
```
[/proformas/:id] — Layout de detalle

Header de página:
  "Proforma #001" | Badge estado | [Editar] [Imprimir PDF] [...]

Secciones:
  - Info del cliente (card)
  - Detalle de ítems (tabla, solo lectura si estado != Pendiente)
  - Resumen de totales (card lateral)
  - Pagos recibidos (tabla de anticipos)
  - Historial de estado (timeline vertical)

Cambios de estado:
  Pendiente → [Convertir a Definitiva] (primary)
  Definitiva → [Registrar Pago] (primary) | [Cerrar Proforma] (secondary)
  Cerrada → solo lectura, badge verde

Cada cambio de estado: modal de confirmación con resumen
```

### 5. Registrar Movimiento de Inventario
```
[/inventario/movimientos] → [+ Registrar Movimiento]
  → modal o drawer

Campos:
  - Tipo: [Entrada / Salida / Ajuste] (radio grande, visual)
  - Insumo (select con búsqueda)
  - Cantidad
  - Motivo / referencia
  - Fecha (default: hoy)

Al guardar: toast success + actualiza stock en tiempo real en la tabla
```

---

## Estados de UI

### Estado Vacío
Cada lista/tabla que pueda estar vacía debe tener:
```
Ícono sugerido (ilustración line-art de la marca, 64px, color #E0D6CE)
Título: "Aún no hay [X]"
Subtexto: acción sugerida — ej. "Crea tu primera proforma para comenzar"
Botón CTA (primary, si aplica)
```

### Estado de Carga
- Tablas: skeleton screen (filas fantasma con shimmer)
- Botones: spinner inline + texto "Guardando..." + disabled
- Página completa (primera carga): spinner centrado sobre fondo `#FDF1E2`

### Estado de Error de Red
```
Card centrada con:
  Ícono alerta (32px, #DC2626)
  "No se pudo cargar la información"
  "Verifica tu conexión e intenta de nuevo"
  Botón [Reintentar] (secondary)
```

### Estado sin permisos (403)
```
Mensaje: "No tienes permisos para ver esta sección"
Texto rol actual: ej. "Tu rol es: Producción"
Botón: [Volver al Dashboard]
```

---

## Feedback al Usuario

### Validaciones de formulario
- **En tiempo real** (onBlur): validar campo cuando el usuario sale de él
- **Al submit**: mostrar todos los errores juntos si los hay
- Estilo: borde rojo en el input + mensaje debajo en rojo (text-sm)
- No usar alerts del navegador — siempre mensajes inline o toasts

### Confirmaciones de acciones destructivas
Siempre modal de confirmación para:
- Eliminar insumo/producto
- Anular proforma
- Eliminar usuario
- Resetear contraseña

El modal debe incluir exactamente qué se va a eliminar (nombre, número).

### Toasts
| Acción | Tipo | Mensaje ejemplo |
|--------|------|-----------------|
| Guardar éxito | Success | "Proforma #003 guardada correctamente" |
| Error de servidor | Error | "No se pudo guardar. Intenta de nuevo." |
| Stock mínimo | Warning | "El stock de Harina está bajo el mínimo" |
| PDF generado | Info | "PDF listo para descargar" |

Duración: 4 segundos. Con botón ✕ para cerrar manualmente.

---

## Accesibilidad (WCAG AA)

### Contraste verificado
| Combinación | Ratio estimado | Estado |
|-------------|----------------|--------|
| #FFFFFF sobre #890A0A | ~7:1 | ✅ AA+ |
| #890A0A sobre #FFFFFF | ~7:1 | ✅ AA+ |
| #890A0A sobre #FDF1E2 | ~6.5:1 | ✅ AA |
| #2E201A sobre #FFFFFF | ~14:1 | ✅ AAA |
| #887870 sobre #FFFFFF | ~4.5:1 | ✅ AA (texto normal mín.) |

> **Alerta:** #A89890 sobre #FFFFFF no pasa AA para texto pequeño. Usar solo para texto decorativo o de 18px+.

### Teclado y foco
- Todos los botones, inputs, links y elementos interactivos deben ser alcanzables con Tab
- Outline de foco: `2px solid #B91C1C, offset 2px` — nunca `outline: none` sin reemplazo visible
- Modales: al abrirse, el foco va al primer elemento interactivo dentro. Al cerrar, regresa al botón que lo abrió (focus trap)
- Tablas: filas clickeables deben tener `role="button"` o ser `<a>` con href

### Semántica HTML
- Usar `<nav>`, `<main>`, `<header>`, `<aside>` correctamente
- Tablas de datos: `<th scope="col">` en encabezados
- Formularios: `<label for="id">` vinculado a cada input
- Botones de ícono solo: `aria-label` descriptivo (ej. `aria-label="Eliminar proforma #003"`)
- Badges de estado: `role="status"` o texto descriptivo para lectores de pantalla

---

## Responsive

### Desktop (1024px+) — Prioridad
Layout completo: sidebar + contenido. Tablas con todas las columnas.

### Tablet (768px–1023px)
Sidebar colapsado a iconos (64px). Top navbar mantiene logo + avatar. Tablas scrolleables horizontalmente.

### Móvil (< 768px)
Sidebar oculto, accesible por hamburger menu. Tablas simplificadas (columnas clave solamente). Formularios de una columna.

---

## Copywriting de Interfaz (Tono Dulseré)

Aunque es un ERP interno, el tono debe ser coherente con la marca: claro, cálido, sin ser frío ni técnico.

| Contexto | En lugar de... | Usar... |
|----------|----------------|---------|
| Botón guardar | "Submit" | "Guardar" |
| Estado vacío | "No records found" | "Aún no hay proformas" |
| Error genérico | "Error 500" | "Algo salió mal. Inténtalo de nuevo." |
| Éxito al crear | "Record created" | "Proforma creada correctamente" |
| Confirmar eliminar | "Are you sure?" | "¿Eliminar este insumo? Esta acción no se puede deshacer." |
| Cargando | "Loading..." | "Cargando..." |
| Sin permisos | "Unauthorized" | "No tienes acceso a esta sección" |
