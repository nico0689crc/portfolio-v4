---
slug: automatizar-webhooks-de-pago-sin-un-servidor-propio
title: "Automatizar webhooks de pago sin mantener un servidor propio"
excerpt: "Escribir yo cada integración de webhooks hubiera demostrado que sé programarlos. Automatizarlos con una herramienta externa redujo la superficie de cosas que se pueden romper mientras duermo, que era el objetivo real."
focusKeyphrase: automatizar webhooks de pago
seoTitle: "Automatizar webhooks de pago: por qué no escribí un servidor propio"
seoDescription: "Por qué elegí automatizar el flujo de webhooks de Mercado Pago con una herramienta externa en vez de escribir un servidor propio, y qué gané y qué perdí con esa decisión."
ogTitle: "El objetivo no era demostrar que podía escribir el código"
ogDescription: "Por qué automaticé los webhooks de pago con una herramienta externa en vez de mantener un servidor propio."
coverAlt: "Diagrama de flujo de un webhook de pago pasando por una automatización sin servidor"
status: published
publishedAt: 2027-04-19
tags: casos, negocio, nextjs
imagePrompt: "Editorial vector illustration, an abstract payment event flowing through automated gears instead of a server rack, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Cuando construí el flujo de cobros de [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios), tenía dos caminos técnicamente válidos para procesar los webhooks de Mercado Pago: escribir yo el servidor que los recibe, valida y procesa, o automatizar el flujo con una herramienta externa. Elegí la segunda, y la razón no fue que no supiera escribir la primera.

## Por qué esta decisión no es sobre capacidad técnica

Escribir un endpoint que recibe un webhook, valida su firma, y actualiza el estado del socio en la base de datos no es difícil. Es exactamente el tipo de código que demuestra que uno sabe programar, y en otro contexto —un proyecto donde necesitaba mostrar profundidad técnica específica— lo hubiera escrito a mano sin dudar.

Pero el objetivo acá no era demostrar nada. Era minimizar la cantidad de cosas que podían fallar silenciosamente mientras yo no estaba mirando, siendo el único que sostiene el sistema. Esa restricción cambió completamente cuál era la decisión correcta.

## El costo real de un servidor propio para esto

Un servidor propio que procesa webhooks necesita: manejo de reintentos si Mercado Pago no recibe una confirmación a tiempo, logging para poder investigar qué pasó cuando algo falla, alertas para enterarme si algo se cae, y actualizaciones de seguridad continuas en la infraestructura que lo corre. Ninguna de esas cuatro cosas es la lógica de negocio en sí — son todo el andamiaje alrededor que hace que la lógica de negocio funcione de forma confiable.

Escribir esa lógica de negocio me hubiera tomado un día. Construir y mantener el andamiaje alrededor, para que fuera confiable en producción sin que yo tuviera que monitorearlo activamente, era el trabajo real y recurrente.

## Lo que gané automatizando el flujo con Make.com

Los reintentos, el logging y las alertas ya vienen resueltos por la herramienta, probados en producción por muchos más casos de uso que los míos. Mi trabajo se redujo a definir el flujo de negocio específico —qué hacer con cada tipo de evento de Mercado Pago— sin tener que reconstruir la infraestructura de confiabilidad alrededor.

Esto conecta directamente con lo que escribí en [construir y sostener un SaaS](/es/blog/construir-y-sostener-un-saas-en-produccion): un webhook perdido a las 2am no es un error abstracto, es un socio que pagó y el sistema le dice que no. Reducir la superficie de código propio que puede fallar en ese camino crítico fue una decisión directamente alineada con esa restricción de sostenibilidad, no una preferencia estética por "menos código".

## Lo que perdí, sin esconderlo

Menos control granular sobre el comportamiento exacto en casos límite muy específicos. Si Mercado Pago cambia algo en su API de una forma que la herramienta de automatización todavía no soporta, dependo de que ellos lo actualicen, en vez de poder parchear mi propio código inmediatamente. Y hay un costo mensual por el servicio que no existiría si todo corriera en mi propia infraestructura.

Para el tamaño y la etapa de este proyecto, ese trade-off tenía sentido. Para un proyecto con volumen mucho mayor, donde el costo de la herramienta externa creciera más rápido que el ahorro en tiempo de mantenimiento, la decisión correcta cambiaría — y ese es exactamente el punto: no hay una respuesta universal, hay una respuesta correcta para las restricciones específicas de cada proyecto.

## El criterio que uso para decisiones como esta

Me pregunto qué parte del trabajo es la que realmente diferencia mi producto, y qué parte es infraestructura genérica que cualquier sistema similar necesita resolver igual. Escribo la primera. Para la segunda, prefiero una herramienta ya probada por otros miles de casos, aunque eso signifique menos código propio para mostrar. El objetivo de un proyecto real nunca es maximizar cuánto código escribí — es que funcione de forma confiable con el tiempo que tengo para sostenerlo.
