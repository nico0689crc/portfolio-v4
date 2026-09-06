---
slug: como-uso-ia-en-mi-flujo-sin-perder-el-criterio
title: "Cómo uso IA en mi flujo de trabajo sin perder el criterio"
excerpt: "La IA no reemplaza el criterio técnico, lo pone a prueba más seguido. Dónde la uso, dónde no, y por qué la pregunta correcta no es cuánto acelera sino qué decisiones sigue tomando una persona."
focusKeyphrase: IA en desarrollo de software
seoTitle: "IA en desarrollo de software, sin perder el criterio"
seoDescription: "Dónde uso IA en desarrollo de software y dónde no, con el criterio que aplico para que acelere sin reemplazar las decisiones que importan."
ogTitle: "La IA que más rápido escribe código es la que menos deberías dejar sola"
ogDescription: "Dónde integro IA en mi flujo de trabajo, y las tres preguntas que uso antes de aceptar lo que genera."
coverAlt: "Editor de código con una sugerencia de IA junto a una revisión manual"
status: published
publishedAt: 2026-11-23
tags: ia, producto
imagePrompt: "Editorial vector illustration, an abstract hand guiding a stream of geometric code fragments through a checkpoint gate, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

La pregunta que me hacen más seguido sobre IA en desarrollo de software no es si la uso: eso ya se asume. Es si confío en lo que genera. La respuesta corta es que no, y esa desconfianza específica es lo que la hace útil en vez de riesgosa.

## Dónde uso IA en desarrollo de software todos los días

**Para acelerar lo mecánico.** Boilerplate, estructura repetitiva de componentes, migrar un patrón que ya definí a un caso nuevo. Ahí la IA hace en segundos lo que a mano me llevaría minutos. El riesgo de que se equivoque es bajo porque el patrón ya está decidido: solo lo está aplicando.

**Para explorar arquitecturas antes de comprometerme.** Cuando evalúo un enfoque nuevo, le pido a la IA que genere una versión rápida de dos o tres alternativas. No para usar el código que produce, sino para ver más rápido los trade-offs de cada camino antes de invertir horas reales en uno.

**Para depurar con otra perspectiva.** Pegar un error y pedir hipótesis de causa es más rápido que buscar en foros. Sirve sobre todo para errores de configuración o dependencias, donde la respuesta ya existe en algún lado y solo hay que encontrarla.

**Para prototipar interfaces rápido.** Ir de una idea de diseño a un primer HTML navegable en minutos, para poder discutirlo con algo concreto en vez de una descripción abstracta.

## Dónde no la uso, o la uso con mucho más cuidado

**Decisiones de arquitectura que van a vivir años.** Cuando elegí el stack de [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios), la decisión dependía de restricciones muy específicas de mi negocio: costo de infraestructura, que un solo desarrollador lo sostenga, cobros recurrentes en Argentina. Una IA no tiene ese contexto salvo que se lo dé explícitamente, y para cuando se lo di todo, la decisión ya la había tomado yo — la IA en el mejor caso confirma un razonamiento que ya hice, no lo reemplaza.

**Código que toca dinero o datos sensibles.** Un webhook de pago, una validación de permisos. Ahí reviso cada línea como si la hubiera escrito alguien en quien no confío del todo, porque es exactamente esa la relación correcta con código generado en un lugar donde un error no es un bug molesto sino plata perdida de un cliente real.

**Cualquier cosa donde "parece razonable" no alcanza.** La IA es notablemente buena generando código que **se ve correcto** y notablemente mala explicando por qué debería confiar en que lo es. Para código crítico, necesito entender el razonamiento, no solo el resultado.

## Las tres preguntas que me hago antes de aceptar algo que generó

**¿Entiendo por qué funciona, no solo que funciona?** Si no puedo explicar la lógica sin mirar el código de nuevo, no lo acepto todavía. Aceptar código que no entiendo es acumular deuda técnica invisible: funciona hoy, y el día que falle, nadie —ni siquiera yo— va a saber por qué.

**¿Qué asumió que yo no le dije?** La IA rellena los huecos de contexto con supuestos razonables mirados en el vacío, pero que raramente coinciden con las restricciones reales de mi proyecto. Reviso específicamente qué asumió, porque ahí es donde se esconden los errores más silenciosos.

**¿Esto es exactamente lo que necesito, o es lo genérico que se parece?** Muchas veces el código generado resuelve un problema similar y razonable, pero no el problema específico que tengo. Se ve bien, pasa una revisión rápida, y falla en el caso particular que sí importa.

## El efecto que menos se habla

Según la [encuesta de Stack Overflow](https://survey.stackoverflow.co/2024/ai), la mayoría de los desarrolladores ya usa estas herramientas a diario, así que la ventaja no está en usarlas. Lo que más cambió mi trabajo no fue la velocidad para escribir código. Fue que, al delegar la escritura mecánica, me quedó más energía para las dos partes que de verdad importan: la experiencia de usuario y la calidad estructural de lo que estoy construyendo. Escribir código más rápido no vale nada si el diseño detrás está mal pensado — la IA no arregla eso, solo lo produce más rápido.

## La regla que resume todo esto

Uso la IA para producir opciones más rápido, nunca para tomar la decisión final. La decisión sigue siendo mía porque soy yo quien entiende las restricciones reales del proyecto, y esas restricciones casi nunca están completas en el prompt que le escribí.
