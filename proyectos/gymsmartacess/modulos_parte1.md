# GymAccess — Documentación de Módulos (`app/src`) — Parte 1

> **Stack:** Next.js 16 (App Router) · TypeScript · Supabase · Mercado Pago · TailwindCSS · shadcn/ui

---

## 1. Middleware y Enrutamiento (`src/middleware.ts`)

### Descripción
El middleware es el cerebro del enrutamiento. Se ejecuta en el Edge en cada request y cumple **dos responsabilidades críticas**:
1. **Enrutamiento White-label por subdominio:** Si el request viene de `mega-fit.gymaccess.com`, lo reescribe transparentemente a `/gym/mega-fit/...` sin cambiar la URL del navegador.
2. **Autenticación y RBAC:** Valida la sesión de Supabase y redirige a `/login` si no autenticado. Luego chequea el rol y protege las rutas.

### Flujo de Ejecución
```
Request → Refresh sesión Supabase → ¿Es subdominio? → Rewrite a /gym/[slug]
                                  ↓ No
                     ¿Es ruta pública? → Pasar
                                  ↓ No
                     ¿Tiene sesión? → No → Redirect /login
                                  ↓ Sí
                     role=member? → Sólo /app
                                  ↓ No
                     canAccess(role, pathname) → Permitido / Redirect /unauthorized
```

### Detalles Técnicos
- **Detección ngrok:** Para desarrollo local, usa `?gym=slug` como alternativa a subdominios dinámicos.
- **Service Role para RBAC:** Hace una segunda query con el service role key a `profiles` para determinar el rol del staff.
- **Rutas del sistema excluidas del rewrite:** `/api`, `/dashboard`, `/app`, `/reception`, `/access`, `/login`, etc.

---

## 📝 Lovable Prompt — Módulo 1: Middleware & Routing

```
Crea el archivo middleware.ts para una app Next.js 16 (App Router) de un SaaS de gimnasios llamado GymAccess.

El middleware debe implementar DOS funcionalidades:

1. ENRUTAMIENTO WHITE-LABEL POR SUBDOMINIO:
   - Detectar si el request viene de un subdominio (ej: mega-fit.gymaccess.com).
   - Reescribir transparentemente la URL a /gym/[slug]/[ruta] manteniendo el subdominio en el navegador.
   - En desarrollo local con localhost, detectar multi-level domain (ej: mega-fit.localhost:3000).
   - Excluir rutas del sistema del rewrite: /api, /dashboard, /app, /reception, /access, /login, /register, /auth, /_next, /favicon.ico.

2. AUTENTICACIÓN Y RBAC:
   - Refrescar sesión de Supabase con @supabase/ssr en cada request.
   - Rutas públicas: /, /login, /register, /forgot-password, /auth, /api, /gym, /access, /bienvenido, /reset-password.
   - Si no autenticado en ruta protegida → redirect a /login.
   - Si role=member (en app_metadata) → sólo puede ir a /app, sino redirect /unauthorized.
   - Para otros roles (gym_owner, receptionist) → consultar tabla profiles y validar acceso.

ROLES Y RUTAS:
- saas_admin: todo
- gym_owner: /dashboard, /reception
- receptionist: /reception
- member: /app

IMPORTANTE: Usar createServerClient de @supabase/ssr. El middleware debe retornar siempre la respuesta con las cookies de Supabase actualizadas. Usar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY del .env.
```

---

## 2. RBAC — Control de Acceso por Rol (`src/lib/supabase/rbac.ts`)

### Descripción
Módulo que define la matriz de permisos del sistema y expone `canAccess(role, pathname)`.

### Matriz de Roles
| Rol | Rutas Permitidas |
|---|---|
| `saas_admin` | `/*` (todo) |
| `gym_owner` | `/dashboard`, `/reception` |
| `receptionist` | `/reception` |
| `member` | `/app` |

---

## 📝 Lovable Prompt — Módulo 2: RBAC

```
Crea el módulo de RBAC (Role-Based Access Control) para GymAccess en TypeScript.

ARCHIVO: src/lib/supabase/rbac.ts

TIPOS:
type UserRole = 'saas_admin' | 'gym_owner' | 'receptionist' | 'member'

MATRIZ DE PERMISOS:
- saas_admin: acceso a todo ('/*')
- gym_owner: acceso a /dashboard y /reception
- receptionist: acceso solo a /reception
- member: acceso solo a /app

FUNCIÓN PRINCIPAL:
export function canAccess(role: UserRole | null | undefined, pathname: string): boolean
- Si role es null/undefined → false
- Si allowedPrefixes incluye '/*' → true
- Sino: verificar si pathname.startsWith() con algún prefix permitido

El módulo debe ser puro (sin side effects ni imports de runtime).
```

---

## 3. Tipos del Sistema (`src/lib/supabase/types.ts`)

### Descripción
Define todos los tipos TypeScript que modelan las entidades del dominio.

### Tipos Clave
| Tipo | Valores |
|---|---|
| `MemberStatus` | `'pending' \| 'active' \| 'overdue' \| 'suspended'` |
| `SaasStatus` | `'trial' \| 'active' \| 'suspended'` |
| `SubscriptionStatus` | `'authorized' \| 'paused' \| 'cancelled'` |
| `CheckinStatus` | `'allowed' \| 'denied'` |
| `DenialReason` | `'overdue' \| 'suspended' \| 'pending' \| 'unknown' \| 'wrong_gym' \| null` |

### Interfaces del Dominio
- **`Gym`**: `id, name, slug, owner_id, saas_status, trial_ends_at` + campos MP (`mp_access_token`, `mp_user_id`)
- **`Plan`**: `id, gym_id, name, price, duration_days, trial_days, mp_plan_id, is_active`
- **`Member`**: `id, gym_id, user_id, full_name, email, status` + relaciones `plan`, `subscription`
- **`Subscription`**: `id, member_id, mp_preapproval_id, status, next_billing_date`
- **`CheckIn`**: `id, member_id, gym_id, status, denial_reason, scanned_at`
- **`RealtimeCheckinPayload`**: Payload del canal Supabase Realtime para el monitor de recepción

---

## 📝 Lovable Prompt — Módulo 3: Tipos del Sistema

```
Crea el archivo de tipos TypeScript central de GymAccess.

ARCHIVO: src/lib/supabase/types.ts

Define los siguientes tipos y interfaces para el dominio:

TIPOS ESCALARES:
type UserRole = 'saas_admin' | 'gym_owner' | 'receptionist' | 'member'
type MemberStatus = 'pending' | 'active' | 'overdue' | 'suspended'
type SaasStatus = 'trial' | 'active' | 'suspended'
type SubscriptionStatus = 'authorized' | 'paused' | 'cancelled'
type CheckinStatus = 'allowed' | 'denied'
type DenialReason = 'overdue' | 'suspended' | 'pending' | 'unknown' | 'wrong_gym' | null

INTERFACES:
- UserProfile: id, role, gym_id, full_name, avatar_url, created_at
- Gym: id, name, slug, logo_url, primary_color, owner_id, saas_status, trial_ends_at, mp_access_token, mp_refresh_token, mp_user_id, mp_connected_at, created_at
- Plan: id, gym_id, name, price, duration_days, trial_days, mp_plan_id, is_active, created_at
- Member: id, gym_id, user_id, full_name, email, phone, photo_url, dni, plan_id, status, joined_at (+ optional: plan, subscription)
- Subscription: id, member_id, plan_id, mp_preapproval_id, mp_init_point, status, next_billing_date, created_at
- CheckIn: id, member_id, gym_id, status: CheckinStatus, denial_reason: DenialReason, scanned_at (+ optional member join)
- RealtimeCheckinPayload: { member: {id, name, photo_url, plan_name?}, status, denial_reason, scanned_at }

Solo tipos, sin lógica. Exportar todo.
```

---

## 4. Clientes Supabase (`src/lib/supabase/`)

### Descripción
Tres clientes distintos para diferentes contextos de ejecución.

| Archivo | Contexto | Usa |
|---|---|---|
| `client.ts` | Browser / componentes `'use client'` | `createBrowserClient` |
| `server.ts` | Server Components / Actions | `createServerClient` + cookies |
| `service.ts` | Server Actions administrativas | `createServerClient` + `SERVICE_ROLE_KEY` (bypasea RLS) |

---

## 📝 Lovable Prompt — Módulo 4: Clientes Supabase

```
Crea los tres clientes de Supabase para Next.js 16 App Router usando @supabase/ssr.

ARCHIVO 1 — src/lib/supabase/client.ts (browser):
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

ARCHIVO 2 — src/lib/supabase/server.ts (server, lee cookies del request):
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
Debe usar await cookies() y pasar getAll/setAll para el manejo correcto de cookies de sesión.

ARCHIVO 3 — src/lib/supabase/service.ts (service role, bypasea RLS):
Usa SUPABASE_SERVICE_ROLE_KEY. Cookies vacías (getAll: () => [], setAll: () => {}). 
Para uso exclusivo en server-side code de confianza (nunca exponer al cliente).

Variables de entorno necesarias:
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

---

## 5. Auth — Server Actions (`src/lib/supabase/actions.ts`)

### Descripción
Todas las acciones de autenticación como Server Actions de Next.js.

### Acciones
| Acción | Descripción |
|---|---|
| `signInAction(formData)` | Login. Redirige según rol: member→`/app`, receptionist→`/reception`, resto→`/dashboard` |
| `signUpAction(formData)` | Registro de nuevo gym en 3 pasos: create auth user → create gym con 30 días trial → link profile |
| `signOutAction()` | Cierra sesión y redirige a `/login` |
| `getProfileAction()` | Obtiene el perfil del usuario actual |
| `forgotPasswordAction(formData)` | Envía email de recuperación |
| `resetPasswordAction(formData)` | Actualiza la contraseña |

---

## 📝 Lovable Prompt — Módulo 5: Auth Server Actions

```
Crea las Server Actions de autenticación para GymAccess usando Next.js 16 App Router y Supabase.

ARCHIVO: src/lib/supabase/actions.ts (directiva 'use server' al inicio)

ACCIÓN 1 — signInAction(prevState, formData):
- Login con email/password usando supabase.auth.signInWithPassword
- Si error → return { error: error.message }
- Si role en app_metadata === 'member' → redirect('/app')
- Si profiles.role === 'receptionist' → redirect('/reception')
- Default → redirect('/dashboard')

ACCIÓN 2 — signUpAction(prevState, formData):
Campos: email, password, fullName, gymName, slug
1. supabase.auth.signUp({ email, password, options: { data: { full_name } } })
2. Con service role: INSERT gyms { name, slug, owner_id, trial_ends_at: now + 30 días }
3. Con service role: UPDATE profiles SET gym_id, full_name WHERE id = user.id
4. redirect('/dashboard')

ACCIÓN 3 — signOutAction():
supabase.auth.signOut() + redirect('/login')

ACCIÓN 4 — getProfileAction():
Obtener user de auth, luego SELECT * FROM profiles WHERE id = user.id

ACCIÓN 5 — forgotPasswordAction(prevState, formData):
supabase.auth.resetPasswordForEmail(email, { redirectTo: APP_URL + '/api/auth/callback?next=/reset-password' })

ACCIÓN 6 — resetPasswordAction(prevState, formData):
Verificar que password === confirmPassword, luego supabase.auth.updateUser({ password })
```

---

## 6. Página de Login (`src/app/(auth)/login/page.tsx`)

### Descripción
Página de login con email/password. Client Component con `useActionState` conectado al `signInAction`.

### Características
- **Manejo de OTP expirado:** Detecta `#type=invite&error_code=otp_expired` en el hash de la URL y muestra formulario para reenviar link.
- **Soporte `?next`:** Tras login redirige a la URL indicada en `?next=` (para flujo de escaneo de QR sin sesión).
- **Show/hide password:** Botón de ojo.
- **Estados del formulario:** Loading, errores inline, submit con spinner.

---

## 📝 Lovable Prompt — Módulo 6: Página de Login

```
Crea la página de login para GymAccess (SaaS para gimnasios de LATAM).

RUTA: /login
ARCHIVO: src/app/(auth)/login/page.tsx (Client Component — 'use client')

DISEÑO:
- Pantalla centrada verticalmente, fondo oscuro con gradiente/glow violeta sutil
- Tarjeta glassmorphism (max-w-sm) con:
  - H1: "Bienvenido de vuelta"
  - Subtítulo: "Ingresá a tu cuenta GymAccess"
  - Campo Email (autocomplete="email")
  - Campo Contraseña con toggle show/hide (ícono Eye/EyeOff de Lucide)
  - Link "¿Olvidaste tu contraseña?" a /forgot-password
  - Botón "Ingresar" con gradiente violeta, estado loading con spinner (Loader2)
  - Error inline si credentials inválidas
  - Divider + link "¿No tenés cuenta? Probá gratis 30 días" → /register

FUNCIONALIDAD:
- Usar useActionState de React 19 conectado al server action signInAction
- isPending del useActionState controla el botón de loading

CASO ESPECIAL — OTP EXPIRADO:
- Al montar, leer window.location.hash
- Si hash contiene type=invite y error_code=otp_expired:
  - Mostrar banner amarillo "El link de acceso expiró"
  - Formulario inline para re-enviar link (campo email + botón Reenviar)
  - Estados: idle/sending/sent

STACK: React + TypeScript + shadcn/ui (Button, Input, Label) + Lucide icons.
COLORES: bg-[hsl(222,47%,5%)], tarjeta: bg-white/5 border border-white/10, acento: violeta #7c3aed.
```

---

## 7. Dashboard — Layout (`src/app/dashboard/layout.tsx`)

### Descripción
Layout compartido para todas las páginas del dashboard. Sidebar fijo de 256px + main content scrollable.

### Estructura del Sidebar
- **Logo** GymAccess con ícono Zap
- **Nav principal:** Dashboard, Socios, Planes, Control de acceso
- **Configuración:** Marca, Pagos
- **Link externo:** Monitor de recepción (`/reception`, nueva pestaña)
- **Footer del sidebar:** Avatar del usuario, nombre, rol, botón logout

### Top Bar
Sticky con: fecha actual en español + badge de estado del trial ("Trial activo · N días restantes").

---

## 📝 Lovable Prompt — Módulo 7: Dashboard Layout

```
Crea el layout del dashboard de administración para GymAccess.

RUTA: /dashboard/* (layout compartido)
ARCHIVO: src/app/dashboard/layout.tsx (Server Component)

ESTRUCTURA DE LA PÁGINA:
- flex h-screen overflow-hidden
- SIDEBAR (w-64, fijo, bg-[hsl(222,47%,10%)], border-r border-white/5)
- MAIN CONTENT (flex-1, overflow-y-auto)

SIDEBAR — de arriba hacia abajo:
1. Logo: ícono Zap en div gradiente violeta + "GymAccess" bold + subtitle "Gestión"
2. Nav principal (4 ítems): 
   - /dashboard → LayoutDashboard icon → "Dashboard"
   - /dashboard/members → Users icon → "Socios"  
   - /dashboard/plans → CreditCard icon → "Planes"
   - /dashboard/access → QrCode icon → "Control de acceso"
3. Sección "CONFIGURACIÓN":
   - /dashboard/settings/branding → Zap → "Marca"
   - /dashboard/settings/payment → BarChart3 → "Pagos"
4. Link especial: /reception (target="_blank") → Monitor icon → "Abrir monitor de recepción" (color esmeralda)
5. Footer: avatar circular con inicial + nombre + rol + botón "Cerrar sesión"

ESTILOS DE NAV: text-white/60 hover:text-white hover:bg-white/5 rounded-lg px-3 py-2.5.

MAIN CONTENT:
- Top bar sticky: fecha en español (es-AR, formato largo) | badge "Trial activo · 23 días restantes" (verde)
- Contenido: p-8 {children}

SERVER COMPONENT: Usar getProfileAction() para obtener nombre y rol del usuario logueado.
STACK: Next.js + TypeScript + shadcn/ui (Button, Separator) + Lucide icons.
```

---

## 8. Dashboard — KPIs y Home (`src/app/dashboard/page.tsx`)

### Descripción
Página principal del dashboard. Muestra los 4 KPIs principales y dos tablas: socios en mora y últimos check-ins.

### KPIs
| Métrica | Color | Ícono |
|---|---|---|
| Ingresos del mes | Esmeralda | TrendingUp |
| Socios activos | Violeta | Users |
| Check-ins hoy | Azul | Scan |
| En mora | Ámbar | AlertCircle |

### Secciones Secundarias
- **Socios en mora:** Lista con avatar inicial, nombre, plan, fecha vencimiento, monto. Botón "Enviar recordatorio masivo".
- **Últimos check-ins:** Feed con punto verde/rojo, nombre, hora, badge "Permitido/Denegado".

---

## 📝 Lovable Prompt — Módulo 8: Dashboard Home KPIs

```
Crea la página principal (home) del dashboard de GymAccess con KPIs y actividad reciente.

RUTA: /dashboard
ARCHIVO: src/app/dashboard/page.tsx (Server Component)

SECCIÓN 1 — KPI CARDS (grid 2x2 en mobile, 4 en desktop):
Cada tarjeta tiene: ícono en cuadro de color, valor principal grande (text-2xl font-bold), label, indicador de cambio.

4 KPIs:
1. "Ingresos del mes" → $450.000 → +12% (verde esmeralda) → ícono TrendingUp
2. "Socios activos" → 187 → +5 este mes (violeta) → ícono Users
3. "Check-ins hoy" → 47 → de 187 socios (azul) → ícono Scan
4. "En mora" → 8 → -3 vs mes pasado (ámbar) → ícono AlertCircle

ESTILO DE TARJETAS: bg-[hsl(222,47%,13%)] border-white/5 hover:border-white/10 rounded-xl p-5

SECCIÓN 2 — DOS COLUMNAS (en desktop):

COLUMNA IZQUIERDA — "Socios en mora":
- Header: título + badge ámbar con cantidad
- Lista de morosos: avatar circular con inicial (bg ámbar), nombre + plan/fecha, monto en ámbar
- Hover: bg-white/[0.05] con ChevronRight
- Botón: "Enviar recordatorio masivo" fullwidth

COLUMNA DERECHA — "Últimos check-ins":
- Header: título + "En tiempo real"
- Lista: punto verde/rojo + nombre + hora + badge "Permitido"/"Denegado"
- Badge esmeralda para allowed, rojo para denied
- Botón: "Ver historial completo"

DATOS: Usar datos mock (al menos 4 morosos, 5 check-ins con mix de estados).
STACK: React + shadcn/ui (Card, CardContent, CardHeader, Badge, Button) + Lucide icons.
```

---

## 9. Dashboard — Gestión de Socios (`src/app/dashboard/members/`)

### Descripción
Server Component que carga los socios con joins a planes y subscriptions, y pasa los datos al Client Component `MembersClient`.

### Query Principal
```sql
members + plans(id, name, price) + subscriptions(status, next_billing_date, mp_preapproval_id)
WHERE gym_id = [gymId] ORDER BY joined_at DESC
```

### Stats Calculadas
`total`, `active`, `pending`, `suspended` (includes overdue).

---

## 📝 Lovable Prompt — Módulo 9: Gestión de Socios

```
Crea la página de gestión de socios para el dashboard de GymAccess.

RUTA: /dashboard/members
STACK: React + TypeScript + shadcn/ui + Tailwind dark premium.

PARTE 1 — SERVER COMPONENT (page.tsx):
- Autenticar usuario y obtener gym_id
- Query a Supabase: SELECT members con joins a plans y subscriptions WHERE gym_id ORDER BY joined_at DESC
- Calcular stats: { total, active, pending, suspended }
- Pasar todo a <MembersClient members={all} stats={stats} gymId={gymId} />

PARTE 2 — CLIENT COMPONENT (members-client.tsx con 'use client'):

HEADER:
- H1 "Socios"
- 4 stat pills: Total, Activos (verde), Pendientes (ámbar), Suspendidos (rojo)
- Botón "Agregar socio" → abre Dialog

TOOLBAR:
- Input de búsqueda (filtra nombre/email client-side)
- Tabs/filtros: Todos / Activos / Pendientes / Suspendidos

TABLA DE SOCIOS:
Columnas: Avatar+Nombre, Email, Teléfono, Plan, Estado, Miembro desde, Próximo cobro, Acciones
- Badge de estado con colores: active=verde, pending=ámbar, suspended/overdue=rojo
- Dropdown de acciones (⋮): Ver detalle, Suspender/Activar

DIALOG — Agregar Socio:
Campos: Nombre completo, Email, Teléfono, DNI (opcional), Select de plan
Botón "Guardar" → server action

SHEET — Detalle del Socio (al clickear fila):
Foto/avatar, todos los datos, historial de pagos, actions: Suspender/Activar, Enviar link de pago.

DATOS MOCK: 8 socios fake con variedad de estados, planes y fechas.
```

---
