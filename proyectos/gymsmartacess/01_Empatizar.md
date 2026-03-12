# Fase 1: EMPATIZAR — Entendiendo a Nuestros Usuarios

> **Objetivo:** Conocer en profundidad los contextos, motivaciones, frustraciones y comportamientos de cada arquetipo de usuario antes de diseñar cualquier solución.

---

## ¿Por qué empatizar primero?

El error más común en productos de software es asumir que conocemos el problema. El Design Thinking nos obliga a salir del edificio y entender la realidad del usuario con humildad. En GymAccess, esto significa entender que el dueño del gimnasio no busca "tecnología", busca **no tener que perseguir morosos el 5 de cada mes.**

---

## 👥 Los 4 Arquetipos de Usuario

### 👤 Arquetipo 1: El Dueño del Gimnasio (Cliente Principal B2B)

**Nombre ficticio:** Roberto, 42 años, dueño de "Iron House Gym", CABA.

#### Contexto de Vida
Roberto fundó su gimnasio hace 8 años. Tiene 200 socios activos, 3 empleados y trabaja 12 horas por día. No es tecnólogo; usa WhatsApp para comunicar aumentos de cuotas y una planilla de Excel para registrar pagos. Su hijo le sugirió "hacer una app" pero no sabe por dónde empezar.

#### Mapa de Empatía

| Dimensión | Detalle |
|---|---|
| **¿Qué ve?** | Sus competidores más grandes con apps propias. Gimnasios cadena que ofrecen apps de clase mundial. |
| **¿Qué escucha?** | "Hay mucho efectivo en el mostrador". "Fulano entró sin pagar". "El sistema se cayó". |
| **¿Qué piensa y siente?** | Miedo a quedar obsoleto. Frustración por la morosidad. Orgullo por lo que construyó. Deseo de escalar. |
| **¿Qué dice y hace?** | Avisa aumentos por WhatsApp grupal. Revisa la planilla cada noche. Da acceso a deudores "por las dudas que paguen". |

#### Pain Points (Dolores) — Profundidad

1. **Morosidad Crónica:** De sus 200 socios, 40-50 están en mora en algún punto del mes. Recuperar ese dinero le consume entre 3 y 5 horas de llamadas y mensajes cada mes.

2. **Fraude de Acceso:** Al menos 15-20 socios le "prestan" el carnet a familiares o amigos. Eso representa ~$300 USD al mes en servicios no cobrados.

3. **Inflación vs Efectivo:** Si cobra el día 15, el valor real del peso ya cayó un 3-5% desde el 1ro. En un país con 100%+ de inflación anual, el tiempo de cobro importa.

4. **Alto Costo de Modernización:** Una solución "enterprise" (molinetes + software) cuesta entre USD 3.000 y USD 8.000 de inversión inicial, más mantenimiento. Es inaccesible.

5. **Imagen de Marca:** Ve la app de un gimnasio de cadena y piensa "yo nunca voy a poder tener eso". Eso afecta su percepción de competitividad.

#### Gains (Deseos y Aspiraciones)

- Cobros automáticos que lleguen a su cuenta sin tener que preguntar.
- Un sistema que "cuide solo" el acceso, sin depender de que el recepcionista esté atento.
- Poder decir "tengo mi propia app" frente a sus socios.
- Visualizar sus ingresos del mes en tiempo real desde el celular.

#### Citaciones Clave (Voz del Usuario)
> _"El primer problema no es retener socios, es cobrarles."_  
> _"Si pudiera automatizar los cobros, me cambiaría la vida."_  
> _"No quiero gastar 5.000 dólares en un molinete. Quiero algo simple."_

---

### 👤 Arquetipo 2: La Recepcionista (Usuario Operativo)

**Nombre ficticio:** Sofía, 24 años, trabaja en turno tarde (17-21hs), estudiante universitaria.

#### Contexto de Vida
Sofía trabaja 4 horas por día en el gym. El pico es de 18 a 20hs donde llegan 30-40 personas en 2 horas. Usa su teléfono para chatear entre medio. No le interesa "el sistema" más de lo estrictamente necesario. Si algo falla, siente que la culpa la van a echar a ella.

#### Mapa de Empatía

| Dimensión | Detalle |
|---|---|
| **¿Qué ve?** | Una fila que crece. Gente que la mira esperando. El dueño controlando por cámara. |
| **¿Qué escucha?** | "Yo ya pagué, te lo puedo demostrar por WhatsApp". "Pero ayer Roberto me dejó entrar". "Siempre hay problema con este sistema". |
| **¿Qué piensa y siente?** | Estrés en horas pico. No quiere conflictos con socios. Miedo a cometer errores que le cuesten el trabajo. |
| **¿Qué dice y hace?** | Deja pasar a socios deudores "para no discutir". Llama al dueño cuando hay dudas. Anota en un papel quién entró. |

#### Pain Points

1. **Sobrecarga en horas pico:** Atender 1 cliente cada 2-3 minutos durante 2 horas es agotador. Verificar el estado de pago manualmente (buscar en Excel, WhatsApp, etc.) tritura el ritmo.

2. **Conflictos con socios:** Nadie quiere ser "el policía malo". Negarle el acceso a alguien que afirma haber pagado es un momento de tensión que Sofía evita a cualquier costo — incluso dejando pasar a deudores.

3. **Responsabilidad sin herramientas:** Roberto le pide que "no deje entrar morosos" pero no le da un sistema confiable para verificarlo en tiempo real.

#### Gains

- Un sistema **pasivo**: no preguntar nombres, no buscar en listas. Solo mirar una pantalla verde o roja.
- Sonido de confirmación para no tener que estar mirando la pantalla todo el tiempo.
- Poder mostrarle al socio "el sistema dice que no", quitándose el peso de la decisión.

#### Citaciones Clave
> _"Si el sistema me dice que no pasa, no pasa. Pero ahora no tengo nada."_  
> _"En las horas pico es un caos. No me da para verificar uno por uno."_

---

### 👤 Arquetipo 3: El Socio (Usuario Final B2C)

**Nombre ficticio:** Lucas, 28 años, trabaja en relación de dependencia, va al gym 4 veces por semana.

#### Contexto de Vida
Lucas es un usuario tech-friendly pero que no tolera fricción. Usa Netflix, Spotify y tiene 5 apps de delivery. La experiencia del gym le importa, pero el trámite administrativo del gym le parece un anacronismo. Olvidó pagar la cuota el mes pasado porque "se le pasó".

#### Mapa de Empatía

| Dimensión | Detalle |
|---|---|
| **¿Qué ve?** | Filas en la entrada. El recepcionista buscando en una lista. Sus compañeros entrando rápido. |
| **¿Qué escucha?** | "Mostrame el carnet". "No aparecés en la lista, ¿pagaste?". "Llame al teléfono para abonar". |
| **¿Qué piensa y siente?** | Vergüenza de rebotar en la puerta. Incomodidad de no recordar si pagó. Bronca de tener que descargar "otra app". |
| **¿Qué dice y hace?** | Paga cuando se acuerda. Se olvidó el carnet y trató de "zafar con nombre y apellido". Prefiere transferir. |

#### Pain Points

1. **Olvido de pago:** No hay recordatorio proactivo. Si no lo recuerda el día de vencimiento, puede quedar en mora sin querer.
2. **Fricción en la entrada:** Buscar el carnet o esperar que te "ubiquen en la lista" es humillante e ineficiente.
3. **Barrera de descarga:** "¿Tengo que descargar una app del gimnasio? No, gracias."
4. **Vergüenza de la mora:** Que el recepcionista diga en voz alta "sos moroso" frente a otros socios es socialmente costoso.

#### Gains

- **Cero fricción:** Abrir el celular, escanear, entrar. Menos de 5 segundos.
- **PWA (no descarga):** Acceso directo desde el navegador, como un ícono en la pantalla de inicio.
- **Débito automático:** Que la cuota "se pague sola" como Spotify o Netflix.
- **Autopercepción de pertenencia:** Sentir que su gym tiene tecnología de primer nivel.

#### Citaciones Clave
> _"Si el gym tuviera algo como el QR del subte, sería ideal."_  
> _"No voy a descargar otra app para el gym. Ya tengo 80."_  
> _"Me olvidé de pagar este mes. No me enteré hasta que me frenaron en la puerta."_

---

### 👤 Arquetipo 4: El Fundador del SaaS (Super Admin)

**Nombre ficticio:** Nico, 32 años, emprendedor tech, fundador de GymAccess.

#### Contexto de Vida
Nico tiene visión de producto y background en tecnología. Su objetivo es crear un negocio de SaaS escalable con MRR predecible. Su dolor principal hoy es construir el sistema sin perder calidad, y su dolor futuro será la cobranza a los propios gimnasios.

#### Mapa de Empatía

| Dimensión | Detalle |
|---|---|
| **¿Qué ve?** | Gimnasios sin digitalizar en cada esquina. Competencia nula en LATAM independiente. Un mercado virgen. |
| **¿Qué escucha?** | "¿Y si los gymnasios no pagan el SaaS?" "¿Cómo escalás?". "¿Diferencia con un cobrador de cuotas digital?". |
| **¿Qué piensa y siente?** | Entusiasmo por el potencial. Ansiedad por el tiempo de desarrollo. Claridad sobre el problema. |

#### Pain Points

- Lidiar con gimnasios que usan el sistema pero no pagan la mensualidad.
- La tentación de agregar features y perderse del MVP.
- Dependencia de terceros (Mercado Pago, Supabase).

#### Gains

- Dashboard global con todos los gimnasios activos, MRR y salud de la plataforma.
- Sistema de suspensión automática del acceso si el gym no paga (la mejor herramienta de cobranza es el leverage).
- Onboarding en menos de 10 minutos para que los gym se "enganchen" antes de pensar en costos.

---

## 🔍 Investigación de Campo (Plan de Validación)

Antes de construir el MVP, recomendamos realizar:

### Entrevistas (mínimo 5 por arquetipo)

**Guía de preguntas — Dueño de Gimnasio:**
1. ¿Cómo registrás hoy los pagos de tus socios?
2. ¿Cuánto tiempo te lleva recuperar pagos atrasados en un mes típico?
3. ¿Tuviste casos de acceso fraudulento? ¿Cómo los detectaste?
4. Si pudieras cambiar una sola cosa del día a día administrativo, ¿cuál sería?
5. ¿Por qué no usás un sistema de cobro automático hoy?

**Guía de preguntas — Recepcionista:**
1. Describime una tarde de hora pico. ¿Qué pasa?
2. ¿Cómo verificás hoy si alguien puede entrar?
3. ¿Alguna vez dejaste pasar a alguien que no debería haber entrado? ¿Por qué?
4. ¿Qué herramienta te simplificaría el trabajo?

**Guía de preguntas — Socio:**
1. ¿Cómo pagás la cuota del gym hoy?
2. ¿Alguna vez te olvidaste de pagar? ¿Qué pasó?
3. ¿Qué pensarías si tu gym tuviera acceso por QR con el celular?
4. ¿Descargás apps de servicios locales? ¿Por qué sí/no?

### Observación Etnográfica
- Pararse en la recepción de un gym en hora pico y documentar el proceso real de check-in.
- Medir el tiempo promedio por persona.
- Contar cuántos "conflictos" de acceso ocurren en 2 horas.

---

## 📊 Insights Clave de la Fase de Empatía

1. **El dueño no compra tecnología; compra tiempo y tranquilidad.** El pitch debe ser "recuperá 5 horas por mes", no "sumate a la transformación digital".

2. **El recepcionista es el eslabón débil del sistema de seguridad actual.** No por negligencia, sino porque no tiene herramientas. Darle "excusa tecnológica" para negar acceso es un superpoder.

3. **La PWA es la clave de adopción del socio.** La resistencia a descargar apps es real y documentada. El modelo "abrir en el navegador y guardar en pantalla de inicio" elimina esa fricción.

4. **La foto del socio en el monitor del recepcionista es el anti-fraude más poderoso.** No importa qué muestre el celular del impostor: si la cara no coincide con la foto en la pantalla de Sofía, no entra.
