---
slug: construir-y-sostener-un-saas-en-produccion
title: "Construir y sostener un SaaS: lo que cambia cuando hay clientes pagando"
excerpt: "Hay una diferencia enorme entre construir un producto y sostenerlo un martes a las 3am cuando falla un webhook de pago. Lo que aprendí llevando GymSmartAccess de idea a negocio real."
focusKeyphrase: construir un SaaS
seoTitle: "Construir un SaaS: lo que cambia con clientes pagando"
seoDescription: "Qué cambia entre construir un SaaS y sostenerlo en producción con clientes reales: soporte, deuda técnica y las decisiones que eso condiciona."
ogTitle: "Construir el producto es el 30% del trabajo"
ogDescription: "Lo que cambia cuando un SaaS deja de ser un proyecto y pasa a tener clientes que dependen de que funcione."
coverAlt: "Panel de monitoreo de un SaaS en producción con métricas en tiempo real"
status: published
publishedAt: 2026-12-07
tags: casos, negocio, producto
imagePrompt: "Editorial vector illustration, an abstract dashboard with a heartbeat monitoring line running through geometric building blocks, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Construir un SaaS y sostenerlo son dos trabajos distintos, y casi nadie te lo dice antes de que te toque hacer el segundo. Construir [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios) —mi plataforma para gimnasios independientes, con cobros automáticos y control de acceso por QR— fue quizás el 30% del trabajo real. El otro 70% empezó el día que el primer gimnasio empezó a pagar.

## El día que dejás de ser el único usuario

Mientras desarrollás, sos el usuario más generoso que existe. Sabés qué botón no anda, sabés esperar si algo tarda, sabés que ese error significa "reiniciá el servidor". El día que un dueño de gimnasio real empieza a usar el sistema, nada de eso aplica. Un error que decís "ya sé lo que es" se convierte en un mensaje a las 22:00 diciendo que nadie puede entrar al gimnasio.

Ese cambio de perspectiva es el que más me costó internalizar. No estaba construyendo software. Estaba construyendo algo de lo que otro negocio pasaba a depender para funcionar el lunes a la mañana.

## Lo que significa "sostener" en concreto

**Los webhooks de pago no fallan silenciosamente, fallan a las 2 de la mañana un fin de semana.** Cuando Mercado Pago confirma un pago, el sistema tiene que procesarlo y marcar al socio como al día, sin perder ni un evento. Un webhook perdido no es un bug abstracto. Es un socio que pagó y el sistema le dice que no.

Aprendí a diseñar para que un webhook perdido se pueda reconstruir después, consultando el estado real en Mercado Pago. Es más trabajo por adelantado. Y es la diferencia entre un sistema que se autocorrige y uno que necesita que yo lo note y lo arregle a mano.

**El soporte es parte del producto, no un costo aparte.** Cuando un dueño de gimnasio no entiende por qué un socio no puede entrar, no le importa si el problema es de UX, de datos o de Mercado Pago. Le importa que alguien le conteste rápido y en su idioma. Ese soporte directo me enseñó más sobre los problemas reales del producto que cualquier sesión de research planificada — cada consulta repetida es una señal de que algo en la interfaz no se explica solo.

**La deuda técnica se cobra con interés, no de una vez.** Una decisión apurada en el mes 2 —una tabla sin el índice correcto, una validación que "ya la agrego después"— no se nota hasta el mes 8. Para entonces hay diez veces más datos, y el problema que era invisible se convierte en una consulta que tarda tres segundos.

## Decisiones para sostener un SaaS, no solo para construir un SaaS

Elegí infraestructura administrada —[Supabase](https://supabase.com/), Vercel— en vez de servidores propios, exactamente porque soy un solo desarrollador sosteniendo esto. Un servidor propio es más barato en la factura mensual y más caro en las horas que le dedicás a mantenerlo andando. Esa cuenta cambia completamente cuando el que responde a las 2am sos vos y nadie más.

Elegí automatizar los flujos de webhooks con Make.com en vez de escribir yo cada integración desde cero. El objetivo no era demostrar que podía escribir el código. Era minimizar la superficie de cosas que podían romperse silenciosamente mientras yo dormía.

Elegí un monitor de recepción simple, con estados visuales claros, en vez de un panel con más datos. En producción entendí algo que en desarrollo no se ve: la persona que mira esa pantalla en el mostrador de un gimnasio no tiene tiempo de interpretar un dashboard. Necesita saber en dos segundos si el socio entra o no.

## Lo que un caso de estudio no suele mostrar

La mayoría de los casos de estudio terminan en el lanzamiento, con una foto linda y una lista de resultados. Los resultados reales de GymSmartAccess no son solo los números que muestro en el portafolio —eliminar la morosidad por cobro manual, cero costo de hardware, automatización completa de pagos. Son también las cosas que tuve que arreglar cuando ya estaba en producción. Una consulta que empezó a tardar al pasar de decenas a cientos de socios. Un caso donde dos webhooks de Mercado Pago llegaban en el orden equivocado y duplicaban un estado. Una pantalla del monitor que se leía mal con luz solar directa en la entrada de un gimnasio.

Ninguno de esos problemas apareció en el ambiente de desarrollo. Todos aparecieron con datos y usuarios reales, que es la única forma en que aparecen.

## Por qué esto importa si estás evaluando contratar a alguien

Un desarrollador que solo construyó demos y proyectos de portafolio nunca tuvo que responder un webhook fallido un domingo. Uno que sostiene su propio SaaS en producción sabe, de primera mano, qué decisiones de hoy le van a costar caro dentro de seis meses — y diseña distinto por eso.

No es una garantía de que todo va a salir perfecto. Es la diferencia entre alguien que aprendió esto en teoría y alguien a quien ya le costó plata real no haberlo pensado antes.

El caso completo, con capturas del sistema y los números concretos, está en [el portafolio](/es/proyectos/gymsmartaccess-gestion-gimnasios).
