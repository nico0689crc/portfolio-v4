# Fase 3: IDEAR — Generando Soluciones Innovadoras

> **Objetivo:** Generar la mayor cantidad posible de ideas para resolver los problemas definidos, sin juzgar, y luego convergir en las soluciones más prometedoras para el MVP.

---

## Reglas del Brainstorming

Antes de comenzar, establecemos las reglas del proceso de ideación:

1. **Cantidad sobre calidad** (en la fase divergente): No hay ideas malas.
2. **Construir sobre las ideas del otro** ("Sí, y..." en lugar de "Sí, pero...").
3. **Pensar visual**: Dibujar antes que escribir.
4. **Suspender el juicio**: La crítica viene después.

---

## 💡 Brainstorming — Soluciones por Pain Point

### Problema 1: Morosidad y cobro manual

| Idea | Descripción rápida | Factibilidad |
|---|---|---|
| Débito automático mensual | Mercado Pago Preapproval. El socio vincula su tarjeta y se cobra sólo. | ✅ Alta |
| Corte de acceso automático al vencer | Si no pagó, el QR devuelve ROJO automáticamente. Sin que nadie deba actuar. | ✅ Alta |
| Notificación 3 días antes del vencimiento | Push notification via PWA o WhatsApp (via Make.com). | ✅ Alta |
| Link de pago WhatsApp | El dueño genera un link de MP con un clic y lo manda por WhatsApp. | ✅ Alta |
| Gamificación de pagos | Insignias y descuentos por pago puntual. | 🟡 Media |
| Efectivo digitalizado via MP Red | El socio paga en kiosco y el estado se actualiza automáticamente. | 🟡 Media |
| Crédito de gym ("GymCoins") | System de puntos para rescatar por servicios. Incentivo a pagar. | 🔴 Compleja |

### Problema 2: Fraude de acceso (carnet prestado)

| Idea | Descripción rápida | Factibilidad |
|---|---|---|
| Foto en monitor de recepcionista | Al escanear el QR, la foto del socio aparece en pantalla gigante. | ✅ Alta |
| QR único e intransferible | El QR del socio cambia cada 24hs (rolling QR). | ✅ Alta |
| QR dinámico (rolling code cada X segundos) | El QR cambia cada 30 segundos, imposible capturar e intentar reutilizar. | ✅ Alta |
| Biometría facial en PWA | El celular verifica que la cara es la misma. | 🔴 Compleja (privacidad, hardware) |
| NFC en lugar de QR | El socio acerca el celular al lector NFC. | 🔴 Requiere hardware |
| PIN de seguridad adicional | Además del QR, el socio ingresa un PIN. | 🟡 Media (más fricción) |

### Problema 3: Experiencia de acceso - Fricción del socio

| Idea | Descripción rápida | Factibilidad |
|---|---|---|
| PWA "sin instalación" | Abrir en el navegador, guardar en pantalla de inicio. | ✅ Alta |
| QR físico en la pared | Un solo QR impreso. El socio siempre lo encuentra. Elimina el "¿dónde escaneo?". | ✅ Alta |
| Acceso con un toque | Guardar la sesión, la próxima vez sólo abrir la app y apretar un botón. | ✅ Alta |
| Pantalla de inicio como el subte SUBE | Diseño minimal: foto del socio, nombre, estado (Verde/Rojo). | ✅ Alta |
| Apple/Google Wallet integration | El acceso del gym en la billetera del celular. | 🟡 Media |

---

## 🎯 Convergencia — Selección de Ideas para el MVP

Usamos la matriz **Impacto vs. Esfuerzo** para priorizar:

```
        IMPACTO ALTO
             |
  (Idear)    |    (Hacer YA)
             |
  QR Dinámi  | ✅ Débito Automático
  co-Biometr | ✅ Foto en Monitor
  ía         | ✅ PWA sin instalación  
-------------|------------------→ ESFUERZO
  Apple      |    ✅ QR fijo en pared
  Wallet     |    ✅ Corte automático
  GymCoins   |    ✅ Notif. vencimiento
             |
        IMPACTO BAJO
```

### Ideas seleccionadas para el MVP:

1. ✅ **Débito automático** via Mercado Pago Preapproval
2. ✅ **Foto del socio en monitor** al escanear QR
3. ✅ **PWA sin instalación** (Progressive Web App desde el navegador)
4. ✅ **QR físico fijo en la pared** del gimnasio
5. ✅ **Corte automático de acceso** al quedar en mora
6. ✅ **Notificación de vencimiento** proactiva

### Ideas para versión 1.1 (Post-MVP):

- 🟡 QR dinámico (rolling code cada 30seg) — Aumenta seguridad pero complejiza el UX
- 🟡 Link de pago WhatsApp — Fácil de sumar después del MVP
- 🟡 Estadísticas avanzadas para el dueño

---

## 🗺️ Arquitectura de Información — Sitemap Completo

### Portal SaaS Admin (Nico — Super Admin)
```
/admin
  /dashboard          → MRR global, gimnasios activos, alertas
  /gyms               → Listado de gimnasios
    /gyms/:id         → Detalle: socios, ingresos, estado
    /gyms/new         → Alta de nuevo gimnasio
  /billing            → Cobros B2B pendientes, historial
  /settings           → Config del SaaS
```

### Panel del Gimnasio (Roberto — Gym Owner)
```
/gym/:slug
  /dashboard          → Ingresos del mes, check-ins hoy, alertas
  /members            → Listado de socios
    /members/:id      → Perfil del socio: pagos, accesos, foto
    /members/new      → Alta de socio
  /plans              → Planes de suscripción (nombre, precio, días)
  /access             → Monitor URL para el recepcionista
  /settings
    /branding         → Logo + color primario (White-label)
    /payment          → Config Mercado Pago (cuenta del gym)
    /billing          → Ver plan SaaS y pagar a GymAccess
```

### Vista Recepcionista (Sofía — Operaciones)
```
/gym/:slug/reception
  /                   → Pantalla full-screen, WebSocket activo
                        Al escanear QR → muestra Foto + Nombre + VERDE/ROJO + Sonido
```

### PWA del Socio (Lucas — B2C)
```
/app
  /                   → Estado actual (ACTIVO / EN MORA), próximo pago
  /scan               → Cámara QR Scanner para escanear QR de la pared
  /history            → Historial de accesos
  /plan               → Mi plan actual, precio, renovación
  /payment            → Gestionar suscripción Mercado Pago
```

### Flujos de Autenticación
```
/auth
  /login              → Email + Password (Supabase Auth)
  /gym/:slug/join     → Registro del socio (vía link del gym)
  /invite/:token      → Invitación para recepcionista
```

---

## 📱 Flujos de Usuario Detallados

### Flujo A: Primer día del Dueño (Onboarding)

```
1. Roberto accede a gymaccess.com/register
2. Completa: Nombre del gym, email, contraseña
3. Configura su gym: logo, color, nombre del subdominio
4. Conecta su cuenta de Mercado Pago (OAuth)
5. Crea su primer Plan (ej: "Mensual - $x")
6. Imprime el QR de la pared (botón "Descargar QR")
7. Abre la URL del monitor en la TV de recepción
8. Da de alta el primer socio y le envía el link de inscripción
   → Sistema de "Aha moment" en menos de 10 minutos
```

### Flujo B: Primer día del Socio (Activación)

```
1. Lucas recibe link: megafit.gymaccess.com/join/abc123
2. Completa: Nombre, email, foto (cámara del celular)
3. Selecciona Plan (ej: "Mensual")
4. Es redirigido a Mercado Pago para adherir tarjeta o saldo
5. MP procesa → Webhook → Make.com → Supabase: status = "active"
6. Lucas ve pantalla: "¡Listo! Ya podés entrar al gym" + ícono para guardar PWA
7. Al día siguiente: Lucas abre la PWA, apreta "Escanear", 
   apunta al QR en la pared → VERDE en su celular, VERDE en el monitor de Sofía
```

### Flujo C: Check-in en tiempo real (El flujo crítico)

```
Lucas abre PWA → Apreta "Escanear" → Apunta cámara al QR de la pared
    ↓
PWA extrae GymID del QR y envía: { memberId, gymId } a Supabase
    ↓
Supabase verifica:
  ¿member.gym_id === gymId? → ✅ o ❌
  ¿member.status === 'active'? → ✅ o ❌
  ¿Último check-in < 5min? → Anti abuso
    ↓
Response:
  ✅ Éxito → Lucas ve VERDE + "Bienvenido, Lucas" 
             Monitor de Sofía muestra: Foto + Nombre + VERDE + "Ding"
  ❌ Falla → Lucas ve ROJO + "Tu acceso está en mora"
             Monitor de Sofía muestra: Foto + Nombre + ROJO + "Buzzer"
```

### Flujo D: Ciclo de pago automático

```
Día 1 del mes → MP ejecuta débito automático
    ↓
Pago exitoso → MP envía Webhook a URL de Make.com
    ↓
Make.com recibe payload → Actualiza subscriptions tabla en Supabase:
  next_billing_date = hoy + 30 días
    ↓
Estado del socio: "active" hasta next_billing_date
    
Día 29 → Sistema envía notificación push (PWA Notification)
          o WhatsApp via Make.com: "Tu cuota se renueva mañana"
    ↓
Día 30 → MP intenta débito
  ✅ Éxito → Ciclo se repite
  ❌ Falla → Webhook → Make.com → Supabase: status = "overdue"
              → Próximo check-in: ROJO automático
              → Notificación al socio y al dueño
```

---

## 🧩 Decisiones de Diseño Clave

### Decisión 1: QR fijo vs. QR dinámico
- **Elegido:** QR fijo para el MVP
- **Razón:** El QR fijo es imposible de reutilizar de todas formas, porque la validación es server-side. Un impostor que tenga el QR de la pared no puede usarlo en nombre de otro socio: el sistema busca al `member` ligado a la sesión activa del PWA.
- **Mitigación de fraude:** La foto del socio en el monitor del recepcionista es el verdadero anti-fraude. No el código.

### Decisión 2: PWA vs. App Nativa
- **Elegido:** PWA
- **Razón:** Elimina la barrera de descarga. El 60% de los usuarios abandona el proceso de instalación de una app. Una PWA se guarda en la pantalla de inicio con un solo toque y funciona offline para mostrar el estado.

### Decisión 3: WebSockets via Supabase Realtime vs. Polling
- **Elegido:** Supabase Realtime (WebSockets)
- **Razón:** En un escenario de hora pico con 30 check-ins en 2 horas, el polling cada 2 segundos generaría 3.600 requests innecesarias. WebSockets mantiene una conexión abierta y recibe solo cuando hay un evento.
