---
slug: dark-mode-desde-el-principio-no-al-final
title: "Modo oscuro: lo que cambia cuando lo diseñás desde el principio"
excerpt: "Agregar un tema oscuro al final es invertir colores y esperar lo mejor. Diseñarlo desde el principio significa tratar el color como una variable, no como un valor fijo, desde la primera pantalla."
focusKeyphrase: diseñar modo oscuro
seoTitle: "Cómo diseñar modo oscuro desde el principio de un proyecto"
seoDescription: "Por qué agregar dark mode al final de un proyecto casi siempre sale mal, y cómo diseñar los tokens de color desde el principio para que los dos temas funcionen de verdad."
ogTitle: "Invertir los colores no es diseñar un tema oscuro"
ogDescription: "Lo que cambia cuando el modo oscuro se piensa desde la primera pantalla, y no se agrega al final."
coverAlt: "Misma interfaz mostrada en tema claro y tema oscuro"
status: published
publishedAt: 2027-04-12
tags: diseno-ui, design-systems
imagePrompt: "Editorial vector illustration, an abstract interface panel split diagonally between a light and a dark version of the same layout, muted amber and deep navy palette, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Hay una forma rápida de detectar un modo oscuro agregado al final: los colores de acento se ven exactamente igual en los dos temas. Un ámbar que funciona sobre fondo blanco casi nunca funciona con la misma intensidad sobre fondo casi negro — y si funciona igual en los dos, lo más probable es que a alguno de los dos temas nunca lo miraron con atención.

## Por qué "invertir los colores" no alcanza

La forma ingenua de agregar un tema oscuro es tomar cada color y oscurecerlo mecánicamente: el fondo blanco pasa a negro, el texto negro pasa a blanco, listo. El problema es que el contraste, la jerarquía visual y el peso de cada color no se comportan igual en los dos extremos.

Un gris que separa sutilmente dos secciones sobre fondo claro puede desaparecer completamente sobre fondo oscuro, o volverse una línea demasiado marcada. Un color de acento que resalta perfecto sobre blanco puede lastimar la vista sobre negro puro, porque el contraste extremo genera un efecto de vibración que no está presente en el tema claro.

## Cómo lo pienso desde el principio

**El color nunca es un valor fijo, es un [token](/es/blog/design-tokens-figma-a-tailwind) semántico con dos definiciones.** `color-background` no es "blanco". Es un nombre que en tema claro resuelve a un valor y en tema oscuro resuelve a otro. Ningún componente conoce el valor final — solo conoce el rol. Esto es exactamente la misma lógica de capas que describí para tokens en general, aplicada específicamente al problema de tener más de un tema.

**Cada par de valores se prueba junto, no por separado.** Cuando defino el color de acento, lo prueblo simultáneamente sobre el fondo claro y sobre el fondo oscuro, ajustando cada uno hasta que ambos se sientan con el mismo peso visual relativo. No es el mismo valor hexadecimal en los dos — es un valor calibrado para cada contexto, bajo el mismo nombre semántico.

**El texto secundario necesita más cuidado que el primario.** El contraste del texto principal contra el fondo suele quedar bien en los dos temas casi sin esfuerzo, porque el extremo de contraste es fácil de acertar. El texto secundario o los bordes sutiles son donde más se nota el trabajo mal hecho, porque ahí el margen de error es más chico — muy poco contraste y desaparece, demasiado y deja de sentirse "secundario".

## El caso técnico: dónde vive esta decisión en código

En este portafolio, cada superficie define su propio bloque de variables CSS en vez de heredar un cálculo automático. El hero, por ejemplo, es una sección con fondo oscuro fijo por diseño, y define sus propios tokens de superficie para los elementos que van adentro —tarjetas, texto— en vez de heredar los del tema general de la página. Esa sección necesita verse consistente sin importar el tema que el visitante tenga elegido, así que sus tokens internos están calibrados como un caso aparte, no como una inversión automática del resto del sistema.

Esa es una decisión de diseño encapsulada en el sistema de tokens, no un cálculo que corre en tiempo real invirtiendo valores. Cada combinación de tema y superficie fue mirada y ajustada a propósito.

## Por qué esto es más barato hacerlo temprano

Si los componentes ya asumen un color de fondo fijo —hardcodeado, no referenciado por token— agregar un segundo tema después significa auditar cada componente uno por uno para encontrar dónde el valor fijo rompe el tema nuevo. Si desde el principio todo referencia tokens semánticos, agregar el segundo tema es redefinir esos tokens en un solo lugar, y todos los componentes lo heredan automáticamente sin que nadie tenga que tocarlos.

Es el mismo argumento que hice sobre [tokens en general](/es/blog/design-tokens-figma-a-tailwind): la inversión temprana en nombrar bien las cosas se cobra, con intereses, cada vez que el sistema tiene que crecer en una dirección que no se anticipó al principio pero que el sistema de tokens sí puede absorber.
