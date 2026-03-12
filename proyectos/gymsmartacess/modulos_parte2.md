# GymAccess — Documentación de Módulos (`app/src`) — Parte 2

> Continuación de `modulos_parte1.md`. Módulos 10–21. Cada módulo incluye análisis detallado + prompt para Lovable.

---

## 10. Dashboard — Gestión de Planes (`src/app/dashboard/plans/`)

### Descripción
CRUD de planes de membresía, integrado directamente con Mercado Pago. Cada plan crea un `preapproval_plan` en MP.

### Flujo
1. Server Component verifica si el gym tiene `mp_access_token`.
2. Si **no** tiene MP conectado → banner de advertencia con link a configuración.
3. Si tiene MP → renderiza `PlansClient` con el CRUD.

### Server Actions (`src/lib/supabase/actions/plans.ts`)
| Acción | Descripción |
|---|---|
| `getPlansAction()` | Obtiene planes del gym autenticado |
| `createPlanAction(formData)` | Crea en DB + llama `createMpPlanAction` → guarda `mp_plan_id` |
| `updatePlanAction(formData)` | Actualiza DB + `updateMpPlanAction` |
| `togglePlanAction(id, isActive)` | Activa/desactiva + `cancelMpPlanAction` si se desactiva |

---

## 📝 Lovable Prompt — Módulo 10: Gestión de Planes

```
Crea la página de gestión de planes de suscripción del dashboard de GymAccess.

RUTA: /dashboard/plans
STACK: React + TypeScript + shadcn/ui + Tailwind dark premium.

SERVER COMPONENT (page.tsx):
- Cargar planes del gym y verificar si tiene mp_access_token
- Si no tiene MP → pasar isMpConnected=false al client

CLIENT COMPONENT (plans-client.tsx):

CASO 1 — SIN MP CONECTADO:
Banner amarillo con ícono AlertTriangle:
"Necesitás conectar tu cuenta de Mercado Pago antes de poder crear planes."
Link a /dashboard/settings/payment.

CASO 2 — CON MP CONECTADO, sin planes:
Empty state: ícono CreditCard + "Todavía no creaste ningún plan" + botón "Crear primer plan".

CASO 3 — CON PLANES:
Header: "Planes" + botón "Nuevo plan"
Grid de tarjetas por plan:
- Nombre del plan (text-lg font-bold)
- Precio en ARS (text-3xl font-bold) + "/mes" o "/período"
- Duración en días
- Badge: "Activo" (verde) / "Inactivo" (gris)
- Badge: "MP Conectado" (violeta) si tiene mp_plan_id
- Menú ⋮: Editar, Desactivar/Activar

DIALOG — Crear/Editar Plan:
- Nombre del plan
- Precio (ARS, número)
- Duración en días (ej: 30 para mensual)
- Días de prueba gratuita (opcional)
- Toggle "Plan activo"
- Al guardar: loader "Sincronizando con Mercado Pago..." (2-3 segundos simulado)

DATOS MOCK: 3 planes: "Mensual $15.000", "Trimestral $38.000", "Anual $120.000".
```

---

## 11. MercadoPago — OAuth PKCE (`src/lib/mercadopago/actions.ts`)

### Descripción
Maneja la conexión OAuth de un gym con Mercado Pago usando el flujo **Authorization Code + PKCE**.

### Flujo OAuth Completo
```
generateMpAuthUrlAction()
  → code_verifier (randomBytes 32, base64url)
  → code_challenge (SHA256 del verifier, base64url)
  → Guarda verifier en cookie httpOnly (TTL 10min)
  → Retorna URL: auth.mercadopago.com/authorization?...&code_challenge=...&state=[gym_id]

MP redirige a /api/auth/mercadopago/callback?code=...&state=[gym_id]

exchangeMpCodeAction(code, gymId, verifier)
  → POST api.mercadopago.com/oauth/token
  → Guarda access_token + refresh_token en gyms table
```

### Otras Acciones
- `refreshMpTokenAction(gymId)`: Renueva access_token con refresh_token.
- `getGymMpTokenAction(gymId)`: Obtiene token actual.
- `disconnectMpAction()`: Limpia todos los campos MP del gym.

---

## 📝 Lovable Prompt — Módulo 11: MercadoPago OAuth PKCE

```
Crea el módulo de autenticación OAuth con Mercado Pago para GymAccess usando PKCE.

ARCHIVO: src/lib/mercadopago/actions.ts (directiva 'use server')

VARIABLES DE ENTORNO: MP_CLIENT_ID, MP_CLIENT_SECRET, MP_REDIRECT_URI

HELPERS:
- generateCodeVerifier(): randomBytes(32).toString('base64url')
- generateCodeChallenge(verifier): createHash('sha256').update(verifier).digest('base64url')

ACCIÓN 1 — generateMpAuthUrlAction(): Promise<{url?, error?}>
1. getProfileAction() → si no tiene gym_id → error
2. Generar verifier y challenge
3. Guardar verifier en cookie 'mp_code_verifier' (httpOnly, sameSite: lax, maxAge: 600)
4. Construir URL con URLSearchParams: client_id, response_type=code, platform_id=mp, state=[gym_id], redirect_uri, code_challenge, code_challenge_method=S256
5. Retornar { url: 'https://auth.mercadopago.com/authorization?...' }

ACCIÓN 2 — exchangeMpCodeAction(code, gymId, codeVerifier?): Promise<{error?}>
1. POST a https://api.mercadopago.com/oauth/token con client_id, client_secret, code, grant_type=authorization_code, redirect_uri, code_verifier
2. Extraer access_token, refresh_token, user_id
3. UPDATE gyms SET mp_access_token, mp_refresh_token, mp_user_id, mp_connected_at WHERE id=gymId

ACCIÓN 3 — refreshMpTokenAction(gymId): renovar token con refresh_token
ACCIÓN 4 — getGymMpTokenAction(gymId): obtener access_token actual
ACCIÓN 5 — disconnectMpAction(): limpiar mp_access_token, mp_refresh_token, mp_user_id, mp_connected_at

Usar createServiceClient() para todas las operaciones de DB.
```

---

## 12. MercadoPago — Planes Recurrentes (`src/lib/mercadopago/plans.ts`)

### Descripción
Abstracción CRUD sobre la API de `preapproval_plan` de Mercado Pago.

### Mapeo de Duración
- `duration_days % 30 === 0` → `frequency_type: 'months'`, `frequency: days/30`
- Sino → `frequency_type: 'days'`, `frequency: days`

### Acciones
| Acción | Endpoint MP | Descripción |
|---|---|---|
| `createMpPlanAction()` | `POST /preapproval_plan` | Crea plan. Soporta `free_trial`. Configura `notification_url`. |
| `cancelMpPlanAction()` | `PUT /preapproval_plan/{id}` | Status → `'inactive'` |
| `updateMpPlanAction()` | `PUT /preapproval_plan/{id}` | Actualiza nombre y precio |

---

## 📝 Lovable Prompt — Módulo 12: MP Planes Recurrentes

```
Crea el módulo de gestión de planes en Mercado Pago para GymAccess.

ARCHIVO: src/lib/mercadopago/plans.ts (directiva 'use server')
BASE URL: https://api.mercadopago.com

HELPER:
getGymAccessToken(gymId): obtener mp_access_token de gyms table usando service client.
Si no tiene token → retornar null (el gym aún no conectó MP).

FUNCIÓN 1 — createMpPlanAction(gymId, planName, price, durationDays, trialDays?):
1. getGymAccessToken → si null, retornar {} (silent, MP es opcional)
2. Mapear duración: si durationDays % 30 === 0 → months, sino días
3. Construir payload preapproval_plan:
   - reason: planName
   - auto_recurring: { frequency, frequency_type, transaction_amount: price, currency_id: 'ARS' }
   - Si trialDays > 0: auto_recurring.free_trial = { frequency: trialDays, frequency_type: 'days' }
   - back_url: NEXT_PUBLIC_APP_URL + '/api/mp/return'
   - notification_url: MP_WEBHOOK_URL o SUPABASE_URL + '/functions/v1/mp-webhook'
   - status: 'active'
4. POST /preapproval_plan con Authorization: Bearer [accessToken]
5. Retornar { mpPlanId: data.id }

FUNCIÓN 2 — cancelMpPlanAction(gymId, mpPlanId):
PUT /preapproval_plan/{mpPlanId} con { status: 'inactive' }

FUNCIÓN 3 — updateMpPlanAction(gymId, mpPlanId, planName, price):
PUT /preapproval_plan/{mpPlanId} con { reason: planName, auto_recurring: { transaction_amount: price } }

Siempre verificar res.ok. En error: return { error: data.message }.
```

---

## 13. Dashboard — Configuración de Pagos (`src/app/dashboard/settings/payment/`)

### Descripción
UI para conectar/desconectar la cuenta de Mercado Pago del gimnasio.

### Estados
- **Desconectado:** Botón "Conectar Mercado Pago" → llama `generateMpAuthUrlAction()` → redirect al OAuth.
- **Conectado:** Muestra `mp_user_id`, fecha de conexión + botones "Reconectar" y "Desconectar".
- **Feedback:** Lee `?mp_success=1` o `?mp_error=...` para mostrar banners.

### Callback OAuth (`/api/auth/mercadopago/callback/route.ts`)
1. Lee `code` y `state` (gym_id) de query params.
2. Lee cookie `mp_code_verifier`.
3. Llama `exchangeMpCodeAction(code, gymId, verifier)`.
4. Redirige a `/dashboard/settings/payment?mp_success=1` o `?mp_error=...`.

---

## 📝 Lovable Prompt — Módulo 13: Configuración de Pagos MP

```
Crea la página de configuración de integración con Mercado Pago para el dashboard de GymAccess.

RUTA: /dashboard/settings/payment
STACK: React + TypeScript + shadcn/ui.

SERVER COMPONENT (page.tsx):
- getProfileAction() → obtener gym_id
- SELECT mp_user_id, mp_connected_at, mp_access_token FROM gyms WHERE id = gym_id
- Pasar isConnected, connectedAt, mpUserId, successParam, errorParam al client

CLIENT COMPONENT (payment-settings-client.tsx):

CASO 1 — DESCONECTADO:
Tarjeta central con:
- Ícono de Mercado Pago (badge azul celeste)
- H2: "Conectá tu cuenta de Mercado Pago"
- Descripción: "Para habilitar cobros recurrentes en tus planes, necesitás vincular tu cuenta."
- Botón "Conectar Mercado Pago" (gradiente violeta)
  → Al clickear: llama generateMpAuthUrlAction() → redirect a la URL OAuth de MP
  → Estado loading: "Redirigiendo a Mercado Pago..."

CASO 2 — CONECTADO:
- Banner verde: "✓ Mercado Pago conectado"
- Info: ID de usuario MP, fecha de conexión
- Botón ghost "Reconectar" y botón destructivo "Desconectar"
  → Desconectar: confirm dialog + llamar disconnectMpAction()

BANNERS DE FEEDBACK (leer de searchParams):
- mp_success=1 → banner verde: "¡Cuenta conectada exitosamente!"
- mp_error=... → banner rojo: "Error al conectar: [mensaje]"

TAMBIÉN: Crear la route handler /api/auth/mercadopago/callback/route.ts:
GET handler que: lee code+state de params → lee cookie mp_code_verifier → llama exchangeMpCodeAction → redirect a /dashboard/settings/payment?mp_success=1 o mp_error=[mensaje].
```

---

## 14. Webhook Mercado Pago (`/api/webhooks/mercadopago/route.ts`)

### Descripción
Endpoint POST que recibe notificaciones de MP sobre cambios en suscripciones. Es el núcleo de la automatización de cobros.

### Flujo del Webhook
```
topic=preapproval, resourceId=xxx
  ↓
¿subscriptions.mp_preapproval_id = resourceId? → Fast path: usar member/gym ya conocidos
  ↓ No — Discovery path:
  Iterar gyms con MP token → fetch preapproval de MP
  Usar external_reference (= memberId) o payer_email para encontrar member
  ↓
Fetch preapproval → status: authorized/cancelled/paused
  ↓
Mapear: authorized→active, cancelled→suspended, paused→suspended
  ↓
UPSERT subscriptions + UPDATE members.status
```

### Consideración de Seguridad
Siempre retorna HTTP 200 a MP (incluso en errores) para evitar reintentos indefinidos.

---

## 📝 Lovable Prompt — Módulo 14: Webhook Mercado Pago

```
Crea el webhook handler de Mercado Pago para GymAccess.

RUTA: /api/webhooks/mercadopago
MÉTODO: POST
ARCHIVO: src/app/api/webhooks/mercadopago/route.ts

El handler recibe notificaciones de MP cuando una suscripción cambia de estado.

ESTRUCTURA DEL BODY DE MP:
{ type: 'preapproval', data: { id: 'xxx' } } (formato nuevo)
o { topic: 'preapproval', id: 'xxx' } (formato legacy)

LÓGICA PRINCIPAL:
1. Extraer topic y resourceId del body.
2. Si topic !== 'preapproval' → return { ok: true } (ignorar otros topics).
3. Con service client de Supabase:

FAST PATH (suscripción ya vinculada):
  SELECT FROM subscriptions WHERE mp_preapproval_id = resourceId + join a members
  Si existe → obtener memberId y gymId

DISCOVERY PATH (si no existe):
  SELECT FROM gyms WHERE mp_access_token IS NOT NULL LIMIT 20
  Iterar gyms → GET /preapproval/{resourceId} con cada token hasta 200
  Del mpData extraer: external_reference (= memberId) o payer_email → buscar member por email

4. Fetch preapproval de MP para status actual (si no lo tenemos ya)
5. MAPEAR MP STATUS → DB STATUS:
   - authorized → subscription: 'authorized', member: 'active'
   - cancelled → subscription: 'cancelled', member: 'suspended'
   - paused → subscription: 'paused', member: 'suspended'

6. UPSERT subscriptions { member_id, plan_id, mp_preapproval_id, status, next_billing_date }
   onConflict: 'member_id'
7. UPDATE members SET status WHERE id = memberId

IMPORTANTE: SIEMPRE retornar NextResponse.json({ ok: true }) con status 200, incluso en errores internos.
```

---

## 15. Registro de Socios (`src/lib/supabase/actions/member-register.ts`)

### Descripción
Server Actions para que un socio potencial se inscriba desde la landing del gimnasio.

### `registerMemberAction` — Flujo
```
Validar formulario → Fetch plan (verificar mp_plan_id) → Check duplicados
→ INSERT/UPDATE member (status: pending) → UPSERT subscription (status: pending)
→ SET cookie 'mp_pending_member' = memberId (httpOnly, 1h)
→ REDIRECT a mercadopago.com/subscriptions/checkout?preapproval_plan_id=[mp_plan_id]
```

### `linkMemberPreapprovalAction` — Post-MP
Al volver de MP con `?preapproval_id`:
1. Lee cookie → link preapproval a subscription.
2. Verifica status en MP → si `authorized`, activa member inmediatamente.
3. Borra cookie.

---

## 📝 Lovable Prompt — Módulo 15: Registro de Socios (Gym Portal)

```
Crea el flujo completo de registro de nuevo socio para GymAccess.

RUTA: /register?gym=[slug]&plan_id=[id]
STACK: React + TypeScript + shadcn/ui.

SERVER COMPONENT (page.tsx):
- Leer gym slug y plan_id de searchParams
- Fetch gym data: nombre, logo, primary_color
- Fetch plan data: nombre, precio
- Si gym o plan no existen → notFound()
- Renderizar <RegisterForm gymId gym planId planName planPrice gymSlug />

CLIENT COMPONENT (register-form.tsx con 'use client'):
- useActionState conectado a registerMemberAction
- Estado visual: idle / loading ("Preparando suscripción...") / error

FORMULARIO:
- Header: Logo del gym + "Inscribite en [Gym Name]"
- Card resumen del plan: nombre + precio en ARS + duración
- Campos:
  - Nombre completo (required)
  - Email (required)
  - Teléfono (required)
  - DNI (opcional)
  - Hidden fields: gym_id, plan_id, gym_slug
- Botón "Continuar al pago →" (gradiente violeta, full-width)
  → Loading: Loader2 spinner + "Preparando suscripción..."
- Error: Alert rojo con mensaje
- Link: "¿Ya sos socio? Ingresá aquí" → /login

SERVER ACTION — registerMemberAction(prevState, formData):
1. Validar campos requeridos
2. Fetch plan → verificar que existe, activo, tiene mp_plan_id
3. Check: email ya existe con status='active' → error
4. Verificar que gym tiene mp_access_token
5. INSERT member { gym_id, full_name, email, phone, dni, plan_id, status: 'pending' }
6. UPSERT subscription { member_id, plan_id, status: 'pending' } onConflict: member_id
7. SET cookie 'mp_pending_member' = memberId (httpOnly, 1h)
8. redirect('https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=' + plan.mp_plan_id)
```

---

## 16. Control de Acceso — QR del Gimnasio (`src/app/dashboard/access/`)

### Descripción
Sección del dashboard donde el dueño genera y muestra el QR del gimnasio para colocar en la entrada.

### Valor del QR
`${NEXT_PUBLIC_APP_URL}/access?gym=${slug}`

### UI
- Componente `GymQR`: renderiza el QR + botón de descarga/impresión.
- Instrucciones paso a paso del flujo de acceso.
- Link al monitor de recepción para abrir en la TV.

---

## 📝 Lovable Prompt — Módulo 16: QR de Acceso del Gimnasio

```
Crea la página de control de acceso con QR para el dashboard de GymAccess.

RUTA: /dashboard/access
STACK: React + TypeScript + shadcn/ui + librería QR (qrcode.react o react-qr-code).

SERVER COMPONENT (page.tsx):
- Autenticar y obtener gym: slug + name
- Construir qrValue = NEXT_PUBLIC_APP_URL + '/access?gym=' + slug
- Renderizar layout con <GymQR gymName={name} qrValue={qrValue} slug={slug} />

COMPONENTE GymQR (client, 'use client'):

LAYOUT: 2 columnas en desktop (1 en mobile)

COLUMNA IZQUIERDA — QR Display:
- Tarjeta centrada con fondo blanco (para que el QR sea legible)
- QR code grande (256x256) con el valor de la URL
- Nombre del gym debajo
- URL del QR pequeña (texto truncado)
- Dos botones: "Descargar QR" (svg to png) + "Imprimir" (window.print)
- Tip: "Colocá este QR en la entrada del gimnasio"

COLUMNA DERECHA — Instrucciones + Links:
Card "¿Cómo funciona?":
Lista numerada (1→4):
1. Colocá el QR en la entrada — "Imprimilo o mostralo en una pantalla"
2. El socio escanea con su cámara — "Sin app, directo desde el navegador"
3. Validación automática — "El sistema verifica que sea socio activo"
4. Monitor en tiempo real — "La recepción ve PASA / NO PASA al instante"

Card "Monitor de recepción":
- Label "Monitor de recepción"
- Link /reception?gym=[slug] (en violeta, target="_blank")
- Tip: "Abrí este link en la TV de recepción"

DISEÑO: Dark premium. El QR card tiene fondo blanco/light para contraste del código.
```

---

## 17. Control de Acceso — Scan del Socio (`src/app/access/page.tsx`)

### Descripción
Página que ve el **socio** al escanear el QR del gimnasio. Auto-ejecuta la validación al cargar.

### Flujo
```
Socio escanea QR → /access?gym=mega-fit
→ Lee ?gym de URL → verifica sesión
→ No logueado → redirect /login?next=/access?gym=mega-fit
→ Logueado → POST /api/access/scan { gymSlug }
→ Resultado: PASA (verde) o NO PASA (rojo)
```

### API `/api/access/scan` (POST)
1. Verificar sesión (cookie Supabase).
2. Resolver gym por slug.
3. Buscar member WHERE `user_id = user.id AND gym_id = gym.id`.
4. `member.status === 'active'` → `allowed`, sino → `denied`.
5. INSERT `access_logs` → dispara Realtime del monitor.
6. Retornar `{ allowed, status, denial_reason, member }`.

---

## 📝 Lovable Prompt — Módulo 17: Pantalla de Escaneo QR (Socio)

```
Crea la pantalla de resultado de acceso que ve el socio al escanear el QR del gimnasio.

RUTA: /access?gym=[slug]
ARCHIVO: src/app/access/page.tsx (Client Component — 'use client')

FLUJO DE LA PÁGINA:
1. Al montar: leer ?gym de URL con URLSearchParams(window.location.search)
2. Si no hay slug → router.push('/app')
3. Verificar sesión con createClient().auth.getUser()
   - Si no logueado → router.push('/login?next=' + encodeURIComponent('/access?gym=' + gymSlug))
4. POST /api/access/scan con { gymSlug }
5. Mostrar resultado

ESTADOS VISUALES (fullscreen, sin navbar):

LOADING:
- bg-[hsl(222,47%,5%)] min-h-screen flex-center
- Loader2 w-12 h-12 text-violet-400 animate-spin
- "Verificando membresía..." text-white/50

PASA (allowed=true):
- Fondo: bg-emerald-950, transition suave
- CheckCircle2 w-32 h-32 text-emerald-400
- "¡PASA!" text-6xl font-black text-emerald-400
- Nombre del socio text-2xl text-white font-bold
- Plan actual text-lg text-emerald-300/70

NO PASA (allowed=false):
- Fondo: bg-red-950
- XCircle w-32 h-32 text-red-400
- "NO PASA" text-6xl font-black text-red-400
- Motivo en texto legible:
  - pending → "Tu pago está pendiente de confirmación"
  - suspended → "Tu membresía está suspendida"
  - overdue → "Tenés una cuota vencida"
  - default → "No sos miembro de este gimnasio"

BOTÓN FLOTANTE: "Volver a mi perfil" → router.push('/app')
  Estilo: mt-10 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20

CREAR TAMBIÉN — API Route /api/access/scan/route.ts (POST):
1. Extraer gymSlug del body JSON
2. Autenticar con createClient().auth.getUser() → 401 si no autenticado
3. Con service client: SELECT gym WHERE slug=gymSlug
4. SELECT member WHERE user_id=userId AND gym_id=gymId + join plans(name)
5. status = member.status === 'active' ? 'allowed' : 'denied'
6. INSERT access_logs { gym_id, member_id, status, denial_reason, member_data, scanned_at }
7. Return { allowed, status, denial_reason, member: { name, plan_name, photo_url } }
```

---

## 18. Monitor de Recepción en Tiempo Real (`src/app/reception/page.tsx`)

### Descripción
Pantalla fullscreen para la TV de recepción. Muestra el último acceso en tiempo real via **Supabase Realtime**.

### Arquitectura Realtime
```
INSERT en access_logs
  → Supabase detecta → broadcast al canal `gym-access-[gymId]`
  → ReceptionPage recibe → actualiza estado → muestra 5s → vuelve a IDLE
```

### Estados Visuales
| Estado | Fondo | Contenido |
|---|---|---|
| `idle` | Azul oscuro | Ícono + "Esperando escaneo..." |
| `allowed` | `bg-emerald-950` | Foto + "PASA" verde 5xl + nombre + plan |
| `denied` | `bg-red-950` | Foto + "NO PASA" rojo 5xl + motivo |

---

## 📝 Lovable Prompt — Módulo 18: Monitor de Recepción

```
Crea el monitor de recepción fullscreen para GymAccess (TV/PC de recepción).

RUTA: /reception?gym=[slug]
ARCHIVO: src/app/reception/page.tsx (Client Component — 'use client')

CONFIGURACIÓN:
- RESET_DELAY_MS = 5000 (vuelve a idle después de 5 segundos)
- El gymSlug se lee de window.location.search al montar

DATOS INICIALES (al montar con gymSlug):
- Fetch gym id por slug
- Count de access_logs del día (status=allowed, scanned_at >= hoy 00:00)

SUPABASE REALTIME:
Suscribirse al canal 'gym-access-[gymId]' con postgres_changes:
{ event: 'INSERT', schema: 'public', table: 'access_logs', filter: 'gym_id=eq.[gymId]' }
Al recibir evento: actualizar status, currentPayload, todayCount + setear timer de reset.

LAYOUT (h-screen w-screen flex-col, transition-colors duration-700):
- IDLE: bg-[hsl(222,47%,8%)]
- ALLOWED: bg-emerald-950
- DENIED: bg-red-950

HEADER (fixed, border-b border-white/5):
- Logo gym (Zap icon) + nombre
- Punto pulsante verde + "Activo"
- "N accesos hoy" con ícono CheckCheck
- Reloj HH:MM:SS actualizado cada segundo

MAIN — IDLE:
- Círculo con ícono Zap tenue
- "Esperando escaneo..." text-3xl text-white/20
- Fecha larga en español

MAIN — ALLOWED o DENIED:
Layout horizontal: Photo | Info (en desktop)
- Photo: w-64 h-64 rounded-3xl border-4 (verde o rojo), si photo_url null → inicial del nombre
- Info:
  - Badge [CheckCheck o XCircle] + "PASA" o "NO PASA" text-5xl font-black
  - Nombre text-6xl font-extrabold
  - Plan actual (si allowed)
  - Motivo (si denied: overdue="Cuota vencida", default="Acceso suspendido")
  - Hora del scan

FOOTER: barra h-2 ancho completo (verde/rojo/gris según estado), transition-colors.
ANIMACIONES: animate-fade-in para idle, animate-slide-up para resultado.
```

---

## 19. Portal del Socio — PWA (`src/app/app/page.tsx`)

### Descripción
Interfaz mobile-first que ve el socio tras loguearse. Muestra su membresía, estado del pago y cómo ingresar al gimnasio.

### Datos (Server Component)
```sql
members + gyms(name, slug) + plans(name, price, duration_days) + subscriptions(status, next_billing_date)
WHERE user_id = [userId]
```

### UI por Estado
| Estado | Contenido extra |
|---|---|
| `active` | Card "Ingresar: escanear QR de la entrada con la cámara" |
| `pending` | Banner ámbar "Tu membresía se activará al confirmar el pago" |
| `suspended` | Banner rojo "Contactá al gimnasio" |

---

## 📝 Lovable Prompt — Módulo 19: Portal del Socio (PWA)

```
Crea el portal mobile del socio de GymAccess. Es una PWA que el socio usa para ver su membresía.

RUTA: /app
ARCHIVO: src/app/app/page.tsx (Server Component)

SERVER COMPONENT:
- Autenticar → si no logueado → redirect('/login')
- Con service client: SELECT member + gyms(name,slug) + plans(name,price,duration_days) + subscriptions(status,next_billing_date,mp_preapproval_id) WHERE user_id = userId
- Pasar datos al JSX

DISEÑO GENERAL:
- min-h-screen bg-[hsl(222,47%,5%)] p-4 md:p-8
- Glow violeta de fondo: div fixe top-right, w-500px, bg-violet-600/5, blur-150px
- max-w-lg mx-auto (centrado en mobile)

HEADER:
- Nombre del gym (text-white/40 text-sm) + "Hola, [Nombre] 👋" (text-2xl font-bold)
- Botón "Salir" a la derecha (form con signOutAction, LogOut icon)

CARD 1 — "Mi membresía" (rounded-3xl p-6):
- Header: "Mi membresía" + Badge de estado con ícono:
  - active: badge verde + CheckCircle2
  - pending: badge ámbar + Clock
  - suspended/overdue: badge rojo + AlertCircle
- Filas de info: Plan (nombre + precio/mes), Miembro desde (fecha), Próximo cobro (con CreditCard icon)

CARD 2 — Ingresar al gimnasio (SOLO si status=active):
- Ícono ScanLine en cuadro violeta
- "Ingresar al gimnasio"
- "Escaneá el QR de la entrada con tu cámara"

CARD 3 — Email vinculado:
- "Cuenta vinculada a" + user.email

BANNERS CONDICIONALES:
- Si pending: banner ámbar "Tu membresía se activará una vez confirmado el pago"
- Si suspended: banner rojo "Contactá al gimnasio para más información"

DISEÑO: Dark premium, mobile-first, sin navbar. Bordes: border-white/10, fondos: bg-white/4.
```

---

## 20. Gym Landing Page White-Label (`src/app/gym/[slug]/page.tsx`)

### Descripción
Landing pública del gimnasio. Accesible en `[slug].gymaccess.com` (vía rewrite de middleware) o directamente en `/gym/[slug]`.

### Secciones
1. **Navbar:** Logo, links internos, botones "Ingresar" y "Inscribirme".
2. **Hero:** Gradiente violeta, H1 motivacional, subtítulo.
3. **Planes:** Cards para cada `plan.is_active`, precio, botón "Elegir plan" → `/register?gym=[slug]&plan_id=[id]`.
4. **Footer:** Redes sociales, ubicación. "Potenciado por GymAccess."

### Manejo del Return de MP
Si URL tiene `?preapproval_id`, llama `linkMemberPreapprovalAction` y muestra banner verde o amarillo.

---

## 📝 Lovable Prompt — Módulo 20: Gym Landing White-Label

```
Crea la landing page pública del gimnasio para GymAccess. Es la página que ven los socios potenciales.

RUTA: /gym/[slug] (también accessible como subdominio en producción)
ARCHIVO: src/app/gym/[slug]/page.tsx (Server Component)

SERVER COMPONENT:
- Fetch gym por slug (si no existe → notFound())
- Fetch planes activos del gym ordenados por precio ASC
- Si searchParams.preapproval_id → llamar linkMemberPreapprovalAction(preapprovalId)

DISEÑO GENERAL: min-h-screen bg-black text-white (landing premium oscura)

NAVBAR (fixed, top-0, z-50, backdrop-blur-xl, border-b border-white/5 bg-black/50):
- Logo: cuadrado violeta con inicial del gym + nombre del gym (font-bold text-xl)
- Links: "Planes" (#planes), "Contacto" (#contacto)
- Botones: "Ingresar" (ghost) + "Inscribirme" (rounded-full, gradiente violeta)

BANNERS POST-MP (fixed, top-20, z-40):
- Si preapproval exitoso: banner verde "¡Suscripción exitosa! Tu membresía ya está activa."
- Si preapproval pendiente: banner ámbar "Pago recibido. Tu membresía será activada en breve."

HERO SECTION (pt-40 pb-20):
- Glow blur violeta de fondo (absoluto, -z-10)
- Badge pill: "Bienvenido a [GymName]" (bg-white/5 border-white/10 text-violet-400)
- H1 (text-5xl md:text-7xl font-extrabold): "Transformá tu cuerpo," + gradient "mejorá tu vida."
- Subtítulo motivacional

SECCIÓN PLANES (#planes, py-24 bg-white/[0.02]):
- H2 centrado + descripción
- Grid 1→3 cols con cards por plan:
  - Nombre, precio grande + "/mes", features básicas (access libre, seguimiento profesional)
  - Hover: border-violet-500/50 + gradiente interno
  - Botón "Elegir plan" → /register?gym=[slug]&plan_id=[id]

FOOTER (#contacto):
- Logo gym + descripción + redes sociales (Instagram, Facebook)
- Ubicación con MapPin icon
- Copyright "© 2026 [GymName]. Potenciado por GymAccess."
```

---

## 21. Landing GymAccess (`src/app/page.tsx`)

### Descripción
Landing pública del SaaS, apuntada a dueños de gimnasios. Presenta la propuesta de valor de GymAccess.

### Secciones Objetivo
- Hero con propuesta de valor clara y CTA "Empezá gratis 30 días".
- Sección de problemas (morosidad, fraude, CAPEX) vs solución.
- Las 3 productos (Dashboard, PWA del Socio, Monitor).
- Precios/trial.
- Footer.

---

## 📝 Lovable Prompt — Módulo 21: Landing SaaS GymAccess

```
Crea la landing page principal de GymAccess (SaaS para gimnasios de LATAM).
Target: dueños de gimnasios independientes que quieren modernizar cobros y control de acceso.

RUTA: /
STACK: Next.js + TypeScript + Tailwind. SEO optimizado: title, meta description, H1 único.

SECCIÓN 1 — HERO:
- Navbar: logo GymAccess (Zap icon violeta) + links "Funcionalidades", "Precios" + botón "Iniciar sesión" + botón CTA "Empezá gratis"
- H1: "El fin de los carnets de papel y los pagos atrasados"
- Subtítulo: "GymAccess automatiza cobros, controla accesos con QR y gestiona tus socios. Sin hardware costoso."
- 2 CTAs: "Empezá gratis 30 días" (primario) + "Ver demo" (ghost)
- Visual: mockup del dashboard o 3 pantallas del producto (usar placeholders oscuros con glassmorphism)

SECCIÓN 2 — PROBLEMA vs SOLUCIÓN (tabla comparativa):
| Problema | Sin GymAccess | Con GymAccess |
| Morosidad | Perseguís pagos 10 días | Cobro automático Mercado Pago |
| Fraude acceso | 15% presta el carnet | QR único por socio, verificado |
| Alto CAPEX | Molinetes +USD 2.000 | Sin hardware, solo QR |
| Inflación | Efectivo pierde valor | Cobro digital inmediato |

SECCIÓN 3 — 3 PRODUCTOS (grid 3 cols):
1. Panel del Gimnasio (B2B): ícono LayoutDashboard, descripción, badge "Para el dueño"
2. PWA del Socio (B2C): ícono Smartphone, badge "Para el socio"
3. Monitor de Recepción: ícono Monitor, badge "Para la recepción"

SECCIÓN 4 — CÓMO FUNCIONA (3 pasos):
1. Registrá tu gimnasio (30 días gratis)
2. Conectá Mercado Pago y creá tus planes
3. Imprimí el QR de entrada, listo.

SECCIÓN 5 — PRICING:
Card única: "Plan GymAccess · $XX/mes por sede" + lista de features + botón CTA.
"30 días de prueba gratuita incluidos. Sin permanencia."

FOOTER: Logo, links legales, redes sociales. "GymAccess © 2026. Hecho para gimnasios de LATAM."

DISEÑO: Dark premium, paleta violeta/esmeralda, gradientes, micro-animaciones en scroll, mobile-first.
```

---

## Resumen de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                       GYMACCESS                         │
├──────────────┬─────────────────┬───────────────────────┤
│   B2B        │      Ops        │         B2C           │
│ /dashboard   │  /reception     │  /gym/[slug]          │
│ gym_owner    │  receptionist   │  /register            │
│              │  Supabase RT    │  /access (scan)       │
│   /app       │                 │                       │
│   member     │                 │                       │
└──────────────┴─────────────────┴───────────────────────┘
                       │
            ┌──────────┴──────────┐
            │      API Routes      │
            │  /api/access/scan   │← INSERT access_logs
            │  /api/mp/return     │← Link preapproval
            │  /api/webhooks/mp   │← Cobros automáticos
            │  /api/auth/mp/cb    │← OAuth callback
            └──────────┬──────────┘
                       │
            ┌──────────┴──────────┐
            │  Supabase + MP      │
            │  Auth · DB · RT     │
            │  OAuth · Webhooks   │
            └─────────────────────┘
```
