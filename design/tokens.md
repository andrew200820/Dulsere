# Design Tokens — Dulseré ERP

Extraído del Manual de Marca 2026. Adaptado para interfaz web ERP.

---

## Colores de Marca

| Token | Hex | Uso |
|-------|-----|-----|
| `brand-crimson` | `#890A0A` | Color principal de marca — logo, acciones primarias |
| `brand-black` | `#000000` | Texto principal, bordes fuertes |
| `brand-cream` | `#FDF1E2` | Fondo principal de la aplicación |
| `brand-peach` | `#FFDCB1` | Fondo secundario, hover suave, secciones diferenciadas |

---

## Paleta Completa de UI

### Primario — Vino Dulseré
| Token | Hex | Uso |
|-------|-----|-----|
| `primary-950` | `#3D0404` | Textos sobre fondo blanco muy oscuro |
| `primary-900` | `#5C0606` | Hover de botones primarios |
| `primary-800` | `#890A0A` | **Color base de marca** — botones, sidebar activo |
| `primary-700` | `#A01010` | Variante ligeramente más clara |
| `primary-600` | `#B91C1C` | Estados focus, outline |
| `primary-100` | `#FEE2E2` | Fondos de alertas leves en tono primario |
| `primary-50`  | `#FFF5F5` | Fondos de filas seleccionadas |

### Neutros Cálidos (alineados con la paleta crema de la marca)
| Token | Hex | Uso |
|-------|-----|-----|
| `neutral-50`  | `#FAF7F4` | Fondo alternativo de tablas |
| `neutral-100` | `#F0EAE4` | Bordes suaves, separadores |
| `neutral-200` | `#E0D6CE` | Bordes de inputs, cards |
| `neutral-300` | `#C8BDB5` | Placeholder text |
| `neutral-400` | `#A89890` | Iconos inactivos |
| `neutral-500` | `#887870` | Texto secundario / labels |
| `neutral-600` | `#685850` | Texto de apoyo |
| `neutral-700` | `#4A3830` | Texto de tablas |
| `neutral-800` | `#2E201A` | Texto de cuerpo principal |
| `neutral-900` | `#181008` | Headings |

### Semánticos

#### Success — Verde Salvia
| Token | Hex |
|-------|-----|
| `success-700` | `#1D5C3A` |
| `success-600` | `#2D7A4F` |
| `success-500` | `#3A9E65` |
| `success-100` | `#D4EDDA` |
| `success-50`  | `#EDFAF3` |

#### Warning — Ámbar Cálido
| Token | Hex |
|-------|-----|
| `warning-700` | `#92400E` |
| `warning-600` | `#B5621A` |
| `warning-500` | `#D97706` |
| `warning-100` | `#FDE8D0` |
| `warning-50`  | `#FFF8EE` |

#### Error — Rojo Alerta
| Token | Hex |
|-------|-----|
| `error-700` | `#991B1B` |
| `error-600` | `#DC2626` |
| `error-500` | `#EF4444` |
| `error-100` | `#FDDEDE` |
| `error-50`  | `#FFF5F5` |

#### Info — Azul Profundo
| Token | Hex |
|-------|-----|
| `info-700` | `#1E3A5F` |
| `info-600` | `#1A5C8A` |
| `info-500` | `#2580C4` |
| `info-100` | `#D0E8F5` |
| `info-50`  | `#EEF6FC` |

### Estados de Proformas
| Estado | Color | Hex |
|--------|-------|-----|
| Pendiente | Warning ámbar | `#B5621A` / bg `#FDE8D0` |
| Definitiva | Info azul | `#1A5C8A` / bg `#D0E8F5` |
| Cerrada | Success verde | `#2D7A4F` / bg `#D4EDDA` |

---

## Tipografía

### Familias
| Rol | Fuente | Uso |
|-----|--------|-----|
| Display / Branding | **Hello Paris** | Logo, título de página de login, páginas públicas |
| UI / Cuerpo | **Codec Pro** | Todo el resto de la interfaz — labels, tablas, formularios, navegación |
| Fallback sans | system-ui, sans-serif | Fallback si Codec Pro no carga |

> **Nota:** Hello Paris NO se usa en tablas, formularios ni navegación interna del ERP — solo en pantallas de cara al cliente o branding.

### Escala Tipográfica (base 16px)

| Token | Tamaño | Line Height | Peso | Uso |
|-------|--------|-------------|------|-----|
| `text-xs` | 11px | 1.4 | 400 | Captions, metadatos de tabla |
| `text-sm` | 13px | 1.4 | 400 | Labels, helper text |
| `text-base` | 15px | 1.5 | 400 | Cuerpo de texto, celdas de tabla |
| `text-md` | 16px | 1.5 | 500 | Labels de formulario |
| `text-lg` | 18px | 1.4 | 600 | Subtítulos de sección |
| `text-xl` | 22px | 1.3 | 600 | Títulos de página (H2) |
| `text-2xl` | 28px | 1.2 | 700 | Título de módulo (H1) |
| `text-display` | 36px+ | 1.1 | 400 | Solo pantalla login / public (Hello Paris) |

---

## Espaciado (base 4px)

| Token | Valor | Uso típico |
|-------|-------|------------|
| `space-1` | 4px | Gap entre icon y label |
| `space-2` | 8px | Padding interno chips, badges |
| `space-3` | 12px | Gap entre form fields |
| `space-4` | 16px | Padding de cards pequeñas, padding de celdas |
| `space-5` | 20px | Padding de inputs |
| `space-6` | 24px | Padding interno de secciones |
| `space-8` | 32px | Gap entre secciones |
| `space-10` | 40px | Padding lateral del contenido principal |
| `space-12` | 48px | Altura del top navbar |
| `space-16` | 64px | Separación entre bloques de página |

---

## Radios de Borde

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-none` | 0px | Tablas, filas |
| `radius-sm` | 4px | Inputs, selects, badges pequeños |
| `radius-md` | 6px | Botones, dropdowns |
| `radius-lg` | 10px | Cards, modales, paneles |
| `radius-xl` | 16px | Drawers, paneles laterales |
| `radius-full` | 9999px | Chips de estado, avatares, pills |

---

## Sombras

| Token | Valor CSS | Uso |
|-------|-----------|-----|
| `shadow-xs` | `0 1px 2px rgba(137,10,10,0.06)` | Inputs en focus |
| `shadow-sm` | `0 1px 4px rgba(0,0,0,0.08)` | Cards en reposo |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Cards en hover, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modales |
| `shadow-xl` | `0 16px 40px rgba(0,0,0,0.15)` | Drawers laterales |

---

## Z-Index

| Token | Valor | Uso |
|-------|-------|-----|
| `z-base` | 0 | Contenido normal |
| `z-raised` | 10 | Cards en hover |
| `z-dropdown` | 100 | Menús desplegables |
| `z-sticky` | 200 | Top navbar, sidebar |
| `z-modal-backdrop` | 400 | Fondo oscuro de modal |
| `z-modal` | 500 | Modales |
| `z-toast` | 600 | Notificaciones toast |
| `z-tooltip` | 700 | Tooltips |

---

## Breakpoints

| Token | Valor | Descripción |
|-------|-------|-------------|
| `screen-sm` | 640px | Móvil grande |
| `screen-md` | 768px | Tablet |
| `screen-lg` | 1024px | Desktop pequeño |
| `screen-xl` | 1280px | Desktop estándar |
| `screen-2xl` | 1536px | Desktop grande |

> El ERP está optimizado principalmente para `lg` y `xl`. Soporte móvil es secundario pero no descartado.
