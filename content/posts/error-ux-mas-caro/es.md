---
slug: el-error-de-ux-que-mas-se-repite
title: "El error de UX que más veces vi repetirse (y que yo también cometí)"
excerpt: "No es un error de herramienta ni de metodología. Es confundir 'terminé de testear' con 'ya no queda nada por encontrar', y la diferencia sale cara en producción."
focusKeyphrase: errores comunes de UX
seoTitle: "El error de UX más común: confundir terminar de testear con no tener más hallazgos"
seoDescription: "El error de UX más repetido que vi en proyectos reales, con un ejemplo propio documentado, y cómo evitar confundir el fin de un test con la ausencia de problemas."
ogTitle: "Terminar el test no es lo mismo que no tener más hallazgos"
ogDescription: "El error que más veces vi repetirse en proyectos de UX, con un ejemplo propio que dejé documentado en vez de esconder."
coverAlt: "Informe de research con un hallazgo marcado como pendiente"
status: published
publishedAt: 2027-01-11
tags: ux-research, producto
imagePrompt: "Editorial vector illustration, an abstract checklist where one item remains visibly unchecked among completed ones, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

El error de UX más caro que vi —y que cometí— no tiene que ver con qué herramienta se usa ni con qué metodología se sigue. Es más simple y más humano que eso: confundir "terminamos el test" con "ya no queda nada por encontrar".

## Cómo se ve en la práctica

Corrés un test de usabilidad, medís tasa de éxito, medís tiempo, todo sale razonablemente bien, y el proyecto sigue adelante. El test cumplió su función: validó que el flujo principal funciona. Lo que es fácil de olvidar es que un test valida **lo que decidiste medir**, no todo lo que existe en la interfaz.

En el test que corrí para el rediseño de Mexx, con 10 participantes en Maze, medí dos tareas específicas: continuidad del carrito y transparencia de costos. Las dos midieron bien. Pero en el camino, el test también reveló algo que no estaba buscando: un **49-51% de misclick rate** en el header, gente clickeando donde no había nada que clickear.

Ese hallazgo no era parte de las tareas que diseñé. Apareció igual, porque el comportamiento real de la gente no respeta las fronteras de lo que decidiste evaluar.

## El error, específicamente

No fue no haber medido el header desde el principio — nadie puede medir todo de antemano, y priorizar qué se testea es parte legítima del trabajo. El error hubiera sido cerrar el proyecto sin mencionarlo, o mencionarlo como una nota al pie sin peso, porque las dos tareas "importantes" habían salido bien.

Con cuatro semanas de plazo, no llegué a rediseñar el header en ese ciclo. Lo que hice fue documentarlo explícitamente como deuda pendiente, con el número exacto, en el mismo informe donde mostraba los resultados positivos.

## Por qué esto es más difícil de lo que suena

Hay una presión real, casi siempre no dicha, para que un caso de estudio o un informe de research cierre en positivo. Un cliente que pagó por el proyecto quiere ver que funcionó. Un currículum quiere mostrar éxitos. Y documentar un hallazgo sin resolver se siente como admitir que el trabajo quedó incompleto, aunque en realidad sea exactamente lo contrario: es la prueba de que el research fue lo bastante honesto como para encontrar algo que no estabas buscando.

Un caso de estudio que solo cuenta lo que salió bien no es un caso de estudio. Es un folleto. Y un folleto no le sirve a nadie que esté evaluando si de verdad sabés hacer este trabajo, porque todos los proyectos reales tienen algo sin resolver — la única pregunta es si quien lo hizo lo sabe y lo dice, o si no lo vio, o lo escondió.

## Cómo trato de evitarlo ahora

Antes de cerrar cualquier research, me hago una pregunta específica: **¿qué encontré que no estaba buscando?** No "¿contesté las preguntas que me hice?" — esa siempre tiene una respuesta cómoda — sino qué apareció al margen, sin que lo hubiera pedido.

Casi siempre hay algo. Un patrón de clics raro, un comentario que un participante hizo de pasada, una pantalla donde todos dudaron un segundo de más aunque técnicamente completaron la tarea. Esas señales laterales son casi siempre donde está el próximo problema real, precisamente porque nadie las estaba buscando todavía.

## El costo de no hacerlo

Si ese misclick rate del header hubiera quedado sin documentar, el problema no habría desaparecido. Habría seguido ahí, esperando a que alguien lo redescubriera —probablemente en producción, con usuarios reales, meses después, cuando ya es más caro de arreglar y nadie recuerda que ya había evidencia de que existía.

Documentarlo cuando aparece, aunque no se resuelva en el momento, es la diferencia entre un problema conocido que se prioriza cuando hay tiempo, y un problema invisible que alguien redescubre por sorpresa.
