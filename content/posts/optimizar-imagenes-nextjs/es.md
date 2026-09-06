---
slug: optimizar-imagenes-en-nextjs-sin-perder-calidad
title: "Cómo optimizo imágenes en Next.js sin que se note que las optimicé"
excerpt: "El componente Image de Next.js resuelve la mitad del problema solo. La otra mitad es decidir qué formato, qué tamaños y cuándo priorizar, y esas decisiones sí son mías."
focusKeyphrase: optimizar imágenes en Next.js
seoTitle: "Optimizar imágenes en Next.js: guía práctica sin perder calidad visual"
seoDescription: "Cómo uso el componente Image de Next.js, cuándo priorizar una imagen, qué tamaños declarar y por qué el formato AVIF no siempre es la respuesta correcta."
ogTitle: "La imagen más rápida es la que nunca tuviste que descargar"
ogDescription: "Cómo optimizo imágenes en Next.js sin que la calidad visual se resienta."
coverAlt: "Comparación de una imagen en distintos tamaños y formatos de compresión"
status: published
publishedAt: 2027-04-05
tags: nextjs, rendimiento
imagePrompt: "Editorial vector illustration, an abstract image icon splitting into multiple sized versions of itself flowing toward different device shapes, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Las imágenes son, en la mayoría de los sitios que audito, la razón número uno de que una página cargue lento. Y es un problema engañoso porque técnicamente "ya está resuelto" — Next.js trae un componente `Image` que optimiza automáticamente. El error común es pensar que usarlo es el final del trabajo, cuando en realidad es donde empiezan las decisiones.

## Lo que el componente resuelve solo

Genera automáticamente múltiples tamaños de la misma imagen y sirve el que corresponde al dispositivo, convierte a formatos modernos como WebP o AVIF cuando el navegador los soporta, y evita el layout shift reservando el espacio antes de que la imagen cargue. Eso es real, y es gratis con solo usar `<Image>` en vez de `<img>`.

## Lo que sigue siendo una decisión mía

**Qué imagen prioriza la carga.** La prop `priority` le dice a Next.js que precargue esa imagen específica en vez de esperar a que el navegador la descubra en el flujo normal. La uso exactamente en una imagen por página: la que aparece primero en la pantalla sin necesidad de scroll, como el hero. Usarla en más de una imagen anula el propósito — si todo es prioritario, nada lo es, y compiten por el mismo ancho de banda inicial.

**Qué tamaños declaro en `sizes`.** Esta prop le dice al navegador qué ancho va a ocupar la imagen en distintos breakpoints, para que descargue el tamaño correcto y no uno más grande "por las dudas". En este portafolio, la portada del blog usa `sizes="(max-width: 768px) 100vw, 50vw"` — en mobile ocupa todo el ancho, en desktop la mitad, porque ahí es donde vive en una grilla de dos columnas. Sin esta prop bien calculada, el navegador puede terminar descargando la versión de escritorio en un celular, gastando datos que nadie necesitaba gastar.

**Cuándo AVIF no es la respuesta.** AVIF comprime mejor que WebP en la mayoría de los casos, pero tarda más en codificarse y en algunos casos de imágenes con mucho detalle fino puede introducir artefactos que WebP no tiene. Para fotografías reales, casi siempre AVIF gana. Para capturas de interfaz con texto y bordes definidos —como las que uso en los casos de estudio de este portafolio— reviso el resultado a ojo antes de asumir que el formato más nuevo es automáticamente mejor.

## El error que más veces vi (y cometí)

Subir la imagen fuente en su resolución original de cámara —a veces 4000 píxeles de ancho— confiando en que Next.js "la va a optimizar igual". Es cierto que la va a redimensionar, pero decodificar y procesar una imagen de ese tamaño en cada build cuesta tiempo de construcción real, y en catálogos grandes eso se nota. Redimensiono la fuente a un ancho razonablemente por encima del máximo que voy a necesitar mostrar —no más— antes de subirla al proyecto.

## Un caso concreto: la portada por defecto de este blog

Cuando diseñé la portada de respaldo que este mismo blog muestra en los posts que todavía no tienen imagen propia, la hice como SVG inline en vez de como archivo optimizado por Next.js, a propósito. `next/image` no optimiza SVG salvo que se habilite una configuración específica, y con la agenda del blog cargada meses adelante, la mayoría de las tarjetas iban a mostrar esa imagen — inline significa cero pedido de red para ella, que es más rápido que cualquier optimización posible sobre un archivo.

Esa decisión no vino del componente `Image`. Vino de preguntarme, para ese caso específico, si la imagen más rápida no sería directamente la que no hay que descargar.

## La pregunta que me hago antes de cualquier imagen nueva

**¿Esta imagen necesita ser una foto, o puede ser algo más liviano que comunique lo mismo?** Un ícono, un color de fondo, un SVG. La optimización más efectiva casi siempre es la que evita necesitar la imagen pesada desde el principio, no la que la comprime mejor después.
