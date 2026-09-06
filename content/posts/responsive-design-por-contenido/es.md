---
slug: dejar-de-pensar-en-breakpoints-y-pensar-en-contenido
title: "Dejé de pensar en breakpoints y empecé a pensar en contenido"
excerpt: "Diseñar para 'celular, tablet, desktop' asume tres tamaños fijos que casi ningún dispositivo real respeta. El criterio que cambia todo es preguntarse cuándo el contenido empieza a romperse, no en qué ancho de pantalla."
focusKeyphrase: diseño responsive
seoTitle: "Diseño responsive: por qué pensar en contenido en vez de breakpoints"
seoDescription: "Por qué los tres breakpoints fijos de celular, tablet y desktop no reflejan cómo se usa un sitio en la práctica, y el criterio de diseñar según dónde el contenido se rompe."
ogTitle: "Ningún dispositivo real respeta tus tres breakpoints"
ogDescription: "El cambio de criterio que hice en diseño responsive: de tamaños fijos de pantalla a puntos donde el contenido realmente se rompe."
coverAlt: "Layout de interfaz adaptándose fluidamente entre distintos anchos de pantalla"
status: published
publishedAt: 2027-05-03
tags: diseno-ui, react
imagePrompt: "Editorial vector illustration, an abstract flexible grid of blocks reflowing smoothly across a continuous width gradient, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Durante años diseñé pensando en tres tamaños: celular, tablet, desktop. Es el modelo mental que enseña casi todo tutorial de diseño responsive, y tiene un problema que se nota apenas se prueba en dispositivos reales: casi ningún dispositivo respeta esas tres categorías limpiamente.

## El problema del modelo de tres tamaños

Un celular en horizontal tiene más ancho que una tablet en vertical. Una ventana de navegador en una laptop puede tener exactamente el ancho de una tablet, sin ser ninguna de las dos cosas. El modelo de "diseñá para estos tres tamaños" asume categorías de dispositivo que no existen en el ancho real que la interfaz recibe — recibe un número de píxeles, no una etiqueta de "esto es un celular".

## El cambio de pregunta

En vez de preguntarme "¿cómo se ve esto en celular?", empecé a preguntarme "¿en qué ancho específico este layout empieza a romperse?". La diferencia es que la segunda pregunta tiene una respuesta objetiva y verificable —achico la ventana del navegador hasta que algo se superpone, se corta, o dos elementos que necesitan espacio dejan de tenerlo— mientras que la primera depende de qué dispositivo específico elegí para probar, que es una muestra arbitraria de todos los anchos posibles.

Los breakpoints que uso salen de ese punto de quiebre real, no de una convención de "600px es tablet". Si un layout de tres columnas empieza a apretarse en 850px, ese es mi breakpoint, sin importar si coincide con ningún dispositivo de referencia.

## Cómo esto cambia el proceso de diseño

**Diseño con contenido real, no con un mockup de ancho fijo.** Un título corto y uno largo pueden romper un layout en anchos completamente distintos. Diseñar con "Título de ejemplo" en vez del título real que va a tener esa pantalla esconde justamente el caso que va a romperse en producción.

**Pruebo achicando gradualmente, no saltando entre tres tamaños.** Arrastro el borde de la ventana del navegador lentamente desde ancho completo hasta angosto, mirando en qué punto exacto algo dejó de verse bien. Saltar directamente a 375px de ancho —el tamaño de un iPhone de referencia— salta por encima de todos los anchos intermedios donde el layout también tiene que funcionar, porque ahí es exactamente donde vive una ventana de navegador redimensionada en una laptop.

**El contenido decide el layout, no al revés.** Si una tarjeta necesita mostrar un título, una imagen y tres metadatos, el layout se adapta para que esos tres elementos quepan legibles en cualquier ancho, en vez de forzar el contenido a entrar en una grilla de columnas fijas que se pensó primero.

## Un ejemplo concreto en este mismo portafolio

La grilla del blog usa `md:grid-cols-2` — dos columnas a partir de cierto ancho, una antes de eso. Ese punto de quiebre no salió de "tablet empieza en tal ancho". Salió de probar en qué punto una tarjeta con portada, título y bajada se volvía demasiado angosta para leerse cómodamente en dos columnas, y ese ancho específico es el breakpoint, sin que le importe si coincide con ningún dispositivo de catálogo.

## El límite de este enfoque

Pensar en contenido no elimina la necesidad de tener algún set consistente de breakpoints en el proyecto — sin eso, cada componente termina con su propio punto de quiebre arbitrario y el sistema se vuelve inconsistente, algo parecido a lo que describí sobre [tokens de diseño](/es/blog/design-tokens-figma-a-tailwind) en general. La diferencia es que esos breakpoints del sistema se calibran mirando varios componentes reales del proyecto y encontrando dónde coinciden sus puntos de quiebre naturales, no adoptando una convención genérica de la industria sin verificarla contra el contenido real que el proyecto tiene.
