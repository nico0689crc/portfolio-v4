---
slug: hreflang-lo-que-rompe-el-seo-de-un-sitio-bilingue
title: "Hreflang: lo que más rompe el SEO de un sitio en dos idiomas"
excerpt: "Un hreflang mal declarado no es un error menor de configuración. Es la forma más común de que Google descarte un idioma entero de la indexación, sin que nadie note por qué."
focusKeyphrase: hreflang SEO
seoTitle: "Hreflang: el error más común en SEO multilenguaje"
seoDescription: "Qué es hreflang, por qué el SEO se rompe al declarar un idioma que no existe, y el criterio para que cada URL declare solo lo que ya está publicado."
ogTitle: "Un hreflang que apunta a una página que no existe puede tirar abajo las dos versiones"
ogDescription: "El error más común de SEO multilenguaje, y por qué la solución es más simple de lo que parece."
coverAlt: "Dos versiones de una página en distintos idiomas conectadas correctamente por hreflang"
status: published
publishedAt: 2027-03-15
tags: seo, nextjs
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. Two page rectangles joined by a clean two-way arrow, and a third arrow leaving one of them toward an empty dashed outline where no page exists. The broken arrow visibly weakens the working pair beside it. Composition: horizontal band across the middle third of the frame, wide empty margins above and below, nothing important in the outer 8 percent. Palette: deep navy ground #0F172A, desaturated slate mid-tones #1E293B and #334155, off-white #F8FAFC for thin lines and highlights, and a single amber #F59E0B accent used only on the broken arrow and its empty target. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

De todos los errores de SEO técnico que corregí en sitios multilenguaje, el hreflang mal declarado es el que más daño hace en relación a lo simple que parece. Una etiqueta con la URL equivocada puede sacar de la indexación no solo esa página, sino todo el clúster de idiomas conectado a ella.

## Qué es hreflang, sin la jerga

Es la etiqueta que le dice a un buscador "esta página tiene una versión equivalente en otro idioma, y está en esta URL". Sirve para que Google le muestre la versión en español a un usuario en España y la versión en inglés a uno en Alemania. Sin ella, los dos reciben la misma URL sin importar el idioma. [Google lo documenta en detalle](https://developers.google.com/search/docs/specialty/international/localized-versions).

## Por qué este error de SEO con hreflang es tan común

El error más frecuente es declarar `hreflang="en"` apuntando a una URL que todavía no existe en inglés. Por ejemplo, un post que solo se publicó en español. Suena inofensivo: "cuando lo traduzca, la etiqueta ya va a estar puesta". Pero mientras tanto esa etiqueta le dice a Google "hay una versión en inglés acá". Google va a verificarlo, encuentra un 404, y la señal que recibe no es "todavía no existe": es "esta declaración de hreflang no es confiable".

Y cuando una declaración de hreflang no es confiable en una página, Google tiende a desconfiar del clúster completo, no solo de esa etiqueta específica. El costo no es proporcional al tamaño del error.

## El criterio que aplico: declarar solo lo que existe

La regla que sigo, sin excepciones: un idioma se declara en el hreflang únicamente cuando esa traducción ya está publicada, con `status = published`. No cuando "está por venir" ni cuando existe en borrador. En este sitio, el hreflang de cada post se genera consultando qué traducciones están publicadas en ese momento. Si el inglés todavía es borrador, el hreflang de la nota en español no menciona inglés.

Esto significa que un post recién publicado en un solo idioma no anuncia el otro hasta que el otro realmente exista. Es menos ambicioso que declarar los dos desde el día uno, y es la única versión que no le miente a Google.

## El segundo error, menos común pero igual de dañino

Declarar hreflang recíproco de forma inconsistente. La versión en español apunta bien a la inglesa, pero la inglesa no apunta de vuelta, o apunta a otra URL. Google trata la relación como bidireccional: si A dice que B es su par, B tiene que decir lo mismo. Si no coinciden, la señal completa se descarta.

La forma de evitarlo no es revisar cada página a mano. Es generar las dos direcciones desde la misma fuente de datos, para que sea estructuralmente imposible que se desincronicen. Si el hreflang se arma leyendo qué slugs están publicados en cada idioma para la misma clave interna, los dos lados siempre coinciden.

## Por qué `x-default` también importa

Además del hreflang por idioma, hace falta declarar cuál es la versión que se muestra a alguien cuyo idioma no coincide con ninguno de los declarados. Sin `x-default`, ese visitante recibe un comportamiento no especificado que varía entre buscadores. Con él, la decisión es explícita y consistente.

## La verificación que hago después de publicar

No confío en que la implementación esté bien solo porque el código parece correcto. Reviso en Search Console que no aparezcan errores de hreflang para las páginas recién publicadas. Es la única forma de confirmar que lo que Google lee coincide con lo que el código genera, en vez de asumir que coinciden porque deberían.

Ese chequeo forma parte del [reporte de SEO con datos reales por API](/es/blog/como-armo-un-reporte-de-seo-con-datos-reales-por-api) que armé para este sitio.
