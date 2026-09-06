---
slug: documentar-decisiones-que-nadie-me-pidio-documentar
title: "Por qué documento decisiones técnicas que nadie me pidió documentar"
excerpt: "Un README que explica por qué se eligió algo, no solo qué se eligió, es la diferencia entre una decisión que se puede revisar con criterio dentro de un año y una que se acepta o se rechaza a ciegas."
focusKeyphrase: documentar decisiones técnicas
seoTitle: "Cómo documentar decisiones técnicas y no solo el resultado"
seoDescription: "Cómo documentar decisiones técnicas: qué contexto guardar, qué alternativas descartadas anotar y bajo qué condición la decisión deja de tener sentido."
ogTitle: "Dentro de un año, nadie va a recordar por qué elegimos esto — ni siquiera yo"
ogDescription: "Por qué documento el razonamiento detrás de una decisión técnica, no solo la decisión misma."
coverAlt: "Documento de arquitectura explicando el razonamiento detrás de una decisión técnica"
status: published
publishedAt: 2027-06-14
tags: casos, producto
imagePrompt: "Editorial vector illustration, an abstract branching decision path with one branch highlighted and annotated, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

El código dice qué se construyó. Casi nunca dice por qué se construyó así y no de otra forma. Documentar decisiones técnicas es, sobre todo, guardar la respuesta a esa segunda pregunta. Es la que más falta hace cuando alguien —incluido yo mismo, meses después— tiene que decidir si una decisión vieja sigue teniendo sentido.

## El problema que esto resuelve

Sin el razonamiento escrito, cada decisión técnica se vuelve una caja negra con el tiempo. Alguien mira el código y ve que se eligió PostgreSQL en vez de MongoDB. No tiene forma de saber si fue una decisión meditada contra restricciones específicas, o lo primero que se me ocurrió un martes apurado. Sin ese contexto, la opción más segura es no tocarlo nunca, aunque las restricciones originales ya hayan cambiado.

## Qué anotar al documentar decisiones técnicas

**El contexto del momento, no solo la decisión.** Qué restricciones existían, qué alternativas se evaluaron y qué información faltaba entonces. Cuando elegí Mercado Pago para [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios) en vez de Stripe, documenté la razón concreta: el mercado objetivo cobra y paga en pesos argentinos. No escribí "usamos Mercado Pago", escribí por qué esa era la opción correcta en ese contexto.

**Qué se descartó, y por qué.** Es tan importante como lo que se eligió. Si alguien propone Stripe seis meses después sin saber que ya se evaluó, se repite una discusión entera. Y el costo no es la discusión en sí: es volver a llegar a la misma conclusión con menos información que la primera vez.

**Bajo qué condición la decisión dejaría de tener sentido.** Esto es lo que más valor tiene y lo que menos se escribe. Un ejemplo concreto: "elegimos esto asumiendo un volumen bajo de transacciones; si el volumen crece diez veces, hay que revisarlo". Eso le da a quien lo lea un criterio objetivo para reabrir la conversación, en vez de tener que adivinar si el momento ya llegó.

## Dónde vive esta documentación

No en un documento aparte que nadie vuelve a abrir. La pongo lo más cerca posible del código que documenta: comentarios en el archivo relevante, o un archivo de decisiones de arquitectura dentro del mismo repositorio.

El formato que sigo es el de los [architecture decision records](https://adr.github.io/): una página corta por decisión, con contexto, opciones y consecuencias. Así quien lee el código tiene el porqué a un clic de distancia, no en un wiki externo que se desactualiza sin que nadie lo note.

## El costo de no hacerlo

Cuando alguien vuelve a una decisión vieja sin el contexto, hay dos caminos y los dos son malos. Uno es rehacer la decisión desde cero, perdiendo el análisis que ya estaba hecho. El otro es dejarla intacta por miedo a romper algo que no se termina de entender, aunque las condiciones que la justificaban hayan cambiado por completo.

Los dos cuestan lo mismo: tiempo de alguien que ya no tiene la información que existía cuando la decisión se tomó.

## Por qué esto no es burocracia

La objeción obvia es que agrega trabajo a cada decisión, y es cierto. Pero es trabajo que se paga una sola vez, mientras el contexto todavía está fresco en la cabeza de quien decidió. La alternativa es pagarlo muchas veces, cada vez que alguien reconstruye ese contexto desde cero.

Es la misma lógica que aplico al [escribir un caso de estudio para gente no técnica](/es/blog/como-escribo-un-caso-de-estudio-que-entienda-alguien-sin-fondo-de-diseno): explicar bien el porqué una vez ahorra explicarlo mal diez veces.

## La regla que aplico

Documento cualquier decisión que costaría más de diez minutos explicar de memoria dentro de seis meses. Si es obvia y no admite alternativa razonable, no hace falta explicarla.

Si alguien podría preguntar razonablemente "¿por qué no lo hicimos de la otra forma?", esa pregunta merece una respuesta escrita. Mejor antes de que alguien tenga que hacerla en voz alta, sin contexto, meses después.

El mismo criterio aplicado al alcance en vez de a la arquitectura lo escribí en [de idea a MVP](/es/blog/de-idea-a-mvp-que-construir).
