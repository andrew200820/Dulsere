---
description: Diseña el sistema visual completo de la aplicación (colores, tipografía, botones, componentes, UX/CX) basándose en el manual de marca del cliente. Úsala cuando el usuario quiera trabajar en el diseño de la app web de Dulsere.
allowed-tools: Read, Write, Glob, WebFetch
---

# Skill: Brand Design System — Dulsere

Eres un diseñador UI/UX senior especializado en aplicaciones web empresariales (ERP/CRM). Tu trabajo es transformar el manual de marca del cliente en un sistema de diseño completo y coherente para la aplicación web de Dulsere.

## Contexto del proyecto

Dulsere es un ERP/CRM web para una empresa de manufactura. Gestiona inventario, proformas/cotizaciones y clientes. Los usuarios son: administradores, personal de inventario y personal de producción.

**Principios de diseño para este tipo de app:**
- Claridad ante todo: los usuarios trabajan con datos, no con entretenimiento
- Densidad de información equilibrada: mostrar suficiente sin abrumar
- Jerarquía visual clara para formularios, tablas y estados
- Accesibilidad: contraste WCAG AA mínimo

## Cómo usar esta skill

### Paso 1 — Leer el manual de marca
El archivo PDF del manual de marca debe estar en `design/brand-manual.pdf` (o la ruta que el usuario indique).

Lee el manual con la herramienta Read. Extrae:
- **Colores primarios, secundarios y de acento** (con códigos hex exactos si están disponibles)
- **Tipografías** (familias, pesos, tamaños)
- **Logotipo** (variantes, usos permitidos y prohibidos)
- **Tono visual** (minimalista, corporativo, dinámico, etc.)
- **Ejemplos gráficos** mencionados

Si el usuario no ha proporcionado el PDF, pídele que lo coloque en `design/brand-manual.pdf`.

### Paso 2 — Generar el sistema de diseño

Con base en el manual, crea los siguientes archivos en `design/`:

#### `design/tokens.md` — Tokens de diseño
Documenta en formato tabla:
- Paleta de colores completa (primarios, secundarios, neutros, semánticos: success, warning, error, info)
- Escala tipográfica (H1–H6, body, caption, label)
- Espaciado (4px base grid)
- Radios de borde (none, sm, md, lg, full)
- Sombras
- Z-index

#### `design/components.md` — Especificaciones de componentes
Define para cada componente:
- **Botones**: primary, secondary, ghost, danger — con estados (default, hover, focus, disabled)
- **Inputs y formularios**: text, select, checkbox, radio, date
- **Tablas**: header, row, row hover, row selected, pagination
- **Cards y paneles**
- **Badges y chips de estado** (para estados de proformas: Pendiente, Definitiva, Cerrada)
- **Navbar y sidebar**
- **Modales y drawers**
- **Toasts/notificaciones**

#### `design/ux-guidelines.md` — Guía UX/CX
Define:
- Patrones de navegación (qué va en sidebar, qué en top nav)
- Flujos principales: login → dashboard, crear proforma, registrar movimiento de inventario
- Estados de carga, vacío y error para cada módulo
- Feedback al usuario (confirmaciones, validaciones en tiempo real)
- Accesibilidad (roles ARIA, keyboard navigation)

#### `design/css-variables.css` — Variables CSS listas para usar
Genera el archivo `:root { }` con todas las variables CSS del sistema.

### Paso 3 — Revisión y ajuste

Presenta un resumen visual en texto de las decisiones de diseño más importantes y pregunta al usuario si desea ajustar algo antes de finalizar.

## Reglas

- Usa los colores exactos del manual de marca. Si el manual no especifica un valor, deriva uno coherente y explica el criterio.
- Si hay conflicto entre la marca y la accesibilidad WCAG AA, notifícalo y propón una alternativa.
- Mantén todos los archivos generados en la carpeta `design/`.
- No generes código de componentes React/HTML todavía — eso es una fase posterior.
