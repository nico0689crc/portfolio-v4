---
slug: accesibilidad-no-es-una-fase-2
title: "Por qué la accesibilidad no puede ser una fase 2"
excerpt: "Agregar accesibilidad después es rehacer trabajo. Los tres chequeos gratuitos que hago desde el primer componente, y por qué salen más baratos en el diseño que en el código."
focusKeyphrase: accesibilidad web
seoTitle: "Accesibilidad web: por qué no es una fase 2"
seoDescription: "Por qué la accesibilidad web no puede ser una fase 2: los chequeos de contraste, foco de teclado y estructura semántica que aplico desde el diseño."
ogTitle: "Lo que se diseña sin accesibilidad, se rehace con accesibilidad"
ogDescription: "Los tres chequeos que integro desde el primer componente, porque agregarlos después cuesta el doble."
coverAlt: "Interfaz con indicadores de foco de teclado y contraste de color marcados"
status: published
publishedAt: 2026-07-20
tags: accesibilidad, diseno-ui
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. Two identical interface panels side by side: the left one plain, the right one the same layout rebuilt with a thick visible keyboard focus ring around one control and a contrast-check marker beside a block of body copy. A curved arrow loops from the left panel back into the right one, showing the rework. Composition: horizontal band across the middle third of the frame, wide empty margins above and below, nothing important in the outer 8 percent. Palette: deep navy ground #0F172A, desaturated slate mid-tones #1E293B and #334155, off-white #F8FAFC for thin lines and highlights, and a single amber #F59E0B accent used only on the focus ring. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

"Lo vemos en la fase 2" es la frase que más veces escuché sobre accesibilidad web. No tiene sentido técnico, aunque tenga mucho sentido de presupuesto a corto plazo.

No tiene sentido técnico porque la accesibilidad no es una capa que se agrega arriba de una interfaz terminada. Es una propiedad de cómo esa interfaz está construida desde el primer componente. Agregarla después no es agregar algo: es rehacer lo que ya existe.

## Por qué "después" sale más caro

Un botón sin suficiente contraste de color no se arregla poniendo un adhesivo de contraste arriba. Se arregla cambiando el color, y ese color probablemente esté hardcodeado en quince lugares si no había un sistema de [design tokens](/es/blog/design-tokens-figma-a-tailwind) desde el principio.

Un formulario sin orden de tabulación correcto no se arregla con un parche de JavaScript. Se arregla revisando el HTML semántico de cada campo, que si se escribió mal desde el principio, probablemente esté repetido en cada formulario del sitio.

El patrón es siempre el mismo: un problema de accesibilidad detectado tarde no es un problema aislado. Es un problema multiplicado por cada lugar donde se repitió la misma decisión sin revisar.

## Los tres chequeos que hago desde el diseño, no desde el código

**Contraste de color, en Figma, antes de exportar nada.** El estándar WCAG AA pide una relación de contraste de 4.5:1 para texto normal y 3:1 para texto grande. Hay plugins de Figma que lo chequean en el momento de elegir el color, no después de que el desarrollador ya implementó el componente. Revisar esto en el diseño cuesta cambiar un valor hexadecimal. Revisarlo en producción cuesta encontrar cada lugar donde ese color se usó.

**Orden de foco, en el prototipo navegable.** Cuando armo el prototipo interactivo de Figma, lo recorro simulando que solo tengo teclado: tab, tab, tab. Si el orden lógico de la pantalla no coincide con el orden de tabulación que el prototipo sugiere, es una señal de alerta. La estructura del layout va a producir el mismo problema en código, porque el orden de tabulación en HTML sigue el orden del documento, no el orden visual.

**Texto alternativo, como parte del contenido, no como campo opcional al final.** Cuando diseño una imagen que comunica información —un ícono de estado, un gráfico— escribo en el momento qué dice esa imagen. No lo trato como una tarea de SEO que se completa después. Si no puedo escribir una frase corta que explique qué transmite la imagen, es una señal de alerta: generalmente significa que la imagen comunica algo ambiguo, no que solo falta el texto.

## Un ejemplo concreto: el foco visible

Es común ver botones que sacan el `outline` de foco de teclado por estética — se ve "más limpio" sin ese contorno azul del navegador. El problema es que sin ese contorno, alguien que navega con teclado no tiene forma de saber en qué elemento está parado.

La solución no es "no lo saques nunca". Es diseñar un estado de foco propio, con la identidad visual del sitio, que reemplace al del navegador en vez de eliminarlo. En este mismo portafolio, cada checkbox del panel de administración tiene su propio anillo de foco con el color de acento del sitio. Es visible, pero acorde a la marca.

Eso es una decisión de diseño, no de código. Si el diseño no contempla un estado de foco, el desarrollador tiene dos opciones: dejar el feo default del navegador, o sacarlo y romper la accesibilidad. Ninguna de las dos es culpa del desarrollador. Es un vacío que dejó el diseño.

## Lo que la accesibilidad web no es

No es una checklist que se corre al final con una herramienta automática como [axe](https://www.deque.com/axe/) o Lighthouse. Esas herramientas detectan quizás el 30% de los problemas reales: contraste, atributos faltantes, estructura de encabezados. No detectan si el orden de lectura tiene sentido, ni si un mensaje de error explica qué hacer. Tampoco si un flujo completo es usable con un lector de pantalla de punta a punta.

Son un piso, no una garantía. Sirven para agarrar lo obvio, no para certificar que el producto es accesible de verdad.

## El argumento de negocio, para quien lo necesite

Más allá de lo correcto: un sitio con mejor estructura semántica y mejor contraste generalmente también mide mejor en SEO. La razón es que muchas de las señales que Google usa para entender una página son las mismas que necesita un lector de pantalla: jerarquía de encabezados, texto alternativo, estructura del documento. No es casualidad. Los dos sistemas tratan de entender la misma cosa —qué es cada parte de la página y en qué orden importa.

Diseñar accesible desde el principio no es una tarea extra que le restás velocidad al proyecto. Es la misma tarea que ya estás haciendo —definir jerarquía, definir contraste, definir estructura— hecha una sola vez en vez de dos.
