---
slug: dark-mode-desde-el-principio-no-al-final
title: "Modo oscuro: lo que cambia cuando lo diseñás desde el principio"
excerpt: "Agregar un tema oscuro al final es invertir colores y esperar lo mejor. Diseñarlo desde el principio significa tratar el color como una variable, no como un valor fijo, desde la primera pantalla."
focusKeyphrase: diseñar modo oscuro
seoTitle: "Cómo diseñar modo oscuro desde el principio"
seoDescription: "Por qué diseñar modo oscuro al final de un proyecto sale mal, y cómo definir los tokens de color desde el arranque para que los dos temas funcionen."
ogTitle: "Invertir los colores no es diseñar un tema oscuro"
ogDescription: "Lo que cambia cuando el modo oscuro se piensa desde la primera pantalla, y no se agrega al final."
coverAlt: "Misma interfaz mostrada en tema claro y tema oscuro"
status: published
publishedAt: 2027-02-08
tags: diseno-ui, design-systems
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. The same interface panel split down a hard vertical seam, light on one side and dark on the other. The dark side is not a colour inversion: its surfaces are raised and re-layered, with different elevation steps and different contrast between them. Composition: horizontal band across the middle third of the frame, wide empty margins above and below, nothing important in the outer 8 percent. Palette: off-white #F8FAFC ground on the light half and deep navy #0F172A on the dark half, desaturated slate mid-tones #1E293B and #334155, and a single amber #F59E0B accent used only on the accent element that crosses the seam. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

Hay una forma rápida de detectar un modo oscuro agregado al final: los colores de acento se ven exactamente igual en los dos temas. Un ámbar que funciona sobre fondo blanco casi nunca funciona con la misma intensidad sobre fondo casi negro. Si se ve igual en los dos, lo más probable es que a alguno de los dos nunca lo miraron con atención. Diseñar modo oscuro es más que invertir valores.

## Por qué "invertir los colores" no alcanza

La forma ingenua de agregar un tema oscuro es oscurecer cada color mecánicamente: el fondo blanco pasa a negro, el texto negro pasa a blanco, listo. El problema es que el contraste, la jerarquía visual y el peso de cada color no se comportan igual en los dos extremos.

Un gris que separa sutilmente dos secciones sobre fondo claro puede desaparecer sobre fondo oscuro, o volverse una línea demasiado marcada. Un color de acento que resalta perfecto sobre blanco puede lastimar la vista sobre negro puro. El contraste extremo genera un efecto de vibración que no está presente en el tema claro.

## Cómo pienso diseñar modo oscuro desde el principio

**El color nunca es un valor fijo, es un [token](/es/blog/design-tokens-figma-a-tailwind) semántico con dos definiciones.** `color-background` no es "blanco". Es un nombre que en tema claro resuelve a un valor y en tema oscuro resuelve a otro. Ningún componente conoce el valor final: solo conoce el rol. Es la misma lógica de capas que describí para tokens en general, aplicada al problema de tener más de un tema.

**Cada par de valores se prueba junto, no por separado.** Cuando defino el color de acento, lo pruebo a la vez sobre el fondo claro y sobre el oscuro, ajustando cada uno hasta que se sientan con el mismo peso visual. No es el mismo valor hexadecimal en los dos. Es un valor calibrado para cada contexto, bajo el mismo nombre semántico.

**El texto secundario necesita más cuidado que el primario.** El contraste del texto principal suele quedar bien en los dos temas casi sin esfuerzo, porque el extremo de contraste es fácil de acertar. El texto secundario y los bordes sutiles son donde más se nota el trabajo mal hecho. Ahí el margen de error es chico: muy poco contraste y desaparece, demasiado y deja de sentirse "secundario". El estándar [WCAG](https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum) da el piso, no el techo.

## El caso técnico: dónde vive esta decisión en código

En este portafolio, cada superficie define su propio bloque de variables CSS en vez de heredar un cálculo automático. El hero, por ejemplo, es una sección con fondo oscuro fijo por diseño. Define sus propios tokens de superficie para los elementos que van adentro —tarjetas, texto— en vez de heredar los del tema general. Esa sección necesita verse consistente sin importar el tema elegido, así que sus tokens están calibrados como un caso aparte.

Esa es una decisión de diseño encapsulada en el sistema de tokens, no un cálculo que corre en tiempo real invirtiendo valores. Cada combinación de tema y superficie fue mirada y ajustada a propósito.

## Por qué diseñar modo oscuro temprano sale más barato

Si los componentes ya asumen un color de fondo fijo —hardcodeado, no referenciado por token— agregar un segundo tema después significa auditar cada componente uno por uno. Hay que encontrar dónde el valor fijo rompe el tema nuevo. Si desde el principio todo referencia tokens semánticos, agregar el segundo tema es redefinir esos tokens en un solo lugar. Todos los componentes lo heredan sin que nadie los toque.

Es el mismo argumento que hice sobre [tokens en general](/es/blog/design-tokens-figma-a-tailwind). La inversión temprana en nombrar bien las cosas se cobra, con intereses, cada vez que el sistema crece en una dirección que no se anticipó.

## El detalle que se le escapa a la mayoría

Hay un tercer estado que se olvida: el visitante que nunca eligió un tema. Su navegador informa una preferencia del sistema, y nada queda marcado en la página para decir cuál ganó. Si los estilos solo definen colores dentro de un bloque `[data-theme]`, ese visitante recibe una página sin colores definidos. Casi siempre termina en texto oscuro sobre fondo oscuro, o al revés.

La solución es una regla de orden, no más código. El bloque base define la paleta clara completa. La media query de preferencia del sistema redefine solo los tokens. El atributo de tema explícito los redefine otra vez, para que un botón manual le gane al sistema operativo en las dos direcciones. Cada color existe en el bloque base antes de que algo lo pise.

Lo verifico siempre igual: cargo la página sin tema elegido y después cambio el sistema operativo entre claro y oscuro sin tocar el sitio. Si algo se vuelve ilegible en cualquiera de las dos direcciones, hay un token definido en el lugar equivocado.
