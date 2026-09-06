---
slug: disenar-para-cuando-algo-sale-mal
title: "Diseñar para cuando algo sale mal, no solo para cuando todo sale bien"
excerpt: "La mayoría de los mockups muestran el estado perfecto: datos completos, conexión estable, todo funciona. El estado de error casi nunca se diseña, se improvisa en el código, y se nota."
focusKeyphrase: diseñar estados de error
seoTitle: "Diseñar estados de error: por qué no pueden ir al final"
seoDescription: "Por qué diseñar estados de error merece la misma atención que el estado ideal, y el criterio para que un error no sea un callejón sin salida."
ogTitle: "El estado que menos se diseña es el que más frustra cuando aparece"
ogDescription: "El criterio para diseñar estados de error que no dejen a nadie sin salida."
coverAlt: "Interfaz mostrando un estado de error con una acción clara para continuar"
status: published
publishedAt: 2027-04-19
tags: diseno-ui, producto
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. A row of interface states drawn as finished, carefully styled panels, with the last panel in the row left as a bare unstyled outline. A thin inspection frame sits over that unfinished one. Composition: horizontal band across the middle third of the frame, wide empty margins above and below, nothing important in the outer 8 percent. Palette: deep navy ground #0F172A, desaturated slate mid-tones #1E293B and #334155, off-white #F8FAFC for thin lines and highlights, and a single amber #F59E0B accent used only on the unfinished panel outline. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

Si mirás los mockups de cualquier proyecto en su etapa de diseño, casi todos muestran el mismo escenario: datos completos, conexión perfecta, todo funcionando. Es el estado más fácil de diseñar y el menos representativo de cómo se usa un producto de verdad. En producción los errores no son la excepción rara: son una parte constante del uso. Por eso diseñar estados de error no es un detalle final, es parte del trabajo.

## Por qué se improvisa en vez de diseñar estados de error

Cuando el diseño no contempla qué pasa si algo falla, el desarrollador tiene que decidirlo en el momento. No tiene el tiempo ni el contexto que tiene un diseñador para pensarlo con calma. El resultado casi siempre es un mensaje genérico, sin acción clara, escrito apurado antes de un deploy. Es el mismo problema que documenté sobre [microcopy](/es/blog/microcopy-es-una-decision-de-producto): lo que no se diseña con intención se resuelve con lo primero que se le ocurre a quien programa esa pantalla.

## Las tres categorías de error que diseño distinto

**Error del usuario, recuperable.** Un campo mal completado, un formato inválido. Acá el diseño tiene que señalar exactamente qué está mal y cómo corregirlo, en el lugar donde está el error. No en un mensaje genérico arriba del formulario, algo que las [pautas de mensajes de error de Nielsen Norman](https://www.nngroup.com/articles/error-message-guidelines/) desaconsejan hace años.

**Error del sistema, temporal.** La conexión se cortó, un servicio externo no respondió a tiempo. Acá el diseño tiene que comunicar que el problema no es culpa del usuario y ofrecer un reintento claro. "Algo salió mal" no dice ninguna de las dos cosas — no dice si fue su culpa, y no dice qué puede hacer.

**Estado vacío, que no es técnicamente un error pero se siente parecido.** Ninguna búsqueda arrojó resultados, todavía no hay contenido cargado. Diseño esto con la misma atención que un error real, porque para el usuario la sensación es la misma: llegó a un lugar sin salida clara.

## El criterio que aplico a cada mensaje de error

Cada estado de error tiene que contestar dos preguntas específicas, o no está terminado: **¿qué pasó?** y **¿qué puedo hacer ahora?** Un mensaje que contesta solo la primera deja a la persona sabiendo que algo falló pero sin ninguna acción — es información sin salida. Uno que no contesta ninguna de las dos es ruido.

## Un ejemplo concreto de este mismo sitio

Cuando alguien envía el formulario de contacto y el servidor no puede procesar el mensaje, el estado de error no dice "hubo un error". Dice específicamente que hubo un problema al enviar el mensaje y que puede intentar nuevamente más tarde. La persona sabe que no fue su culpa y sabe qué hacer, en vez de quedarse mirando un mensaje genérico sin dirección.

## Por qué esto es una decisión de diseño, no solo de contenido

El lugar donde aparece el error importa tanto como lo que dice. Un error de validación que aparece lejos del campo problemático obliga a la persona a buscarlo. Un error que empuja el layout hacia abajo de forma inesperada puede hacer que la persona pierda de vista dónde estaba mirando. Diseñar el estado de error incluye diseñar dónde vive espacialmente, no solo qué palabras usa.

## Cómo sé si un estado de error está bien diseñado

Se lo muestro a alguien sin contexto previo del producto y le pregunto qué haría a continuación. Si la respuesta es inmediata y coincide con la acción correcta, el error está bien diseñado. Si la persona duda, o pregunta "¿y ahora qué hago?", el error todavía es un callejón sin salida disfrazado de mensaje informativo.

## La regla que resume esto

Un estado de error diseñado con la misma atención que el estado ideal no es un lujo de proyectos con mucho presupuesto. Es reconocer que, en el uso real de cualquier producto, el estado de error no es la excepción — es una parte constante de la experiencia, y tratarlo como una idea de último momento es diseñar solo para una fracción de los momentos que realmente importan.
