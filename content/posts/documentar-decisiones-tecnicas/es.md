---
slug: documentar-decisiones-que-nadie-me-pidio-documentar
title: "Por qué documento decisiones técnicas que nadie me pidió documentar"
excerpt: "Un README que explica por qué se eligió algo, no solo qué se eligió, es la diferencia entre una decisión que se puede revisar con criterio dentro de un año y una que se acepta o se rechaza a ciegas."
focusKeyphrase: documentar decisiones técnicas
seoTitle: "Por qué documentar el porqué de una decisión técnica, no solo el qué"
seoDescription: "Qué documento en cada decisión técnica de arquitectura que tomo, más allá del código, y por qué esa documentación se paga sola meses después."
ogTitle: "Dentro de un año, nadie va a recordar por qué elegimos esto — ni siquiera yo"
ogDescription: "Por qué documento el razonamiento detrás de una decisión técnica, no solo la decisión misma."
coverAlt: "Documento de arquitectura explicando el razonamiento detrás de una decisión técnica"
status: published
publishedAt: 2027-08-16
tags: casos, producto
imagePrompt: "Editorial vector illustration, an abstract branching decision path with one branch highlighted and annotated, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

El código dice qué se construyó. Casi nunca dice por qué se construyó así en vez de de otra forma, y esa segunda pregunta es la que más falta hace contestar cuando alguien —incluido yo mismo, meses después— tiene que decidir si una decisión vieja sigue teniendo sentido o ya no.

## El problema que esto resuelve

Sin documentar el razonamiento, cada decisión técnica se vuelve una caja negra con el tiempo. Alguien mira el código, ve que se eligió PostgreSQL en vez de MongoDB, y no tiene forma de saber si esa elección fue una decisión meditada contra restricciones específicas, o simplemente lo primero que se me ocurrió un martes apurado. Sin ese contexto, la opción más segura es no tocarlo nunca, aunque las restricciones que motivaron la decisión original ya hayan cambiado.

## Lo que documento, específicamente

**El contexto en el momento de decidir, no solo la decisión.** Qué restricciones existían, qué alternativas se evaluaron, y qué información faltaba en ese momento que hoy podría estar disponible. Cuando elegí Mercado Pago para GymSmartAccess en vez de Stripe, documenté que la razón era que el mercado objetivo cobra y paga en pesos argentinos — no solo "usamos Mercado Pago", sino por qué esa era la opción correcta dado el contexto específico.

**Qué se descartó, y por qué.** Es tan importante como lo que se eligió. Si alguien propone Stripe seis meses después sin saber que ya se evaluó y se descartó por una razón específica, se repite una discusión que ya se tuvo, gastando tiempo en volver a llegar a la misma conclusión.

**Bajo qué condición esta decisión dejaría de tener sentido.** Esto es lo que más valor tiene y lo que menos se documenta. "Elegimos esto asumiendo un volumen bajo de transacciones; si el volumen crece diez veces, esta decisión hay que revisarla" le da a quien lea el documento después un criterio objetivo para saber cuándo reabrir la conversación, en vez de tener que adivinar si el momento de reconsiderar ya llegó.

## Dónde vive esta documentación

No en un documento aparte que nadie vuelve a abrir. La pongo lo más cerca posible del código que documenta —comentarios en el archivo relevante, o un archivo de decisiones de arquitectura dentro del mismo repositorio— para que quien esté leyendo el código tenga el contexto a un clic de distancia, no en un wiki externo que se desactualiza sin que nadie lo note.

## El costo de no hacerlo, con un ejemplo real

Sin esta documentación, cuando alguien —o yo mismo— vuelve a una decisión vieja sin recordar el contexto, hay dos caminos, y los dos son malos: rehacer la decisión desde cero, perdiendo el trabajo de análisis que ya se había hecho, o dejarla intacta por miedo a romper algo que no se termina de entender, aunque las condiciones que la justificaban ya hayan cambiado completamente.

## Por qué esto no es burocracia

La objeción obvia es que esto agrega trabajo a cada decisión, y en efecto lo hace. Pero es trabajo que se paga una sola vez, en el momento en que el contexto todavía está fresco en la cabeza de quien decidió, en vez de pagarse muchas veces —cada vez que alguien necesita reconstruir ese contexto desde cero, sin la información que existía en el momento original.

## La regla que aplico

Documento cualquier decisión que costaría más de diez minutos explicar de memoria dentro de seis meses. Si la decisión es obvia y no admite alternativa razonable, no hace falta explicarla. Si alguien podría razonablemente preguntar "¿por qué no lo hicimos de la otra forma?", esa pregunta merece una respuesta escrita antes de que alguien tenga que hacerla en voz alta, sin contexto, meses después.
