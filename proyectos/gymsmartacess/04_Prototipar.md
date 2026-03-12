# Fase 4: PROTOTIPAR — Diseñando la Experiencia

> **Objetivo:** Construir representaciones rápidas y económicas de las soluciones para aprender, fallar y mejorar antes de escribir código de producción.

---

## Principios de Diseño de GymAccess

Antes de prototipar cualquier pantalla, definimos nuestros principios guía:

1. **Pasivo primero:** El sistema actúa solo. El usuario no debe tomar decisiones bajo presión.
2. **Claridad extrema:** Verde/Rojo. Pasa/No pasa. Sin ambigüedad.
3. **Mobile-first:** El 95% de las interacciones son desde el celular.
4. **Fricción cero para el socio:** Si no puede entrar al gym en < 5 segundos, fallamos.
5. **Confianza visual:** El sistema debe verse tan profesional como el de las grandes cadenas.

---

## 🎨 Sistema de Diseño (Design Tokens)

### Paleta de Colores Base

| Token | Valor HSL | Uso |
|---|---|---|
| `--primary` | `262 83% 58%` | Violeta índigo — botones, links, brand |
| `--primary-dark` | `262 83% 45%` | Hover states |
| `--success` | `142 70% 45%` | Estado ACTIVO, VERDE de acceso |
| `--danger` | `0 84% 60%` | Estado MOROSO, ROJO de acceso |
| `--warning` | `38 92% 50%` | Alertas, próximo a vencer |
| `--background` | `222 47% 8%` | Fondo oscuro principal |
| `--surface` | `222 47% 13%` | Cards, paneles |
| `--surface-2` | `222 47% 18%` | Cards elevadas |
| `--text-primary` | `0 0% 98%` | Texto principal |
| `--text-muted` | `215 20% 60%` | Texto secundario |
| `--border` | `217 33% 20%` | Bordes sutiles |

### Tipografía

| Token | Fuente | Peso | Tamaño | Uso |
|---|---|---|---|---|
| Display | Inter | 800 | 3.5rem | Hero, estados grandes (VERDE/ROJO) |
| Heading 1 | Inter | 700 | 2rem | Títulos de sección |
| Heading 2 | Inter | 600 | 1.5rem | Subtítulos |
| Body | Inter | 400 | 1rem | Texto corriente |
| Caption | Inter | 400 | 0.875rem | Metadata, fechas |
| Mono | JetBrains Mono | 400 | 0.875rem | Datos técnicos (IDs, fechas) |

### Espaciado y Radios

- **Espaciado base:** 4px (0.25rem)
- **Radio de borde (card):** 12px
- **Radio de borde (botón):** 8px
- **Radio de borde (badge):** 999px (pill)
- **Sombra de card:** `0 4px 24px rgba(0,0,0,0.3)`

---

## 📱 Wireframes — Low Fidelity

### PWA del Socio — Pantalla Home

```
┌──────────────────────────────┐
│  🏋️ MEGA FIT (logo/color gym)│
│                              │
│  ┌──────────────────────┐    │
│  │   [FOTO DEL SOCIO]   │    │
│  │       🟢             │    │
│  │   Lucas Martínez     │    │
│  │   Estado: ACTIVO     │    │
│  │   Próximo pago: 22/4 │    │
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │   📷 ESCANEAR QR     │    │
│  │   (Botón primario)   │    │
│  └──────────────────────┘    │
│                              │
│  Últimos accesos:            │
│  ✅ Hoy 18:32               │
│  ✅ Ayer 07:15               │
│  ✅ Lun 19:00                │
│                              │
│  [Home] [Historia] [Perfil]  │
└──────────────────────────────┘
```

### PWA del Socio — Pantalla de Escaneo (Check-in activo)

```
┌──────────────────────────────┐
│  ← Atrás                    │
│                              │
│  Apuntá tu cámara al QR     │
│  en la entrada del gym       │
│                              │
│  ┌──────────────────────┐    │
│  │                      │    │
│  │   [VISOR DE CÁMARA]  │    │
│  │   [    QR TARGET    ]│    │
│  │                      │    │
│  └──────────────────────┘    │
│                              │
│  💡 El QR está pegado en la  │
│     puerta de entrada        │
│                              │
└──────────────────────────────┘
     ↓ Al escanear correctamente
┌──────────────────────────────┐
│                              │
│                              │
│          ✅ VERDE             │
│                              │
│      ¡Bienvenido, Lucas!     │
│                              │
│    Acceso registrado         │
│    Sábado 7 Mar, 18:33       │
│                              │
│                              │
└──────────────────────────────┘
```

### Monitor del Recepcionista — Estado idle (sin escaneos)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   🏋️ MEGA FIT                    Sáb 07/03 · 18:30:15     │
│                                                            │
│   ┌────────────────────────────────────────────────────┐   │
│   │                                                    │   │
│   │                                                    │   │
│   │              👋 Esperando el próximo               │   │
│   │                  escaneo...                        │   │
│   │                                                    │   │
│   │                                                    │   │
│   └────────────────────────────────────────────────────┘   │
│                                                            │
│   Accesos hoy: 47    Pendientes de pago: 3                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Monitor del Recepcionista — ACCESO PERMITIDO (Verde)

```
┌────────────────────────────────────────────────────────────┐
│                   ╔══════════════╗                         │
│  🟢 PASA          ║              ║   Lucas Martínez        │
│                   ║  [  FOTO  ]  ║                         │
│                   ║   GRANDE     ║   Plan: Mensual         │
│                   ║              ║   Al día ✅              │
│                   ╚══════════════╝   Vence: 22 Abr         │
│                                                            │
│   ████████████████████████████████████████ VERDE ████████  │
│                                                            │
│   Accesos este mes: 12         Última visita: Ayer 07:15   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Monitor del Recepcionista — ACCESO DENEGADO (Rojo)

```
┌────────────────────────────────────────────────────────────┐
│                   ╔══════════════╗                         │
│  🔴 NO PASA       ║              ║   Carlos Rodríguez      │
│                   ║  [  FOTO  ]  ║                         │
│                   ║   GRANDE     ║   Plan: Mensual         │
│                   ║              ║   EN MORA ❌             │
│                   ╚══════════════╝   Venció: 01 Mar        │
│                                                            │
│   ████████████████████████████████████████  ROJO  ████████  │
│                                                            │
│   Debe desde: 01/03            Monto: $15.000              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Panel del Dueño — Dashboard Principal

```
┌────────────────────────────────────────────────────────────┐
│  🏋️ MEGA FIT · Dashboard              Roberto [Salir]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Ingresos │ │ Socios   │ │ Check-ins│ │ Morosos  │      │
│  │ del mes  │ │ Activos  │ │   hoy    │ │          │      │
│  │ $450.000 │ │   187    │ │   47     │ │    8     │      │
│  │  ▲ 12%  │ │  ▲ 5     │ │          │ │  ▼ 3     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                            │
│  ┌──────────────────────────────────────┐                  │
│  │  Ingresos últimos 6 meses            │                  │
│  │        (Gráfico de barras)           │                  │
│  │  Oct Nov Dic Ene Feb Mar             │                  │
│  └──────────────────────────────────────┘                  │
│                                                            │
│  Socios en mora (8)          [Enviar recordatorio masivo]  │
│  ├─ Carlos R. · Vence 01/03  [Enviar link de pago]        │
│  ├─ Ana P. · Vence 28/02     [Enviar link de pago]        │
│  └─ ...                                                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Especificaciones de Componentes (shadcn/ui)

### Componentes a usar por pantalla

| Pantalla | Componentes shadcn |
|---|---|
| Login | `Card`, `Input`, `Button`, `Form` |
| Monitor Recepcionista | Custom full-screen (NO shadcn — diseño propio) |
| Dashboard Dueño | `Card`, `Badge`, `Table`, `Chart` (recharts) |
| Socios — Lista | `DataTable` con `ColumnDef`, `Badge`, `Avatar` |
| Socio — Perfil | `Card`, `Avatar`, `Badge`, `Tabs`, `Separator` |
| Planes | `Card`, `Badge`, `Dialog`, `Form` |
| Branding | `Card`, `Input` (color picker), `Avatar` (logo upload) |
| PWA Home | Custom cards con glassmorphism |
| PWA Escáner | Custom (cámara + overlay) |

---

## 🎨 Guía de Identidad Visual

### El Monitor del Recepcionista — Diseño Especial

Esta pantalla es el MVP visual más importante. Debe ser **legible a 3 metros de distancia** y **operable sin tocar la pantalla**.

- **Fondo:** Negro o verde/rojo según estado (full-screen color).
- **Foto:** Mínimo 400x400px, usando `next/image` para optimización y blur placeholder.
- **Nombre:** Fuente Display, mínimo 3.5rem (56px).
- **Estado:** Texto enorme: "PASA" o "NO PASA".
- **Sonido:** Audio cargado localmente (Ding para verde, Buzzer para rojo). No depende de internet.
- **Auto-reset:** Después de 5 segundos, vuelve a pantalla idle automáticamente.

### La PWA del Socio — Glassmorphism

Para dar sensación premium en el contexto de marca blanca:

- **Card de estado:** `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(12px)`.
- **Border:** `1px solid rgba(255,255,255,0.1)`.
- **Sombra:** `box-shadow: 0 8px 32px rgba(0,0,0,0.37)`.
- El color primario del gym se inyecta dinámicamente via CSS custom property `--gym-primary`.

---

## 📱 Responsive Strategy

| Breakpoint | Dispositivo | Notas |
|---|---|---|
| < 640px | Mobile (PWA del Socio) | Diseño principal |
| 640-1024px | Tablet | Panel del dueño (secundario) |
| > 1024px | Desktop | Dashboard del dueño + Monitor recepcionista |
| Full-screen | TV/Monitor | Monitor del recepcionista (Chromecast o cable) |

El **Monitor del Recepcionista** debe funcionar en una tablet o TV vieja en modo landscape. Debe sobrevivir sin reiniciarse horas seguidas.

---

> [!IMPORTANT]
> La pantalla del recepcionista no debe tener scroll, menús ni botones que pueda presionar accidentalmente. Es una pantalla de solo lectura. Si hay un toque accidental, no debe pasar nada.
