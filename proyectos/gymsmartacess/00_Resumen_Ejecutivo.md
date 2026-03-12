# GymAccess — Resumen Ejecutivo del Proceso de Diseño

> **Versión:** 1.0  
> **Fecha:** Marzo 2026  
> **Metodología:** Design Thinking (Stanford d.school)  
> **Stack:** Next.js (App Router) + Tailwind + shadcn/ui · Supabase · Vercel · Mercado Pago · Make.com

---

## ¿Qué es GymAccess?

**GymAccess** es una plataforma SaaS B2B2C diseñada para modernizar los gimnasios independientes de Latinoamérica. Reemplaza procesos de los años 90 —Excel, efectivo, carnets de papel— por un ecosistema digital de cobros automatizados, control de acceso sin hardware y gestión marca blanca.

---

## El Problema Central

Los gimnasios independientes en Argentina (y LATAM) pierden entre el **10% y el 20% de sus ingresos anuales** por:

| Problema | Impacto |
|---|---|
| Morosidad | Dueños persiguen pagos los primeros 10 días del mes |
| Fraude de acceso | Un 15% de los socios "presta" el carnet |
| Inflación | El efectivo cobrado tarde pierde valor real |
| Alto CAPEX | Los molinetes biométricos cuestan +USD 2.000 |

---

## La Solución

Un trío de productos bajo una sola plataforma:

1. **Panel del Gimnasio (B2B):** Dashboard de gestión, socios, planes y pagos.
2. **PWA del Socio (B2C):** Escáner QR sin descarga, acceso directo desde el navegador.
3. **Monitor del Recepcionista (Ops):** Pantalla en tiempo real que muestra VERDE 🟢 o ROJO 🔴 al escanear.

---

## Modelo de Negocio

```
Gimnasio paga al SaaS (Nico) → Membresía mensual por plataforma
          ↓
Socio paga al Gimnasio → Suscripción automatizada via Mercado Pago
```

**Ingresos del SaaS:** Cobro mensual por sede activa (B2B).  
**Prueba gratuita:** 30 días para incentivar adopción masiva.

---

## Documentos del Proceso

| N° | Fase Design Thinking | Documento |
|---|---|---|
| 01 | Empatizar | `01_Empatizar.md` |
| 02 | Definir | `02_Definir.md` |
| 03 | Idear | `03_Idear.md` |
| 04 | Prototipar | `04_Prototipar.md` |
| 05 | Testear | `05_Testear.md` |
| 06 | Arquitectura Técnica | `06_Arquitectura_Tecnica.md` |
| 07 | Estrategia de Negocio | `07_Estrategia_Negocio.md` |

---

> **Nota:** Este proceso de diseño sigue la metodología completa del **Design Thinking** de la Escuela d.school de Stanford, adaptada al contexto B2B2C de un SaaS para el mercado latinoamericano.
