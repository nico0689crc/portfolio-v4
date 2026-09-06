---
slug: dejar-de-pensar-en-breakpoints-y-pensar-en-contenido
title: "Dejé de pensar en breakpoints y empecé a pensar en contenido"
excerpt: "Diseñar para 'celular, tablet, desktop' asume tres tamaños fijos que casi ningún dispositivo real respeta. El criterio que cambia todo es preguntarse cuándo el contenido empieza a romperse, no en qué ancho de pantalla."
focusKeyphrase: diseño responsive
seoTitle: "Diseño responsive: pensar en contenido, no en breakpoints"
seoDescription: "Por qué el diseño responsive de tres breakpoints fijos no refleja cómo se usa un sitio, y el criterio de diseñar según dónde el contenido se rompe."
ogTitle: "Ningún dispositivo real respeta tus tres breakpoints"
ogDescription: "El cambio de criterio que hice en diseño responsive: de tamaños fijos de pantalla a puntos donde el contenido realmente se rompe."
coverAlt: "Layout de interfaz adaptándose fluidamente entre distintos anchos de pantalla"
status: published
publishedAt: 2027-03-01
tags: diseno-ui, react
imagePrompt: "Editorial vector illustration, an abstract flexible grid of blocks reflowing smoothly across a continuous width gradient, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Durante años diseñé pensando en tres tamaños: celular, tablet, desktop. Es el modelo mental que enseña casi todo tutorial de diseño responsive, y tiene un problema que se nota apenas se prueba en dispositivos reales: casi ningún dispositivo respeta esas tres categorías limpiamente.

## El problema del modelo de tres tamaños

Un celular en horizontal tiene más ancho que una tablet en vertical. Una ventana de navegador en una laptop puede tener el ancho exacto de una tablet sin ser ninguna de las dos. El modelo de tres tamaños asume categorías de dispositivo que no existen. La interfaz recibe un número de píxeles, no una etiqueta.

## El cambio de pregunta en el diseño responsive

En vez de preguntarme "¿cómo se ve esto en celular?", empecé a preguntarme "¿en qué ancho empieza a romperse este layout?". La segunda pregunta tiene respuesta objetiva: achico la ventana hasta que algo se superpone, se corta o pierde el espacio que necesita. La primera depende del dispositivo que elegí para probar, que es una muestra arbitraria.

Los breakpoints que uso salen de ese punto de quiebre real, no de la convención de que "600px es tablet". Si un layout de tres columnas se aprieta en 850px, ese es mi breakpoint. Es la idea que [Ethan Marcotte planteó en el artículo original](https://alistapart.com/article/responsive-web-design/) que le dio nombre a todo esto.

## Cómo esto cambia el proceso de diseño

**Diseño con contenido real, no con un mockup de ancho fijo.** Un título corto y uno largo pueden romper un layout en anchos completamente distintos. Diseñar con "Título de ejemplo" en vez del título real que va a tener esa pantalla esconde justamente el caso que va a romperse en producción.

**Pruebo achicando gradualmente, no saltando entre tres tamaños.** Arrastro el borde de la ventana lentamente, de ancho completo a angosto, mirando en qué punto exacto algo dejó de verse bien. Saltar directo a 375px se saltea todos los anchos intermedios donde el layout también tiene que funcionar. Ahí es donde vive una ventana redimensionada en una laptop.

**El contenido decide el layout, no al revés.** Si una tarjeta necesita mostrar título, imagen y tres metadatos, el layout se adapta para que entren legibles en cualquier ancho. No al revés: forzar el contenido dentro de una grilla de columnas pensada antes.

## Un ejemplo concreto en este mismo portafolio

La grilla del blog usa `md:grid-cols-2` — dos columnas a partir de cierto ancho, una antes de eso. Ese punto de quiebre no salió de "tablet empieza en tal ancho". Salió de probar en qué punto una tarjeta con portada, título y bajada se volvía demasiado angosta para leerse en dos columnas. Ese ancho es el breakpoint, coincida o no con algún dispositivo de catálogo.

## Lo que las container queries cambian

Hace poco esto dejó de ser solo una forma de pensar. Las container queries permiten que un componente reaccione al ancho de su contenedor, no al de la ventana, que es exactamente lo que este enfoque venía pidiendo desde siempre.

Una tarjeta en una barra lateral angosta y la misma tarjeta a ancho completo son dos contextos distintos, aunque la ventana mida lo mismo. Con media queries había que resolver eso con variantes o clases extra. Con container queries, el componente se adapta solo.

## El límite de este enfoque

Pensar en contenido no elimina la necesidad de un set consistente de breakpoints. Sin eso, cada componente termina con su punto de quiebre arbitrario y el sistema se vuelve inconsistente, igual que con los [tokens de diseño](/es/blog/design-tokens-figma-a-tailwind). La diferencia es cómo se calibran: mirando varios componentes reales del proyecto y buscando dónde coinciden sus quiebres naturales, en vez de adoptar una convención genérica sin verificarla.
