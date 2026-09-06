---
slug: como-reviso-codigo-generado-por-ia-antes-de-aceptarlo
title: "Cómo reviso código generado por IA antes de aceptarlo"
excerpt: "El código que genera una IA se ve razonable el noventa por ciento de las veces. Ese noventa por ciento es exactamente el problema: la revisión superficial no distingue el código correcto del que solo parece correcto."
focusKeyphrase: revisar código generado por IA
seoTitle: "Cómo revisar código generado por IA antes de aceptarlo en un proyecto"
seoDescription: "El checklist que aplico antes de aceptar código generado por IA en un proyecto real, más allá de si compila y pasa los tests."
ogTitle: "Que el código compile no significa que sea el código correcto"
ogDescription: "El proceso que sigo para revisar código generado por IA antes de que entre a un proyecto real."
coverAlt: "Código en un editor con anotaciones de revisión manual sobre líneas específicas"
status: published
publishedAt: 2027-06-14
tags: ia, nextjs
imagePrompt: "Editorial vector illustration, an abstract magnifying glass hovering over lines of code with a few flagged sections, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Escribí en [otro artículo](/es/blog/como-uso-ia-en-mi-flujo-sin-perder-el-criterio) sobre dónde uso IA y dónde no. Esto es lo específico que hago con el código que sí genera, antes de que entre a un proyecto real — el checklist concreto, no el criterio general.

## Por qué "compila y pasa los tests" no es suficiente

Código que compila y pasa los tests que ya existían solo demuestra que no rompió lo que ya se estaba verificando. No demuestra que resuelve el caso que necesito, que maneja el error que va a pasar en producción, o que no introdujo una vulnerabilidad que ningún test existente estaba buscando. La revisión tiene que ir más allá de "no rompió nada visible".

## Lo primero: leerlo como si lo hubiera escrito alguien que nunca vi trabajar

No leo código generado con la confianza con la que leería el de un colega cuyo criterio ya conozco. Lo leo con la desconfianza específica de no saber si esta pieza de código particular tiene un error sutil, porque no tengo ningún historial de esa "persona" que me diga si suele acertar en este tipo de problema.

## El checklist concreto

**¿Maneja los casos donde el dato no llega como se espera?** La IA tiende a escribir para el camino feliz —el dato existe, tiene el formato correcto, la red responde a tiempo. Reviso específicamente qué pasa si el dato es null, si la red falla, si la respuesta llega en un formato inesperado. Casi siempre falta algo ahí.

**¿La validación de seguridad está completa, o solo cubre el caso obvio?** En código que toca autenticación o permisos, reviso específicamente los bordes: ¿qué pasa con un usuario sin sesión? ¿Con un rol que no tiene ese permiso? ¿Con un ID que no existe? La IA suele escribir la validación del caso central y dejar los bordes sin cubrir, que es exactamente donde vive la mayoría de las vulnerabilidades reales.

**¿Está usando la versión correcta de la librería, o una que ya no existe?** Los modelos entrenan con datos de un momento específico, y las APIs cambian. Verifico contra la documentación actual de la librería, no contra lo que el código generado asume, especialmente en proyectos con dependencias que actualizan seguido.

**¿El manejo de errores hace algo útil, o solo atrapa la excepción y sigue?** Un `try/catch` vacío que traga el error sin loguearlo ni propagarlo es peor que no tener manejo de errores — esconde el problema en vez de resolverlo, y cuando algo falla en producción, no hay ningún rastro de qué pasó.

**¿Puedo explicar cada línea sin volver a mirar el código?** Esta es la prueba final, y la más estricta. Si termino de leer el código y no puedo reconstruir de memoria por qué cada parte está ahí, no lo acepto todavía. Aceptar algo que no puedo explicar es aceptar una caja negra que algún día voy a tener que depurar sin entender cómo funciona.

## Un ejemplo concreto de algo que rechacé

Al generar una función para verificar el estado de un webhook de Mercado Pago, el código generado revisaba correctamente la firma de la petición, pero no contemplaba qué pasaba si la misma notificación llegaba dos veces —algo que Mercado Pago hace explícitamente por diseño, para garantizar que el evento se reciba aunque falle la primera entrega. El código generado, sin ese chequeo, hubiera procesado el mismo pago dos veces. No era un error visible en una prueba simple — solo aparecía si la notificación efectivamente se duplicaba, que es exactamente el escenario real que ese código tenía que manejar.

## Por qué este proceso no hace que la IA sea menos útil

Revisar con este nivel de detalle no elimina el valor de generar el código rápido. El ahorro real de tiempo no está en saltarse la revisión — está en no tener que escribir la estructura básica desde cero. La revisión rigurosa sigue haciendo falta, exactamente igual que le haría falta a código escrito por un desarrollador junior talentoso pero sin el contexto completo del proyecto. La diferencia con un junior es que la IA nunca aprende del contexto de la revisión anterior, así que el mismo tipo de error puede repetirse la próxima vez, y hay que volver a revisarlo con el mismo rigor cada vez.
