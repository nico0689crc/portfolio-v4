---
slug: hreflang-lo-que-rompe-el-seo-de-un-sitio-bilingue
title: "Hreflang: lo que más rompe el SEO de un sitio en dos idiomas"
excerpt: "Un hreflang mal declarado no es un error menor de configuración. Es la forma más común de que Google descarte un idioma entero de la indexación, sin que nadie note por qué."
focusKeyphrase: hreflang SEO
seoTitle: "Hreflang: cómo evitar el error más común en SEO multilenguaje"
seoDescription: "Qué es hreflang, por qué declarar un idioma que no existe hace que Google descarte el clúster entero, y el criterio que uso para que cada URL sólo declare lo que realmente existe."
ogTitle: "Un hreflang que apunta a una página que no existe puede tirar abajo las dos versiones"
ogDescription: "El error más común de SEO multilenguaje, y por qué la solución es más simple de lo que parece."
coverAlt: "Dos versiones de una página en distintos idiomas conectadas correctamente por hreflang"
status: published
publishedAt: 2027-05-17
tags: seo, nextjs
imagePrompt: "Editorial vector illustration, two abstract mirrored language flags connected by a single verified link versus a broken dangling one, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

De todos los errores de SEO técnico que corregí en sitios multilenguaje, el de hreflang mal declarado es el que tiene el efecto más desproporcionado respecto a lo simple que parece el error. Una etiqueta con la URL equivocada puede hacer que Google descarte de la indexación no solo esa página, sino todo el clúster de idiomas conectado a ella.

## Qué es hreflang, sin la jerga

Es la etiqueta que le dice a un buscador "esta página tiene una versión equivalente en otro idioma, y está en esta URL". Sirve para que Google le muestre a un usuario en España la versión en español de tu sitio, y a uno en Alemania la versión en inglés, en vez de mostrarle a los dos la misma URL sin importar el idioma.

## Por qué el error es tan común

El error más frecuente es declarar `hreflang="en"` apuntando a una URL que en realidad no existe todavía en inglés — por ejemplo, un post del blog que solo se publicó en español. Suena inofensivo: "total, cuando lo traduzca, ya va a estar la etiqueta puesta". El problema es que mientras tanto, esa etiqueta le dice a Google "hay una versión en inglés acá", y cuando Google va a verificarlo y encuentra un 404, la señal que recibe no es "todavía no existe" — es "esta declaración de hreflang no es confiable".

Y cuando una declaración de hreflang no es confiable en una página, Google tiende a desconfiar del clúster completo, no solo de esa etiqueta específica. El costo no es proporcional al tamaño del error.

## El criterio que aplico: declarar solo lo que existe

La regla que sigo, sin excepciones: un idioma se declara en el hreflang únicamente cuando esa traducción específica ya está publicada, con `status = published`, no cuando "está por venir" o "existe en borrador". En este sitio, el sistema de contenido genera el hreflang de cada post consultando qué traducciones están efectivamente publicadas en ese momento — si el inglés todavía es un borrador, el hreflang de esa nota en español no menciona inglés en absoluto.

Esto significa que un post recién publicado en un solo idioma no anuncia el otro hasta que el otro realmente exista. Es menos ambicioso que declarar los dos desde el día uno, y es la única versión que no le miente a Google.

## El segundo error, menos común pero igual de dañino

Declarar hreflang recíproco de forma inconsistente: la versión en español apunta correctamente a la versión en inglés, pero la versión en inglés no apunta de vuelta a la española, o apunta a una URL distinta a la real. Google trata la relación de hreflang como bidireccional — si A dice que B es su par, B tiene que decir que A es el suyo. Si no coinciden, la señal completa se descarta.

La forma de evitar esto no es revisar cada página a mano, sino generar las dos direcciones desde la misma fuente de datos, para que sea estructuralmente imposible que se desincronicen. Si el hreflang se arma leyendo qué slugs están publicados en cada idioma para la misma clave interna, los dos lados siempre coinciden porque vienen del mismo lugar.

## Por qué `x-default` también importa

Además del hreflang por idioma, hace falta declarar cuál es la versión que se muestra a alguien cuyo idioma no coincide con ninguno de los declarados. Sin `x-default`, ese visitante recibe un comportamiento no especificado que varía entre buscadores. Con él, la decisión es explícita y consistente.

## La verificación que hago después de publicar

No confío en que la implementación esté bien solo porque el código parece correcto. Reviso, en las herramientas de Search Console, que no aparezcan errores de hreflang reportados para las páginas recién publicadas — es la única forma de confirmar que lo que Google efectivamente está leyendo coincide con lo que el código genera, en vez de asumir que coinciden porque deberían.
