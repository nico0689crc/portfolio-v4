# Fase 7: ESTRATEGIA DE NEGOCIO — El SaaS como Producto

> **Objetivo:** Definir el modelo de negocio, la estrategia de go-to-market y las métricas clave que determinarán el éxito de GymAccess como empresa.

---

## 💰 Modelo de Ingresos

### Estructura de Precios (propuesta inicial)

| Plan | Precio mensual | Socios incluidos | Ideal para |
|---|---|---|---|
| **Starter** | ARS $15.000 / mes | hasta 100 socios | Gym pequeño, recién empezando |
| **Growth** | ARS $35.000 / mes | hasta 300 socios | Gym mediano establecido |
| **Pro** | ARS $75.000 / mes | socios ilimitados | Multi-sede o gym grande |
| **Trial** | $0 por 30 días | hasta 50 socios | Todas las features del Growth |

> **Nota:** Los precios deben revisarse mensualmente ajustando por inflación. Considerar dolarizar en USD 15/35/75 para simplificar y proteger el MRR.

### Fuente de Revenue Principal
```
MRR = Nro. de gyms activos × Precio promedio del plan

Año 1 objetivo: 50 gyms × ARS $25.000 promedio = ARS $1.250.000/mes
```

### Revenue Secundario (roadmap)
- Comisión sobre pagos procesados a través de la plataforma (0.5% sobre transacciones MP).
- Setup fee de onboarding para gyms grandes (servicio de configuración).

---

## 🗺️ Estrategia Go-to-Market (GTM)

### Fase 1: Tracción (Meses 1-3) — Foco en 1 ciudad

**Objetivo:** 10 gyms activos. Cero churn. Delirar a los primeros clientes.

**Canales:**
- Contacto directo: visitar 50 gyms en CABA con demo en tablet (15 min).
- WhatsApp: alcance a dueños de gym via grupos de gremios o asociaciones.
- Referidos: cada gym que refiere a otro → 1 mes gratis.

**El pitch de 30 segundos:**
> _"Hoy, el 15% de tus socios entran gratis porque prestan el carnet. Yo te instalo un sistema que, con solo imprimir un papel y pegar un QR en la puerta, hace que eso sea imposible. Y de paso, los cobros se hacen solos. Es gratuito el primer mes."_

**El hook de la prueba gratuita:**
- 30 días sin costo, sin tarjeta de crédito.
- Onboarding guiado de 10 minutos (video + checklist).
- Al día 7: llamada de check-in del fundador (Nico) con el dueño.
- Al día 25: "¿Cuánto recuperaste este mes? ¿Seguimos?"

---

### Fase 2: Escala (Meses 4-12) — Expansión regional

**Objetivo:** 100 gyms. Playbook de ventas documentado. Primer empleado de ventas.

**Canales:**
- SEO local: "software para gimnasios Argentina", "sistema de cobro gym".
- Content marketing: blog/videos sobre cómo reducir la morosidad en gimnasios.
- Alianzas: distribuidores de equipamiento de gym (venden el software como addon).
- Instagram: testimoniales de dueños con resultados concretos (ARS X recuperados).

---

### Fase 3: Madurez (Año 2+) — LATAM

**Objetivo:** Expansión a México, Colombia, Chile.

**Canales:**
- Adaptar MP a otros países (MP existe en MX, CO, CL, PE, UY, BR).
- Partnerships con asociaciones de fitness en cada país.
- Modelo franchised: "GymAccess Partner" por país.

---

## 🏆 Ventajas Competitivas (Moat)

| Ventaja | Descripción |
|---|---|
| **Integración nativa MP** | Único SaaS gym con suscripciones MP + webhooks + acceso integrado |
| **Hardware Zero** | No requiere compra previa. Se activa en 10 minutos con papel e impresora. |
| **White-label barato** | El gym siente que tiene "su propia app" por ARS $15.000/mes |
| **Lock-in por datos** | Historial de accesos y pagos = datos que el gym no quiere perder |
| **Network effect** (futuro) | Socios que usan la PWA en varios gyms → adopción viral |

---

## 📊 KPIs del Negocio

| Métrica | Definición | Target Año 1 |
|---|---|---|
| **MRR** | Ingreso recurrente mensual | ARS $1.000.000 |
| **Churn Rate** | % gyms que cancelan por mes | < 3% |
| **LTV** | Ingreso total por gym (vida útil) | ARS $360.000 (24 meses × $15k) |
| **CAC** | Costo de adquirir un gym (tiempo de ventas) | < 1 mes de plan |
| **LTV:CAC** | Ratio salud del negocio | > 3:1 |
| **Time to Value** | Tiempo hasta que el gym ve el primer beneficio | < 48 horas |
| **NPS** | Net Promoter Score de dueños | > 50 |
| **Gym Activation Rate** | % gyms que llegan a 10 socios en el día 1 | > 70% |

---

## ⚖️ Análisis Competitivo

| Competidor | Fortaleza | Debilidad | Diferencial GymAccess |
|---|---|---|---|
| Macrosoft Gym | Sistema completo, probado | Caro, complejo, sin MP integrado | Precio + MP + QR sin hardware |
| Perfect Gym | Enterprise, multi-sede | USD 200+/mes, requiere implementación | Onboarding 10 min, free trial |
| Gimnasio.app | Argentino, económico | Sin control de acceso, sin suscripciones MP | Acceso QR + MP Preapproval |
| Excel + WhatsApp | Ya lo usan, gratis | Manual, sin automatización, fraude | Todo lo mencionado arriba |
| App a medida | Personalizada | USD 10.000+ de desarrollo + mantenimiento | Tiempo y costo 10x menor |

---

## 🚀 Roadmap del Producto

### MVP (Mes 1-2)
- [x] Autenticación multi-rol
- [x] Check-in QR con monitor en tiempo real
- [x] Suscripciones MP Preapproval
- [x] Panel básico del dueño
- [x] White-label básico (logo + color)

### v1.1 (Mes 3-4)
- [ ] Notificaciones push (vencimientos)
- [ ] QR dinámico (rolling code)
- [ ] Reportes: ingresos, check-ins, tendencias
- [ ] Link de pago WhatsApp (para socios sin MP)
- [ ] Multi-sede (un dueño, varios gyms)

### v1.2 (Mes 5-6)
- [ ] App nativa (React Native / Expo) opcional
- [ ] Integración con sistemas de clases/turnos
- [ ] API pública para integraciones de terceros
- [ ] Super Admin panel completo (tablero MRR global)

### v2.0 (Año 2)
- [ ] Módulo de nutrición / entrenadores
- [ ] Acceso por NFC (opcional, para gyms que quieran)
- [ ] Marketplace de planes entre gyms con mismos socios
- [ ] LATAM: soporte multi-divisa y gateways regionales

---

## 📋 Checklist de Lanzamiento

### Técnico
- [ ] Dominio gymaccess.com / .ar configurado en Vercel
- [ ] Wildcard DNS (`*.gymaccess.com`) configurado
- [ ] Variables de entorno de producción en Vercel
- [ ] Webhook URL de producción configurada en MP
- [ ] Escenarios de Make.com activos y testeados
- [ ] RLS de Supabase auditada y testeada
- [ ] Error monitoring activo (Sentry)

### Producto
- [ ] Demo gym cargado (datos de prueba realistas)
- [ ] Video de onboarding de 3 minutos grabado
- [ ] Email de bienvenida automático configurado
- [ ] Documentación mínima para dueños (FAQ)
- [ ] Términos y Condiciones + Política de Privacidad

### Negocio
- [ ] Precio definido y comunicado
- [ ] Método de cobro del SaaS configurado (MP)
- [ ] CRM básico para tracking de prospectos (Notion o HubSpot free)
- [ ] 3 gyms piloto confirmados para el día de lanzamiento

---

> [!IMPORTANT]
> **La métrica más importante del primer mes no es el MRR, es el "Time to Value".** Si un gym tarda más de 48hs en ver el primer beneficio (socio que paga automáticamente, o check-in que funciona), el riesgo de churn se dispara. El onboarding es el producto más importante del MVP.
