# Fase 2: DEFINIR — Sintetizando el Problema Real

> **Objetivo:** Transformar los insights de la fase de Empatía en definiciones claras, accionables y centradas en el usuario. Articular el problema que realmente merecemos resolver.

---

## Del Caos de Insights a la Claridad del Problema

Después de empatizar, tenemos cientos de datos. La fase de Definición nos obliga a filtrar el ruido y encontrar el problema raíz que, al resolverlo, genera el mayor impacto posible.

---

## 📌 Point of View Statements (POV)

Un POV es la reformulación del problema desde la perspectiva del usuario, siguiendo la fórmula:  
**[Usuario] necesita [necesidad] porque [insight sorprendente].**

| Usuario | Necesidad | Insight |
|---|---|---|
| Roberto (Dueño) | Saber automáticamente quién pagó y quién no | El problema no es que los socios sean malos pagadores, sino que el sistema actual **facilita** la mora |
| Sofía (Recepcionista) | Una herramienta que tome decisiones de acceso por ella | El recurso más frágil del control de acceso actual es el **juicio humano bajo estrés** |
| Lucas (Socio) | Un acceso invisible que "simplemente funcione" | La fricción en la entrada del gym es **socialmente costosa**, no solo molesta |
| Nico (Fundador) | Un negocio que se venda y opere de forma predecible | El mayor riesgo del SaaS no es la adquisición, sino la **retención** cuando el gym "se acostumbra" y deja de percibir el valor |

---

## 🎯 Problem Statement Central

> **"Los gimnasios independientes en Argentina operan con procesos administrativos de los años 90 (Excel, efectivo, carnets de papel), lo que genera fugas de capital de entre el 10% y el 20% anual por fraude (carnets prestados) y morosidad crónica. Esto se debe a que tecnologías existentes (molinetes, sistemas de gestión) son o demasiado caras, o demasiado complejas para el dueño promedio, generando una brecha de modernización que afecta directamente su rentabilidad y su percepción de marca."**

---

## 🗺️ Customer Journey Map — Estado Actual (Antes de GymAccess)

### Flujo: Un martes después del 1ro de mes (Roberto cobra cuotas)

| Etapa | Acción | Pensamiento | Emoción |
|---|---|---|---|
| Inicio del mes | Roberto abre su planilla de Excel | "A ver quién me debe este mes" | 😤 Resignado |
| Días 1-5 | Envía mensajes de WhatsApp individuales | "Esto me lleva horas" | 😩 Agotado |
| Días 5-10 | Llama a los que no respondieron | "Tengo que ser el malo de la película" | 😠 Frustrado |
| Día 10+ | Algunos siguen sin pagar y siguen entrando | "No puedo echarlos, son clientes" | 😕 Impotente |
| Fin de mes | Contabiliza pérdida real | "El 15% de lo que facturé no lo cobré a tiempo" | 😔 Derrotado |

### Flujo: Una tarde de martes - Sofía en recepción (hour peak)

| Etapa | Acción | Pensamiento | Emoción |
|---|---|---|---|
| 17:30 | Prepara el mostrador, busca la planilla | "Otra tarde de caos" | 😐 Neutral |
| 18:00 | Llegan los primeros socios. Los ubica de memoria | "Por suerte conozco a los habituales" | 🙂 Ok |
| 18:30 | Llega alguien que no reconoce. Le pide carnet | "No está en la lista. Dice que pagó por transferencia" | 😟 Incómoda |
| 18:45 | Fila de 8 personas. Llaman al dueño | "No puedo verificar y atender al mismo tiempo" | 😰 Estresada |
| 19:15 | Deja pasar a 3 socios dudosos "para no discutir" | "Después de todo no es mi responsabilidad" | 😔 Culpable |

---

## 🔍 Análisis de Causa Raíz (5 Whys)

### Problema: El 15% de los socios no paga en fecha

| Por qué | Respuesta |
|---|---|
| ¿Por qué no pagan en fecha? | Porque no hay recordatorio automático ni mecanismo de cobro activo |
| ¿Por qué no hay recordatorio automático? | Porque el sistema es manual (Excel + WhatsApp) |
| ¿Por qué usan Excel y WhatsApp? | Porque el software de gestión existente es costoso o difícil de implementar |
| ¿Por qué es costoso/difícil? | Porque está orientado a grandes cadenas con personal IT dedicado |
| ¿Por qué no hay soluciones para el segmento PYME? | Porque el mercado LATAM está subatendido y nadie pensó en una versión "Low-Code y barata" |

**→ Causa Raíz:** La brecha tecnológica entre las grandes cadenas y los gimnasios independientes. **GymAccess existe para cerrar esa brecha.**

---

## 💎 Value Proposition Canvas

### Segmento B2B — Dueño del Gimnasio

```
┌─────────────────────────────────────────────────────────┐
│                  PERFIL DEL CLIENTE                      │
├──────────────────┬──────────────────┬────────────────────┤
│   TRABAJOS       │    DOLORES       │     GANANCIAS      │
│                  │                  │                    │
│ Cobrar cuotas    │ Morosidad        │ MRR predecible     │
│ Controlar acceso │ Fraude de acceso │ Sin hardware caro  │
│ Gestionar socios │ Imagen obsoleta  │ Marca propia       │
│ Proyectar marca  │ Tiempo en admin  │ Control remoto     │
└──────────────────┴──────────────────┴────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               MAPA DE VALOR (GymAccess)                 │
├──────────────────┬──────────────────┬────────────────────┤
│   PRODUCTOS      │  ALIVIADORES     │   CREADORES DE     │
│   & SERVICIOS    │   DE DOLOR       │   GANANCIAS        │
│                  │                  │                    │
│ Panel B2B        │ Cobro automático │ Dashboard MRR      │
│ PWA socios       │ QR anti-fraude   │ White-label ~$0    │
│ Monitor recep.   │ No necesita HW   │ Auto-suspensión    │
│ Webhooks MP      │ Gestión digital  │ Tiempo libre       │
└──────────────────┴──────────────────┴────────────────────┘
```

### Segmento B2C — Socio del Gimnasio

```
┌─────────────────────────────────────────────────────────┐
│                  PERFIL DEL CLIENTE                      │
├──────────────────┬──────────────────┬────────────────────┤
│   TRABAJOS       │    DOLORES       │     GANANCIAS      │
│                  │                  │                    │
│ Acceder al gym   │ Filas y esperas  │ Entrada < 5 seg    │
│ Pagar la cuota   │ Olvidar el pago  │ Pago automático    │
│ No rebotar       │ Vergüenza mora   │ Sin app que bajar  │
│ Sentirse premium │ Carnet físico    │ Gym moderno        │
└──────────────────┴──────────────────┴────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               MAPA DE VALOR (GymAccess)                 │
├──────────────────┬──────────────────┬────────────────────┤
│   PRODUCTOS      │  ALIVIADORES     │   CREADORES DE     │
│   & SERVICIOS    │   DE DOLOR       │   GANANCIAS        │
│                  │                  │                    │
│ PWA (navegador)  │ Sin descarga     │ Debito automático  │
│ QR Scanner       │ Sin carnet fco.  │ Historial accesos  │
│ Estado en tiempo │ Sin colas        │ Notif. pagos       │
│ real PWA         │ Sin vergüenza    │ Gym "de primer     │
│                  │                  │ nivel"             │
└──────────────────┴──────────────────┴────────────────────┘
```

---

## 🧩 HMW — "How Might We" Questions

Los "¿Cómo podríamos...?" transforman los problemas en oportunidades de diseño:

**Para el dueño:**
- ¿Cómo podríamos hacer que el cobro sea tan automático que el dueño no tenga que hacer NADA después del setup inicial?
- ¿Cómo podríamos darle al dueño la sensación de tener una "app propia" sin que desarrolle una?
- ¿Cómo podríamos usar el corte de acceso como mecanismo de cobro pasivo?

**Para la recepcionista:**
- ¿Cómo podríamos diseñar el monitor para que la decisión de acceso NO dependa del criterio de la recepcionista?
- ¿Cómo podríamos hacer que un "Rojo" en pantalla sea una "herramienta de comunicación" y no un conflicto personal?

**Para el socio:**
- ¿Cómo podríamos hacer que entrar al gym sea tan rápido como pasar el Sube (SUBE) en el subte?
- ¿Cómo podríamos hacer que el socio OLVIDE que tiene que pagar la cuota porque se paga sola?

**Para el fundador:**
- ¿Cómo podríamos diseñar el onboarding para que el gym vea valor en los primeros 5 minutos?
- ¿Cómo podríamos hacer que el gimnasio SIENTA la pérdida cuando consideran cancelar?

---

## ✅ Definición del MVP (Scope)

### Criterios de priorización: Impacto vs. Esfuerzo

| Feature | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|
| Check-in QR con validación en tiempo real | 🔥 Muy Alto | 🟡 Medio | **MVP** |
| Cobro automático via MP Preapproval | 🔥 Muy Alto | 🟠 Alto | **MVP** |
| Monitor del recepcionista (WebSocket) | 🔥 Muy Alto | 🟡 Medio | **MVP** |
| Panel del dueño (dashboard básico) | 🔥 Alto | 🟡 Medio | **MVP** |
| White-label (colores + logo) | 🟡 Medio | 🟢 Bajo | **MVP** |
| Gestión de planes y precios | 🟡 Medio | 🟢 Bajo | **MVP** |
| Super Admin (Nico) - Panel global | 🟡 Medio | 🟡 Medio | **Post-MVP** |
| App nativa (iOS/Android) | 🔴 Bajo | 🔴 Muy Alto | **No MVP** |
| Inteligencia artificial / reportes avanzados | 🟡 Medio | 🔴 Muy Alto | **No MVP** |
| Control de clases/turnos | 🟡 Medio | 🟠 Alto | **No MVP** |

### MVP definido — Las 6 funcionalidades core:

1. **Autenticación multi-rol** (Dueño, Recepcionista, Socio)
2. **QR Check-in sin hardware** (PWA + escaneo de QR fijo)
3. **Monitor en tiempo real** (WebSocket Supabase Realtime)
4. **Suscripciones automatizadas** (Mercado Pago Preapproval + Webhooks)
5. **Panel de gestión del gym** (Socios, Planes, Ingresos)
6. **White-label básico** (Logo + color primario por gym)
