# Especificaciones de Componentes — Dulseré ERP

Basado en el Manual de Marca 2026. Fuente UI: Codec Pro. Color principal: #890A0A.

---

## Botones

### Variantes

#### Primary
Acciones principales: "Guardar", "Crear proforma", "Confirmar"
```
bg: #890A0A          | text: #FFFFFF        | border: none
hover bg: #5C0606    | hover shadow: shadow-md
focus outline: 2px solid #B91C1C + 2px offset
disabled bg: #E0D6CE | disabled text: #A89890
padding: 10px 20px   | radius: radius-md    | font: Codec Pro 500 14px
```

#### Secondary
Acciones secundarias: "Cancelar", "Volver", "Ver detalle"
```
bg: transparent      | text: #890A0A        | border: 1.5px solid #890A0A
hover bg: #FFF5F5    | hover border: #5C0606
focus outline: 2px solid #B91C1C + 2px offset
disabled text: #A89890 | disabled border: #E0D6CE
padding: 10px 20px   | radius: radius-md    | font: Codec Pro 500 14px
```

#### Ghost
Acciones terciarias: "Editar", links de tabla, acciones inline
```
bg: transparent      | text: #890A0A        | border: none
hover bg: #FFF5F5    | hover text: #5C0606
disabled text: #C8BDB5
padding: 8px 14px    | radius: radius-md    | font: Codec Pro 400 14px
```

#### Danger
Acciones destructivas: "Eliminar", "Anular"
```
bg: #DC2626          | text: #FFFFFF        | border: none
hover bg: #991B1B
focus outline: 2px solid #EF4444 + 2px offset
disabled bg: #FDDEDE | disabled text: #A89890
padding: 10px 20px   | radius: radius-md    | font: Codec Pro 500 14px
```

#### Tamaños
| Tamaño | Padding | Font | Uso |
|--------|---------|------|-----|
| `sm` | 6px 12px | 12px | Acciones dentro de tablas |
| `md` | 10px 20px | 14px | Estándar — formularios, páginas |
| `lg` | 14px 28px | 16px | CTA principal de página |

---

## Inputs y Formularios

### Text Input
```
border: 1.5px solid #E0D6CE  | radius: radius-sm     | bg: #FFFFFF
padding: 10px 14px            | font: Codec Pro 400 15px | color: #2E201A
placeholder color: #C8BDB5

focus: border #890A0A + shadow-xs
error: border #DC2626 + mensaje error debajo (text-sm, color #DC2626)
disabled: bg #F0EAE4, text #A89890, cursor not-allowed
```

### Select
Mismo estilo que Text Input. Ícono chevron en `#887870` a la derecha.

### Textarea
Mismo estilo que Text Input. `resize: vertical`. Mínimo 3 líneas.

### Checkbox
```
box: 16x16px, radius-sm, border 1.5px solid #E0D6CE
checked: bg #890A0A, checkmark blanco
focus: outline 2px solid #B91C1C
label: Codec Pro 400 15px, color #2E201A, gap 8px
```

### Radio
```
circle: 16x16px, border 1.5px solid #E0D6CE
selected: borde exterior #890A0A + punto interior #890A0A
```

### Date Picker
Mismo estilo que Text Input. Ícono calendario en `#887870`.

### Label
```
font: Codec Pro 500 13px | color: #4A3830 | margin-bottom: 4px
required mark: * en color #890A0A
```

### Helper Text / Error Message
```
font: Codec Pro 400 12px | margin-top: 4px
helper: color #887870
error: color #DC2626
```

### Form Group
```
gap entre campos: 16px
gap entre secciones del formulario: 32px
sección con título: Codec Pro 600 16px, color #2E201A, border-bottom 1px solid #E0D6CE, pb 8px, mb 16px
```

---

## Tablas

### Estructura General
```
width: 100%
border-collapse: collapse
font: Codec Pro 400 14px
```

### Header de Tabla
```
bg: #890A0A           | text: #FFFFFF          | font: Codec Pro 600 13px
padding: 12px 16px    | text-align: left       | text-transform: uppercase
letter-spacing: 0.05em
sticky: position sticky top 0, z-index z-sticky
```

### Fila Normal
```
bg: #FFFFFF           | border-bottom: 1px solid #F0EAE4
padding celdas: 12px 16px | color: #2E201A
```

### Fila Alterna (zebra)
```
bg: #FAF7F4 (neutral-50)
```

### Fila Hover
```
bg: #FFF5F5 (primary-50) | cursor: pointer
```

### Fila Seleccionada
```
bg: #FEE2E2 (primary-100) | border-left: 3px solid #890A0A
```

### Celda de Acciones
```
text-align: right
botones: ghost sm, gap 4px
```

### Paginación
```
contenedor: flex, justify-end, align-center, gap 8px, mt 16px
botones de página: 32x32px, radius-sm, font 13px
  - normal: bg transparent, border 1px solid #E0D6CE, color #2E201A
  - activo: bg #890A0A, text #FFFFFF, border none
  - hover (no activo): bg #FFF5F5
  - disabled: text #C8BDB5
info de paginación: "Mostrando X–Y de Z", text-sm, color #887870
```

### Estado Vacío de Tabla
```
celda colspan full, padding 48px, text-align center
ícono ilustrativo (opcional, 48px, color #E0D6CE)
texto: "No hay registros aún", Codec Pro 500 15px, color #887870
subtexto: acción sugerida, text-sm, color #A89890
```

---

## Badges y Chips de Estado

### Estados de Proformas
```
radius: radius-full | padding: 4px 12px | font: Codec Pro 600 12px | uppercase
```

| Estado | Texto | Bg | Color texto |
|--------|-------|----|-------------|
| Pendiente | PENDIENTE | `#FDE8D0` | `#B5621A` |
| Definitiva | DEFINITIVA | `#D0E8F5` | `#1A5C8A` |
| Cerrada | CERRADA | `#D4EDDA` | `#1D5C3A` |

### Badges Generales
```
radius: radius-full | padding: 3px 10px | font: Codec Pro 500 12px
success: bg #D4EDDA, text #1D5C3A
warning: bg #FDE8D0, text #92400E
error: bg #FDDEDE, text #991B1B
info: bg #D0E8F5, text #1E3A5F
neutral: bg #F0EAE4, text #685850
```

---

## Cards y Paneles

### Card Estándar
```
bg: #FFFFFF           | radius: radius-lg     | shadow: shadow-sm
padding: 24px         | border: 1px solid #F0EAE4
hover shadow: shadow-md (si es clickeable)
```

### Card de Métrica (Dashboard)
```
bg: #FFFFFF           | radius: radius-lg     | shadow: shadow-sm
padding: 20px 24px    | border-top: 3px solid #890A0A
valor: Codec Pro 700 28px, color #890A0A
label: Codec Pro 500 13px, color #887870, uppercase, letter-spacing 0.05em
```

### Panel de Sección
```
bg: #FFFFFF           | radius: radius-lg     | shadow: shadow-sm
header: padding 16px 24px, border-bottom 1px solid #F0EAE4
  título: Codec Pro 600 18px, color #2E201A
  acciones: alineadas a la derecha
body: padding 24px
```

---

## Navegación

### Top Navbar
```
height: 56px          | bg: #890A0A           | shadow: shadow-sm
padding: 0 24px       | position: sticky, top 0, z-index: z-sticky

logo: Hello Paris o imagotipo blanco, height 32px
nav items: Codec Pro 500 14px, color rgba(255,255,255,0.85)
  hover: color #FFFFFF, bg rgba(255,255,255,0.10), radius-md, padding 6px 12px
  activo: color #FFFFFF, bg rgba(255,255,255,0.15)
avatar/perfil: círculo 36x36px, bg #FFDCB1, text #890A0A, Codec Pro 700 14px
```

### Sidebar
```
width: 240px          | bg: #FFFFFF           | border-right: 1px solid #F0EAE4
padding: 16px 8px     | height: 100vh         | position: sticky, top 56px

sección header: Codec Pro 600 11px, color #A89890, uppercase, letter-spacing 0.08em, padding 8px 12px
item normal: padding 10px 12px, radius-md, Codec Pro 400 14px, color #4A3830
  ícono: 18px, color #A89890, margin-right 10px
  hover: bg #FFF5F5, color #890A0A, ícono color #890A0A
item activo: bg #FEE2E2, color #890A0A, Codec Pro 600 14px
  borde izquierdo: 3px solid #890A0A
separador entre secciones: border-top 1px solid #F0EAE4, margin 8px 0
```

### Breadcrumb
```
font: Codec Pro 400 13px | color: #887870
separador: / , color #C8BDB5, margin 0 6px
último item: color #2E201A, Codec Pro 500
```

---

## Modales

### Fondo (Backdrop)
```
bg: rgba(0,0,0,0.45) | z-index: z-modal-backdrop | backdrop-filter: blur(2px)
```

### Modal
```
bg: #FFFFFF           | radius: radius-lg     | shadow: shadow-xl
width: 480px (sm), 640px (md), 800px (lg)
max-width: 90vw       | max-height: 85vh      | overflow-y: auto

header: padding 20px 24px, border-bottom 1px solid #F0EAE4
  título: Codec Pro 600 18px, color #2E201A
  botón cerrar: ✕, ghost, 32x32px
body: padding 24px
footer: padding 16px 24px, border-top 1px solid #F0EAE4, flex, justify-end, gap 8px
```

### Modal de Confirmación (Danger)
```
ícono alerta: 48px, color #DC2626, centrado
título: Codec Pro 700 18px, centrado
texto: Codec Pro 400 15px, color #685850, centrado
botones: "Cancelar" (secondary) + "Confirmar" (danger), centrados
```

---

## Drawers

```
width: 400px (sm), 560px (md)
bg: #FFFFFF | shadow: shadow-xl | z-index: z-modal
position: fixed, right 0, top 0, height 100vh
padding: 24px

header: flex, justify-between, align-center, mb 24px
  título: Codec Pro 700 20px
  cerrar: ✕ ghost
body: flex-1, overflow-y auto
footer: border-top 1px solid #F0EAE4, pt 16px, flex, justify-end, gap 8px
```

---

## Toasts / Notificaciones

```
position: fixed, bottom 24px, right 24px, z-index: z-toast
width: 320px | radius: radius-lg | shadow: shadow-lg | padding: 14px 16px
font: Codec Pro 400 14px

ícono: 20px, alineado arriba, margin-right 12px
título (opcional): Codec Pro 600 14px
dismiss button: ✕, 20px, color heredado, opacity 0.7

success: bg #D4EDDA, text #1D5C3A, border-left 4px solid #2D7A4F
warning: bg #FDE8D0, text #92400E, border-left 4px solid #B5621A
error:   bg #FDDEDE, text #991B1B, border-left 4px solid #DC2626
info:    bg #D0E8F5, text #1E3A5F, border-left 4px solid #1A5C8A
```

---

## Página de Login

```
layout: pantalla dividida 50/50 en desktop, full en móvil
lado izquierdo: bg #890A0A
  logo DULSERÉ: Hello Paris, color #FFFFFF, tamaño grande
  slogan: "El detalle perfecto en cada bocado", Codec Pro 400 18px, color rgba(255,255,255,0.80)
  patrón decorativo de fondo: ilustraciones líneas del manual, opacity 0.08
lado derecho: bg #FDF1E2
  card login: bg #FFFFFF, padding 40px, radius-xl, shadow-lg, max-width 400px, centrado
  título: Codec Pro 700 24px, "Bienvenido"
  subtítulo: Codec Pro 400 14px, color #887870
  inputs: estándar
  botón: Primary lg, width 100%
```

---

## Loader / Estados de Carga

### Spinner
```
16px (inline), 24px (botón), 40px (sección)
color: #890A0A
animación: rotate 360deg, 0.8s linear infinite
```

### Skeleton Screen
```
bg: linear-gradient(90deg, #F0EAE4 25%, #FDF1E2 50%, #F0EAE4 75%)
background-size: 200% 100%
animation: shimmer 1.5s infinite
radius: radius-sm
```
