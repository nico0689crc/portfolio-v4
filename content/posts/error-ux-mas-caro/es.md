---
slug: el-error-de-ux-que-mas-se-repite
title: "El error de UX que más veces vi repetirse (y que yo también cometí)"
excerpt: "No es un error de herramienta ni de metodología. Es confundir 'terminé de testear' con 'ya no queda nada por encontrar', y la diferencia sale cara en producción."
focusKeyphrase: errores comunes de UX
seoTitle: "Errores comunes de UX: el que más veces vi repetirse"
seoDescription: "Errores comunes de UX: el más repetido que vi en proyectos reales, con un ejemplo propio documentado y cómo evito caer otra vez en él."
ogTitle: "Terminar el test no es lo mismo que no tener más hallazgos"
ogDescription: "El error que más veces vi repetirse en proyectos de UX, con un ejemplo propio que dejé documentado en vez de esconder."
coverAlt: "Informe de research con un hallazgo marcado como pendiente"
status: published
publishedAt: 2026-11-16
tags: ux-research, producto
imagePrompt: "Editorial vector illustration, an abstract checklist where one item remains visibly unchecked among completed ones, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

De todos los errores comunes de UX, el más caro que vi —y que cometí— no tiene que ver con la herramienta ni con la metodología. Es más simple y más humano: confundir "terminamos el test" con "ya no queda nada por encontrar".

## Cómo se ven los errores comunes de UX en la práctica

Corrés un [test de usabilidad](https://www.nngroup.com/articles/usability-testing-101/), medís tasa de éxito y tiempo. Todo sale razonablemente bien y el proyecto sigue adelante. El test cumplió su función: validó que el flujo principal funciona. Lo que es fácil de olvidar es que un test valida **lo que decidiste medir**, no todo lo que existe en la interfaz.

En el test del [rediseño de Mexx](/es/proyectos/rediseno-ux-ui-ecommerce-mexx), con 10 participantes en Maze, medí dos tareas: continuidad del carrito y transparencia de costos. Las dos midieron bien. Pero el test reveló algo que yo no buscaba: un **49-51% de misclick rate** en el header, gente clickeando donde no había nada que clickear.

Ese hallazgo no era parte de las tareas que diseñé. Apareció igual, porque el comportamiento real de la gente no respeta las fronteras de lo que decidiste evaluar.

## El error, específicamente

No fue no haber medido el header desde el principio. Nadie puede medir todo de antemano, y priorizar qué se testea es parte legítima del trabajo. El error hubiera sido cerrar el proyecto sin mencionarlo, o mencionarlo como una nota al pie, porque las dos tareas "importantes" habían salido bien.

Con cuatro semanas de plazo, no llegué a rediseñar el header en ese ciclo. Lo que hice fue documentarlo explícitamente como deuda pendiente, con el número exacto, en el mismo informe donde mostraba los resultados positivos.

## Por qué esto es más difícil de lo que suena

Hay una presión real, casi siempre no dicha, para que un informe de research cierre en positivo. Un cliente que pagó por el proyecto quiere ver que funcionó. Un currículum quiere mostrar éxitos. Y documentar un hallazgo sin resolver se siente como admitir que el trabajo quedó incompleto. Es exactamente lo contrario: es la prueba de que el research fue lo bastante honesto como para encontrar algo que nadie buscaba.

Un caso de estudio que solo cuenta lo que salió bien no es un caso de estudio. Es un folleto, y un folleto no le sirve a nadie que esté evaluando si sabés hacer este trabajo. Todos los proyectos reales tienen algo sin resolver. La única pregunta es si quien lo hizo lo sabe y lo dice, o si no lo vio, o lo escondió. Sobre eso escribí en [cómo escribo un caso de estudio](/es/blog/como-escribo-un-caso-de-estudio-que-entienda-alguien-sin-fondo-de-diseno).

## Cómo trato de evitarlo ahora

Antes de cerrar cualquier research, me hago una pregunta específica: **¿qué encontré que no estaba buscando?** No "¿contesté las preguntas que me hice?" — esa siempre tiene una respuesta cómoda — sino qué apareció al margen, sin que lo hubiera pedido.

Casi siempre hay algo. Un patrón de clics raro, un comentario que un participante hizo de pasada, una pantalla donde todos dudaron un segundo de más aunque técnicamente completaron la tarea. Esas señales laterales son casi siempre donde está el próximo problema real, precisamente porque nadie las estaba buscando todavía.

## El costo de no hacerlo

Si ese misclick rate del header hubiera quedado sin documentar, el problema no habría desaparecido. Habría seguido ahí, esperando a que alguien lo redescubriera —probablemente en producción, con usuarios reales, meses después, cuando ya es más caro de arreglar y nadie recuerda que ya había evidencia de que existía.

Documentarlo cuando aparece, aunque no se resuelva en el momento, es la diferencia entre un problema conocido que se prioriza cuando hay tiempo, y un problema invisible que alguien redescubre por sorpresa.
