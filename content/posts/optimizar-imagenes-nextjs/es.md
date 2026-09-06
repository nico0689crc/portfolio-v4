---
slug: optimizar-imagenes-en-nextjs-sin-perder-calidad
title: "Cómo optimizo imágenes en Next.js sin que se note que las optimicé"
excerpt: "El componente Image de Next.js resuelve la mitad del problema solo. La otra mitad es decidir qué formato, qué tamaños y cuándo priorizar, y esas decisiones sí son mías."
focusKeyphrase: optimizar imágenes en Next.js
seoTitle: "Optimizar imágenes en Next.js sin perder calidad"
seoDescription: "Cómo optimizar imágenes en Next.js de verdad: cuándo usar priority, qué declarar en sizes y por qué AVIF no siempre es la respuesta correcta."
ogTitle: "La imagen más rápida es la que nunca tuviste que descargar"
ogDescription: "Cómo optimizo imágenes en Next.js sin que la calidad visual se resienta."
coverAlt: "Comparación de una imagen en distintos tamaños y formatos de compresión"
status: published
publishedAt: 2027-02-01
tags: nextjs, rendimiento
imagePrompt: "Editorial vector illustration, an abstract image icon splitting into multiple sized versions of itself flowing toward different device shapes, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Las imágenes son, en la mayoría de los sitios que audito, la razón número uno de que una página cargue lento. Y optimizar imágenes en Next.js parece un problema resuelto: el componente `Image` lo hace automáticamente. El error común es pensar que usarlo es el final del trabajo, cuando en realidad es donde empiezan las decisiones.

## Qué resuelve solo el componente

Genera múltiples tamaños de la misma imagen y sirve el que corresponde al dispositivo. Convierte a formatos modernos como WebP o AVIF cuando el navegador los soporta. Y evita el layout shift reservando el espacio antes de que la imagen cargue. Todo eso viene gratis con solo usar [`<Image>`](https://nextjs.org/docs/app/api-reference/components/image) en vez de `<img>`.

## Optimizar imágenes en Next.js: lo que sigue siendo decisión mía

**Qué imagen prioriza la carga.** La prop `priority` le dice a Next.js que precargue esa imagen en vez de esperar a que el navegador la descubra. La uso en una sola imagen por página: la que aparece primero sin scroll, como el hero. Usarla en más de una anula el propósito. Si todo es prioritario, nada lo es, y compiten por el mismo ancho de banda inicial.

**Qué tamaños declaro en `sizes`.** Esta prop le dice al navegador qué ancho va a ocupar la imagen en cada breakpoint, para que descargue el tamaño correcto. En este portafolio, la portada del blog usa `sizes="(max-width: 768px) 100vw, 50vw"`. En mobile ocupa todo el ancho y en desktop la mitad, porque ahí vive en una grilla de dos columnas. Sin esta prop bien calculada, el navegador puede descargar la versión de escritorio en un celular.

**Cuándo AVIF no es la respuesta.** AVIF comprime mejor que WebP en la mayoría de los casos, pero tarda más en codificarse. Y en imágenes con mucho detalle fino puede introducir artefactos que WebP no tiene. Para fotografías reales, casi siempre AVIF gana. Para capturas de interfaz con texto y bordes definidos —como las que uso en los casos de estudio de este portafolio— reviso el resultado a ojo antes de asumir que el formato más nuevo es automáticamente mejor.

## El error que más veces vi (y cometí)

Subir la imagen fuente en su resolución original de cámara —a veces 4000 píxeles de ancho— confiando en que Next.js "la va a optimizar igual". Es cierto que la va a redimensionar, pero decodificar una imagen de ese tamaño en cada build cuesta tiempo real. En catálogos grandes se nota. Redimensiono la fuente a un ancho apenas por encima del máximo que voy a mostrar, y no más, antes de subirla.

## Un caso concreto: la portada por defecto de este blog

La portada de respaldo que este blog muestra en los posts sin imagen propia es un SVG inline, no un archivo optimizado por Next.js. Fue a propósito. `next/image` no optimiza SVG salvo configuración específica, y con la agenda cargada meses adelante la mayoría de las tarjetas iban a mostrar esa portada. Inline significa cero pedido de red, que es más rápido que cualquier optimización posible sobre un archivo.

Esa decisión no vino del componente `Image`. Vino de preguntarme, para ese caso específico, si la imagen más rápida no sería directamente la que no hay que descargar.

## La pregunta que me hago antes de cualquier imagen nueva

**¿Esta imagen necesita ser una foto, o puede ser algo más liviano que comunique lo mismo?** Un ícono, un color de fondo, un SVG. La optimización más efectiva casi siempre es la que evita la imagen pesada desde el principio, no la que la comprime mejor después.

El resto de las decisiones de rendimiento del sitio las conté en [data fetching en Next.js](/es/blog/data-fetching-en-nextjs-donde-pido-los-datos).
