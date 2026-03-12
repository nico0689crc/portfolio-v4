# Fase 5: TESTEAR — Validando las Hipótesis de Diseño

> **Objetivo:** Definir cómo validaremos que el producto resuelve los problemas reales de los usuarios antes y durante el desarrollo, minimizando el riesgo de construir lo que nadie quiere.

---

## ¿Qué estamos testeando?

En Design Thinking, el testeo no es solo QA técnico. Es **validación de hipótesis de negocio y UX** con usuarios reales, tan temprano como sea posible.

---

## 🧪 Las 5 Hipótesis Críticas del MVP

| # | Hipótesis | Cómo la validamos | Criterio de éxito |
|---|---|---|---|
| H1 | Los dueños adoptarán el cobro automático si el setup es < 15 min | Prueba de onboarding con prototipo Figma/real | 8/10 dueños completan el setup sin ayuda |
| H2 | Los socios usarán la PWA sin necesidad de tutorial | Test de usabilidad no moderado | 8/10 socios escanean y entran en < 30 segundos en el primer intento |
| H3 | El monitor del recepcionista reduce conflictos de acceso | Observación en gym piloto durante 1 semana | 0 casos de "dejar pasar por no discutir" |
| H4 | El corte automático de acceso es el mejor mecanismo de cobranza | Tracking de tasa de pago antes/después | Morosidad baja > 50% en el primer mes |
| H5 | Los gym pagarán el SaaS si ven valor claro en < 30 días | Conversión trial → pago | > 40% de conversión al mes |

---

## 🔍 Plan de Validación por Fases

### Fase A: Validación pre-construcción (Semana 1-2)

**Objetivo:** Saber si el concepto tiene sentido ANTES de escribir una línea de código.

**Herramientas:**
- Mockups en Figma (o las pantallas visuales definidas en `04_Prototipar.md`)
- Entrevistas de 30 minutos con 3-5 dueños de gimnasio reales

**Script de la entrevista:**
1. Presentar el problema que GymAccess resuelve (sin mostrar el producto todavía).
2. Preguntar: "¿Cómo resolvés esto hoy? ¿Cuánto tiempo te lleva?"
3. Mostrar el wireframe del dashboard del dueño: "¿Tiene sentido esto para vos?"
4. Mostrar el flujo del QR y el monitor: "Si esto existiera, ¿lo usarías?"
5. Preguntar: "¿Cuánto pagarías por esto? ¿Qué te frenaría?"

**Métricas:**
- ¿Cuántos expresaron el problema espontáneamente antes de verlo?
- ¿Cuántos preguntaron "¿cuándo lo puedo tener?"?

---

### Fase B: Beta privada con 1 gimnasio piloto (Semana 3-6)

**Objetivo:** Testear el producto real en un entorno controlado.

**Setup:**
- 1 gimnasio seleccionado: idealmente un conocido, 50-150 socios.
- Onboarding completo: el dueño configura el gym solo (con GymAccess listo).
- Período de prueba: 30 días.

**KPIs a medir:**

| Métrica | ¿Cómo medirla? | Target |
|---|---|---|
| Tiempo de onboarding del dueño | Registro en Supabase (start → first member created) | < 15 minutos |
| Tiempo de accionamiento del socio | Desde link de invitación → primer check-in exitoso | < 5 minutos |
| Adopción de la PWA | % socios con PWA guardada en home screen | > 70% |
| Tasa de check-in exitoso | check_ins exitosos / intentos totales | > 95% |
| Reducción de morosidad | % socios al día vs. mes previo | > 60% mejora |
| NPS del dueño al mes 1 | Encuesta al final del trial | > 50 NPS |
| NPS del socio al mes 1 | Encuesta in-app | > 40 NPS |

**Qué observar cualitativamente:**
- ¿El recepcionista usa el monitor sin ayuda? ¿Lo entiende de inmediato?
- ¿Hay socios que tuvieron problemas para escanear? ¿Cuáles?
- ¿El dueño revisó el dashboard? ¿Cuántas veces por semana?
- ¿Qué features pidieron que no están en el MVP?

---

### Fase C: Test de Usabilidad del Monitor (El diseño más crítico)

**Objetivo:** Confirmar que el monitor es 100% comprensible sin capacitación previa.

**Metodología:** Test de guerrilla (5 minutos).

**Protocolo:**
1. Poner una tablet con el monitor en modo de demostración (loop de mock check-ins).
2. Pedirle a alguien que nunca vio el sistema: "¿Qué te dice esta pantalla?"
3. Simular un check-in Verde: "¿Qué harías?"
4. Simular un check-in Rojo: "¿Qué harías?"

**Criterio de pase:** Si la persona entiende correctamente en < 10 segundos sin ayuda → aprobado.

---

### Fase D: Test de Usabilidad de la PWA (El flujo del socio)

**Objetivo:** Confirmar que un socio puede entrar al gym en su primer intento sin ayuda.

**Protocolo:**
1. Darle el link de invitación a 5 personas que no conocen el producto.
2. Decirles solo: "Usá esto para acceder al gym."
3. Observar sin intervenir. Anotar dónde se traban.

**Puntos de fricción esperados (a resolver antes del lanzamiento):**
- ¿Saben cómo activar la cámara para escanear?
- ¿Entienden que deben guardar la PWA en pantalla de inicio?
- ¿El flujo de MP es claro o genera ansiedad?

---

## 🔁 Ciclo de Aprendizaje (Build-Measure-Learn)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  IDEA                                                    │
│  ↓                                                       │
│  CONSTRUIR → Feature mínima en 1-2 semanas               │
│  ↓                                                       │
│  MEDIR → Eventos en Supabase + Encuestas breves          │
│  ↓                                                       │
│  APRENDER → ¿La hipótesis fue correcta?                  │
│  ↓                                                       │
│  PIVOTAR o PERSEVERAR → Siguiente iteración              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Dashboard de Métricas del Producto post-lanzamiento

### Métricas de Adquisición (Nico — Admin)
- Nuevos gimnasios registrados por semana
- Tiempo promedio de onboarding
- Tasa de conversión trial → pago

### Métricas de Activación (Gym Owner)
- % gyms con al menos 10 socios cargados
- % gyms con MP configurado
- % gyms con monitor activo

### Métricas de Retención (Engagement)
- DAU/MAU de check-ins por gym
- % socios con PWA guardada
- Churn rate mensual de gyms

### Métricas de Ingreso (MRR)
- MRR del SaaS (pagos de gyms)
- MRR procesado por Mercado Pago (pagos de socios) — proxy de valor generado
- LTV por gym

---

## 🚨 Riesgos Identificados y Planes de Contingencia

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Mercado Pago cambia la API de Preapproval | Media | Alto | Capa de abstracción en Make.com para facilitar reemplazo |
| Los socios rechazan la PWA | Baja | Alto | WhatsApp como canal alternativo de validación de acceso |
| El gym tiene mal wifi en la entrada | Alta | Alto | Diseñar check-in con fallback offline (estado cacheado válido por 2hs) |
| El recepcionista apaga el monitor | Media | Medio | El log de check-ins sigue funcionando igual; el monitor es opcional |
| Un gym copia el modelo y monta su propio sistema | Baja | Bajo | El moat es la integración MP, los datos históricos y el soporte |
| Supabase tiene downtime en hora pico | Baja | Alto | Cache edges en Vercel + mensaje de error claro en PWA |

---

> [!TIP]
> El mayor aprendizaje que esperamos de la fase de testeo es **qué no construir**, no qué construir. Cada feature que un usuario no usa en el primer mes es una feature que no debimos poner en el MVP.
