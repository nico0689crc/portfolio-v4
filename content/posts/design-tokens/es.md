---
slug: design-tokens-figma-a-tailwind
title: "Design tokens: cómo lo que diseño en Figma termina siendo config de Tailwind"
excerpt: "Un token de diseño no es una buena práctica decorativa: es lo que hace que cambiar un color sea una línea en vez de una búsqueda componente por componente. Cómo los organizo y cómo cruzan a código."
focusKeyphrase: design tokens
seoTitle: "Design tokens: de variables de Figma a config de Tailwind"
seoDescription: "Qué son los design tokens, cómo organizarlos en tres capas (primitivos, semánticos y de componente) y cómo cruzan de Figma a Tailwind."
ogTitle: "El día que cambiaron el color de marca en una sola línea"
ogDescription: "Cómo organizo los design tokens para que un cambio de diseño sea un cambio de código, y no una búsqueda componente por componente."
coverAlt: "Paleta de colores organizada en capas de tokens primitivos y semánticos"
status: published
publishedAt: 2026-07-27
tags: design-systems, diseno-ui, react
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. A single colour swatch at the top connected by branching lines down to dozens of small interface elements that all share its value. One branch is drawn thicker to show a single change propagating through every element at once. Composition: single focal cluster centred slightly left, wide empty margins, nothing important in the outer 8 percent. Palette: deep navy ground #0F172A, desaturated slate mid-tones #1E293B and #334155, off-white #F8FAFC for thin lines and highlights, and a single amber #F59E0B accent used only on the source swatch and its branch lines. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

Hay una prueba simple para saber si un proyecto tiene design tokens de verdad o solo tiene la palabra "tokens" en una diapositiva: pedile a alguien que cambie el color de marca y contá cuántos archivos tiene que tocar.

Si la respuesta es "uno", hay tokens. Si la respuesta es "dejame buscar todos los lugares donde usamos ese naranja", no los hay, sin importar cómo se llame la carpeta de Figma.

## Qué es un token, sin vueltas

Un valor de diseño con nombre, que se usa por referencia en vez de copiarse. En lugar de escribir `#E73E3E` en cuarenta lugares, escribís `color-brand` en cuarenta lugares, y ese nombre apunta a un solo valor. Cambiás el valor una vez, cambia en los cuarenta lugares.

Eso es todo. La parte interesante no es la definición — es cómo se organizan para que escalen.

## Las tres capas

Uso tres niveles, y confundirlos es el error más común que veo en sistemas que se llaman a sí mismos "con tokens".

**Primitivos.** Los valores crudos. `amber-500: #E73E3E`. `space-4: 4px`. No dicen para qué se usan, solo qué son. Es el vocabulario base.

**Semánticos.** Le ponen un rol a un primitivo. `color-accent: amber-500`. `color-danger: red-600`. Acá es donde vive el significado: si mañana el color de acento cambia de ámbar a azul, el token semántico apunta a otro primitivo, y ningún componente se entera del cambio porque nunca conoció el valor crudo, solo el rol.

**De componente.** Casos específicos que necesitan su propio nombre. `button-primary-bg: color-accent`. Sirven para cuando un componente necesita desviarse del semántico general sin romper la cadena.

La razón de tener tres capas y no una es que cada una cambia por una razón distinta. Los primitivos cambian cuando rediseñás la paleta entera. Los semánticos cambian cuando redefinís qué significa "el color de peligro" en tu producto. Los de componente cambian cuando un botón específico necesita comportarse distinto. Sin las capas, esas tres razones de cambio quedan mezcladas en el mismo lugar, y tocar una te arriesga a romper las otras dos.

## Cómo cruzan los design tokens de Figma a código

En Figma, los "variables" o "styles" son la versión visual de la capa semántica: vos les asignás un valor y los componentes de la librería los referencian. Hasta ahí, es exactamente el mismo modelo mental que en código.

El cruce real pasa en un archivo de configuración. En un proyecto con Tailwind, eso significa que el token semántico de Figma tiene una fila espejo en [el tema del proyecto](https://tailwindcss.com/docs/theme):

```
--color-accent: hsl(38 92% 50%);
--space-4: 1rem;
```

Y los componentes de React usan la clase de Tailwind que referencia esa variable, nunca el valor crudo. `bg-accent`, no `bg-[#E73E3E]`. La segunda forma funciona igual de bien el primer día y es exactamente lo que rompe el sistema el día que el color cambia: buscás `bg-[#E73E3E]` en el proyecto entero y rezás por no dejar ninguno afuera.

## El caso donde esto se pagó solo

En el rediseño de Mexx, el sistema completo eran: la paleta con el rojo de marca, dos tipografías con roles fijos, un sistema de espaciado de 4 píxeles y componentes atómicos reutilizables. Nada de eso vivía en un componente individual — vivía en la capa semántica, y cada componente heredaba de ahí.

Eso significó que cuando aparecía un componente nuevo —el modal de login exprés, digamos— no había que decidir de nuevo qué espaciado usar o qué tono de gris para el texto secundario. Esas decisiones ya estaban tomadas una vez, en la capa semántica, y el componente nuevo las heredaba gratis.

## El error que vale la pena nombrar

El error más común no es no tener tokens. Es tener **solo primitivos**, sin capa semántica.

Se ve así: un archivo con veinte colores bien nombrados —`blue-500`, `red-600`— pero cada componente decide por su cuenta cuál usar para qué. El botón de peligro usa `red-600` porque alguien lo puso ahí. El mensaje de error usa `red-500` porque otra persona, otro día, eligió un tono ligeramente distinto. Los dos "son un token", en el sentido de que están nombrados y no son un valor mágico suelto. Pero no comparten significado, así que cambiar "el color de peligro del producto" sigue siendo una búsqueda manual.

La capa semántica es la que convierte "tengo nombres para mis colores" en "tengo un sistema".

## Por qué esto no es exclusivo de equipos grandes

La objeción típica es que los design tokens son overhead para justificar en un equipo de una sola persona. Es al revés: cuanto más chico el equipo, más vale la pena, porque no hay nadie más recordando las decisiones que vos.

Sin tokens, sos vos mismo dentro de seis meses tratando de recordar si el gris de los textos secundarios era `#71717A` o `#737373` en tres archivos distintos. Con tokens, es una variable con nombre, y el nombre te dice el rol aunque te hayas olvidado el valor.

Esta es la mitad de sistema del flujo completo que uso para llevar un diseño a producción, que describí en [de Figma a producción](/es/blog/de-figma-a-produccion-sin-perder-nada).
