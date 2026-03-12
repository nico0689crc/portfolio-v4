# Fase 6: ARQUITECTURA TÉCNICA — El Stack en Detalle

> **Objetivo:** Definir con precisión cómo se implementará la solución técnica, sin perder de vista las decisiones de UX que la motivan.

---

## Stack Tecnológico — Justificación

| Capa | Tecnología | Por qué |
|---|---|---|
| **Frontend** | Next.js (App Router) + TypeScript | SSR/SSG nativo, Server Actions, optimización de imágenes |
| **UI** | Tailwind CSS + shadcn/ui | Velocidad de desarrollo + componentes accesibles de calidad |
| **Backend/DB** | Supabase (PostgreSQL) | RLS nativo, Auth incluida, Realtime WebSockets, Storage |
| **Hosting** | Vercel | Edge network global, subdominios dinámicos, CI/CD automático |
| **Pagos B2C** | Mercado Pago Preapproval | Estándar en LATAM, subscripciones out-of-the-box |
| **Automatización** | Make.com (ex Integromat) | Webhooks de MP → Supabase sin servidor propio |
| **PWA** | next-pwa / @ducanh2912/next-pwa | Service Workers, offline support, "Add to Home Screen" en Next.js |
| **QR Generación** | qrcode.react | Generación de QRs únicos por gym |
| **QR Lectura** | html5-qrcode | Lector de cámara para la PWA del socio |
| **WebSockets** | Supabase Realtime | Canal de broadcast para el monitor del recepcionista |

---

## 🗄️ Modelo de Base de Datos (Supabase)

### Diagrama Entidad-Relación

```
auth.users (Supabase Auth)
    │
    ├── user_profiles (1:1)
    │   ├── id (uuid) FK → auth.users.id
    │   ├── role: 'saas_admin' | 'gym_owner' | 'receptionist' | 'member'
    │   ├── gym_id (uuid) FK → gyms.id (null para saas_admin)
    │   └── full_name, avatar_url
    │
gyms
    ├── id (uuid) PK
    ├── name (text) "Mega Fit"
    ├── slug (text, unique) "mega-fit" → mega-fit.gymaccess.com
    ├── logo_url (text)
    ├── primary_color (text) "#6366f1"
    ├── owner_id (uuid) FK → auth.users.id
    ├── mp_access_token (text, encrypted) "Token OAuth del gym en MP"
    ├── saas_status: 'trial' | 'active' | 'suspended'
    ├── trial_ends_at (timestamptz)
    └── created_at (timestamptz)
    │
    ├── plans (N)
    │   ├── id (uuid) PK
    │   ├── gym_id (uuid) FK
    │   ├── name (text) "Mensual", "Trimestral"
    │   ├── price (numeric) "15000.00"
    │   ├── duration_days (int) "30"
    │   ├── mp_plan_id (text) "ID del plan en MP"
    │   └── is_active (bool)
    │
    ├── members (N)
    │   ├── id (uuid) PK
    │   ├── gym_id (uuid) FK
    │   ├── user_id (uuid) FK → auth.users.id
    │   ├── full_name (text)
    │   ├── photo_url (text) → Supabase Storage
    │   ├── dni (text)
    │   ├── status: 'pending' | 'active' | 'overdue' | 'suspended'
    │   └── joined_at (timestamptz)
    │   │
    │   ├── subscriptions (N)
    │   │   ├── id (uuid) PK
    │   │   ├── member_id (uuid) FK
    │   │   ├── plan_id (uuid) FK
    │   │   ├── mp_preapproval_id (text) "ID de la suscripción en MP"
    │   │   ├── status: 'authorized' | 'paused' | 'cancelled'
    │   │   ├── next_billing_date (date)
    │   │   └── created_at (timestamptz)
    │   │
    │   └── check_ins (N)
    │       ├── id (uuid) PK
    │       ├── member_id (uuid) FK
    │       ├── gym_id (uuid) FK
    │       ├── status: 'allowed' | 'denied'
    │       ├── denial_reason: 'overdue' | 'suspended' | 'wrong_gym' | null
    │       └── scanned_at (timestamptz)
    │
webhook_logs (auditoría)
    ├── id (uuid) PK
    ├── source: 'mercadopago' | 'make'
    ├── event_type (text)
    ├── payload (jsonb)
    ├── processed (bool)
    └── received_at (timestamptz)
```

---

## 🔒 Row Level Security (RLS) — Políticas Completas

```sql
-- =====================
-- GYMS
-- =====================

-- El dueño solo ve su propio gym
CREATE POLICY "gym_owner_select" ON gyms
  FOR SELECT USING (owner_id = auth.uid());

-- El SaaS Admin ve todos los gyms
CREATE POLICY "saas_admin_select_all" ON gyms
  FOR SELECT USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'saas_admin'
  );

-- =====================
-- MEMBERS
-- =====================

-- El dueño ve los socios de su gym
CREATE POLICY "gym_owner_sees_members" ON members
  FOR ALL USING (
    gym_id = (SELECT gym_id FROM user_profiles WHERE id = auth.uid())
  );

-- El socio solo ve su propio perfil
CREATE POLICY "member_sees_own_profile" ON members
  FOR SELECT USING (user_id = auth.uid());

-- =====================
-- CHECK_INS
-- =====================

-- El recepcionista y dueño ven los check-ins de su gym
CREATE POLICY "gym_staff_sees_checkins" ON check_ins
  FOR SELECT USING (
    gym_id = (SELECT gym_id FROM user_profiles WHERE id = auth.uid())
  );

-- El socio ve sus propios check-ins
CREATE POLICY "member_sees_own_checkins" ON check_ins
  FOR SELECT USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- =====================
-- INSERT CHECK-IN (via Service Role en Edge Function)
-- =====================
-- Se usa una Supabase Edge Function con service_role key
-- para insertar check-ins y hacer el broadcast.
-- Esto evita exponer el service_role en el cliente.
```

---

## ⚡ Supabase Realtime — El Monitor del Recepcionista

El monitor se suscribe a un canal de Supabase Realtime al cargar:

```typescript
// En el componente ReceptionMonitor.tsx
const channel = supabase
  .channel(`gym-checkins:${gymId}`)
  .on('broadcast', { event: 'new_checkin' }, (payload) => {
    setCurrentCheckin(payload.data);
    playSound(payload.data.status); // 'allowed' → ding, 'denied' → buzz
    setTimeout(() => setCurrentCheckin(null), 5000); // Reset a idle
  })
  .subscribe();
```

Cuando un socio escanea, la Edge Function:
1. Valida el estado del socio en la DB.
2. Inserta el registro en `check_ins`.
3. Hace `broadcast` al canal del gym con los datos del socio (foto, nombre, estado).

```typescript
// En la Supabase Edge Function: check-in.ts
await supabase.channel(`gym-checkins:${gymId}`).send({
  type: 'broadcast',
  event: 'new_checkin',
  data: {
    member: { name, photo_url },
    status: memberStatus === 'active' ? 'allowed' : 'denied',
    denial_reason: memberStatus !== 'active' ? memberStatus : null,
  }
});
```

---

## 💳 Mercado Pago — Flujo de Integración Completo

### B2C: Suscripciones de Socios

```
1. Setup (Onboarding del gym):
   → POST /preapproval_plan
   Body: { reason, auto_recurring: { frequency, frequency_type, amount }, ... }
   Response: { id: "PLAN_ID" }  ← se guarda en plans.mp_plan_id

2. Adhesión del socio:
   → Redirigir a: https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=PLAN_ID
   → El socio adhiere tarjeta/CBU
   → MP redirige a nuestro return_url

3. Webhook de pago exitoso:
   POST /webhooks/mercadopago (recibido por Make.com)
   Body: { type: "payment", data: { id: "PAYMENT_ID" } }

4. Make.com:
   → GET /v1/payments/{PAYMENT_ID}  ← verifica datos del pago
   → PUT Supabase subscriptions.status = 'authorized'
   → PUT Supabase members.status = 'active'
   → UPDATE subscriptions.next_billing_date

5. Pago fallido:
   → Webhook: type: "subscription_authorized_payment", status: "rejected"
   → Make.com → members.status = 'overdue'
```

### B2B: Cobro del SaaS a Gymnasios

```
→ Misma API Preapproval pero con la cuenta MP de GymAccess (Nico).
→ Al vencer el trial, se genera el link de suscripción del SaaS.
→ Si no paga: gyms.saas_status = 'suspended'
→ Suspensión automática: login bloqueado + PWA de socios devuelve error amigable.
```

---

## 🤖 Make.com — Escenarios de Automatización

### Escenario 1: Pago Exitoso de Socio
```
Trigger: Webhook MP (payment.approved)
         ↓
HTTP: GET /v1/payments/{id} → extraer external_reference (member_id)
         ↓
Supabase: UPDATE members SET status = 'active' WHERE id = {member_id}
         ↓
Supabase: UPDATE subscriptions SET next_billing_date = now() + interval '30 days'
         ↓
Supabase: INSERT webhook_logs (para auditoría)
```

### Escenario 2: Pago Rechazado de Socio
```
Trigger: Webhook MP (payment.rejected)
         ↓
Supabase: UPDATE members SET status = 'overdue'
         ↓
HTTP: POST WhatsApp API → "Tu cuota venció. Actualizá tu medio de pago: {link}"
         ↓
HTTP: POST notificación al dueño → "El socio X no pudo pagar"
```

### Escenario 3: Recordatorio de Vencimiento (3 días antes)
```
Trigger: Supabase Scheduled Query (cron diario)
         ↓ Find members WHERE next_billing_date = today + 3 days
HTTP: POST → PWA Push Notification (via Web Push API)
  Body: "Tu cuota de Mega Fit se renueva en 3 días"
```

---

## 🌐 Subdominio Dinámico en Vercel

Cada gym tiene su propuesta de marca:  
`mega-fit.gymaccess.com` → El socio ve el logo y colores de Mega Fit.

**Implementación:**
1. Wildcard DNS: `*.gymaccess.com` apunta a Vercel.
2. En `vercel.json`: wildcard domain habilitado.
3. En el middleware de Next.js/Vite: leer el `host` del request, extraer el `slug`, buscar el gym en Supabase.
4. Inyectar CSS vars: `--gym-primary: #E31D1D` (el color del gym).

```typescript
// middleware.ts (si se usa Next.js) o equivalente en Vite
const slug = request.headers.get('host')?.split('.')[0];
const gym = await supabase.from('gyms').select('*').eq('slug', slug).single();
// Pass gym data to the app via headers o cookies
```

---

> [!IMPORTANT]
> El token de Mercado Pago del gym (`mp_access_token`) debe almacenarse **encriptado** en la DB. Nunca exponerse al frontend. Todas las llamadas a la API de MP se hacen desde Make.com o desde una Supabase Edge Function.
