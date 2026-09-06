---
slug: de-figma-a-produccion-sin-perder-nada
title: "De Figma a producción: mi flujo para que nada se pierda en la traducción"
excerpt: "Diseñar y programar el mismo producto cambia el orden de las decisiones. Cómo organizo el paso de un archivo de Figma a componentes de verdad, sin la fricción de que dos personas se turnen el archivo."
focusKeyphrase: de Figma a código
seoTitle: "De Figma a código sin perder fidelidad"
seoDescription: "El flujo que uso para ir de Figma a código en producción: qué se decide en el diseño, qué se decide en el código y por qué el orden importa."
ogTitle: "El diseño que no se puede implementar es un diseño sin terminar"
ogDescription: "Cómo paso un archivo de Figma a componentes de verdad, siendo la misma persona en los dos lados."
coverAlt: "Panel de Figma junto a un editor de código mostrando el mismo componente"
status: published
publishedAt: 2026-08-31
tags: diseno-ui, react, producto
imagePrompt: "Editorial vector illustration, an abstract design canvas transforming into code brackets through a bridge shape, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Cuando el diseñador y el desarrollador son la misma persona, desaparece un problema clásico: la pelea por teléfono descompuesto entre dos roles. Pero aparece uno nuevo, menos hablado. Es la tentación de saltarte pasos porque "ya sé lo que quiero", y descubrir en el código que no lo sabías tan bien como creías. Este es el flujo que uso para ir de Figma a código sin perder fidelidad, ni siquiera cuando nadie más lo revisa.

## La regla que ordena todo

**Si no se puede implementar sin adivinar, no está diseñado. Está dibujado.**

Un archivo de Figma bonito no es un design system. Es una ilustración de cómo se vería uno si existiera. La diferencia se nota en un solo lugar. Es qué tan fácil le resulta a un desarrollador —en mi caso, yo mismo tres días después— tomar una decisión sin abrir el archivo original a adivinar un valor.

## Paso 1 para ir de Figma a código: tokens antes que pantallas

Antes de diseñar una sola pantalla, defino los tokens: color, espaciado, tipografía, radios de borde. En el rediseño de Mexx eso fue el rojo de marca (#E73E3E), un sistema de espaciado de 4 píxeles y dos tipografías con roles fijos —Inter para interfaz, Merriweather para contenido editorial.

Esto invierte el orden natural. La tentación es diseñar la pantalla y "sacar" los tokens después, mirando lo que quedó. Hacerlo al revés obliga a decidir el sistema antes de tener una pantalla que lo justifique. Ese sistema es exactamente lo que se convierte en [variables de Tailwind](https://tailwindcss.com/docs/theme) sin traducción de por medio.

## Paso 2: componentes con estados, no pantallas con casos

Diseño un botón, no cuarenta pantallas que cada una tiene un botón un poco distinto. Y el botón se diseña con sus estados: default, hover, disabled, loading. No es un capricho de prolijidad. Es la diferencia entre un componente de React con props claras y un desarrollador que tiene que inventar el estado `disabled` porque nadie lo diseñó.

Cuando el diseño ya trae los cuatro estados, el componente en código sale con cuatro variantes previstas. Cuando no los trae, el desarrollador improvisa. Esa improvisación es exactamente el punto donde la interfaz final deja de parecerse al diseño.

## Paso 3: el prototipo interactivo, no la lámina estática

Uso Figma para armar el flujo completo navegable, no capturas sueltas. Un flujo navegable expone problemas que una lámina no muestra: una transición que no tiene sentido, un estado de carga que nadie dibujó, un camino de vuelta que no existe.

En el caso de Mexx, seis animaciones quedaron documentadas explícitamente: el slider del hero, el modal de autenticación, el desglose de costos, el indicador de guardado, los estados de carga y las transiciones de checkout. Ninguna se improvisó en el código, porque ninguna llegó al código sin estar antes decidida en el diseño.

## Paso 4: implementar es donde se prueba el diseño, no donde se ejecuta

Acá está la parte que cambia cuando las dos habilidades viven en la misma persona: la implementación deja de ser un paso mecánico y se convierte en la última revisión del diseño.

Escribiendo el componente en React, aparecen preguntas que Figma no obliga a contestar: ¿qué pasa si el texto es el doble de largo? ¿Qué pasa en una pantalla angosta? ¿Qué pasa si el dato tarda en llegar? Figma te deja diseñar con el contenido perfecto, del largo perfecto, cargado al instante. El código no perdona ninguna de esas tres cosas.

Cuando encuentro un caso que el diseño no contempló, vuelvo al archivo de Figma y lo resuelvo ahí, no directamente en el código. Parece un paso de más — ya estoy en el editor, podría resolverlo ahí nomás — pero saltarlo es exactamente cómo el archivo de diseño deja de ser la fuente de verdad y pasa a ser un documento histórico que ya no describe el producto real.

## Lo que este orden evita

**Evita el design system de mentira.** Uno donde el Figma dice una cosa y el código hace otra, y con cada iteración la distancia crece hasta que nadie confía en ninguno de los dos archivos.

**Evita rehacer trabajo.** Si el token de espaciado es una variable real de Tailwind, cambiarlo una vez lo cambia en todos lados. Si es un número que cada componente copió a mano, cambiarlo significa buscarlo componente por componente y rezar para no dejar ninguno afuera.

**Evita la pregunta más cara de un proyecto a medida:** "¿esto lo decidimos en el diseño o lo decidís vos ahora, mientras programás?". Con este orden, esa pregunta casi no se hace. Ya está contestada antes de llegar al código.

## El costo real de este método

No es gratis. Diseñar tokens y estados antes de tener una sola pantalla se siente más lento al principio — no hay nada "terminado" para mostrar en los primeros días. Y para alguien acostumbrado a ver progreso como pantallas nuevas, eso puede leerse como que no está pasando nada.

Lo que pasa en realidad es que se está construyendo la base que hace que las pantallas seis, doce y veinte salgan más rápido y más consistentes que la número dos. El orden se paga adelante para cobrarse después, y en un proyecto de más de un par de semanas, siempre sale ganancia.

Escribí sobre la mitad técnica de esto en [design tokens: de Figma a Tailwind](/es/blog/design-tokens-figma-a-tailwind), y todo el proceso completo, con las cinco etapas antes de llegar a este punto, está en [cómo diseño una interfaz desde cero](/es/blog/como-diseno-una-interfaz-desde-cero).
