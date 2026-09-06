---
slug: como-reviso-codigo-generado-por-ia-antes-de-aceptarlo
title: "Cómo reviso código generado por IA antes de aceptarlo"
excerpt: "El código que genera una IA se ve razonable el noventa por ciento de las veces. Ese noventa por ciento es exactamente el problema: la revisión superficial no distingue el código correcto del que solo parece correcto."
focusKeyphrase: revisar código generado por IA
seoTitle: "Cómo revisar código generado por IA antes de aceptarlo"
seoDescription: "El checklist para revisar código generado por IA antes de que entre a un proyecto real, mucho más allá de si compila y pasa los tests."
ogTitle: "Que el código compile no significa que sea el código correcto"
ogDescription: "El proceso que sigo para revisar código generado por IA antes de que entre a un proyecto real."
coverAlt: "Código en un editor con anotaciones de revisión manual sobre líneas específicas"
status: published
publishedAt: 2027-04-12
tags: ia, nextjs
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. A block of code passing cleanly through a structural check gate, then entering a second slower manual inspection where one inner line is circled and pulled out of the block. Composition: horizontal band across the middle third of the frame, wide empty margins above and below, nothing important in the outer 8 percent. Palette: deep navy ground #0F172A, desaturated slate mid-tones #1E293B and #334155, off-white #F8FAFC for thin lines and highlights, and a single amber #F59E0B accent used only on the circled line pulled out. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

Escribí en [otro artículo](/es/blog/como-uso-ia-en-mi-flujo-sin-perder-el-criterio) sobre dónde uso IA y dónde no. Esto es lo que significa revisar código generado por IA en la práctica, antes de que entre a un proyecto real: el checklist concreto, no el criterio general.

## Por qué "compila y pasa los tests" no es suficiente

Código que compila y pasa los tests existentes solo demuestra que no rompió lo que ya se verificaba. No demuestra que resuelve el caso que necesito, que maneja el error que va a pasar en producción, ni que no introdujo una vulnerabilidad que ningún test buscaba. Las categorías del [OWASP Top 10](https://owasp.org/www-project-top-ten/) siguen aplicando igual, venga el código de donde venga.

## Lo primero: leerlo como si lo hubiera escrito alguien que nunca vi trabajar

No leo código generado con la confianza con la que leería el de un colega cuyo criterio conozco. Lo leo con la desconfianza de no saber si esta pieza tiene un error sutil. No tengo historial de esa "persona" que me diga si suele acertar en este tipo de problema.

## El checklist para revisar código generado por IA

**¿Maneja los casos donde el dato no llega como se espera?** La IA tiende a escribir para el camino feliz —el dato existe, tiene el formato correcto, la red responde a tiempo. Reviso específicamente qué pasa si el dato es null, si la red falla, si la respuesta llega en un formato inesperado. Casi siempre falta algo ahí.

**¿La validación de seguridad está completa, o solo cubre el caso obvio?** En código que toca autenticación o permisos, reviso específicamente los bordes: ¿qué pasa con un usuario sin sesión? ¿Con un rol que no tiene ese permiso? ¿Con un ID que no existe? La IA suele escribir la validación del caso central y dejar los bordes sin cubrir, que es exactamente donde vive la mayoría de las vulnerabilidades reales.

**¿Está usando la versión correcta de la librería, o una que ya no existe?** Los modelos entrenan con datos de un momento específico, y las APIs cambian. Verifico contra la documentación actual de la librería, no contra lo que el código generado asume, especialmente en proyectos con dependencias que actualizan seguido.

**¿El manejo de errores hace algo útil, o solo atrapa la excepción y sigue?** Un `try/catch` vacío que traga el error sin loguearlo ni propagarlo es peor que no tener manejo de errores — esconde el problema en vez de resolverlo, y cuando algo falla en producción, no hay ningún rastro de qué pasó.

**¿Puedo explicar cada línea sin volver a mirar el código?** Esta es la prueba final, y la más estricta. Si termino de leer el código y no puedo reconstruir de memoria por qué cada parte está ahí, no lo acepto todavía. Aceptar algo que no puedo explicar es aceptar una caja negra que algún día voy a tener que depurar sin entender cómo funciona.

## Un ejemplo concreto de algo que rechacé

Al generar una función para verificar un webhook de Mercado Pago, el código revisaba bien la firma de la petición. Pero no contemplaba qué pasaba si la misma notificación llegaba dos veces, algo que Mercado Pago hace por diseño para garantizar la entrega. Sin ese chequeo hubiera procesado el mismo pago dos veces. No era un error visible en una prueba simple: solo aparecía si la notificación se duplicaba, que era el escenario real que ese código tenía que manejar.

## Por qué este proceso no hace que la IA sea menos útil

Revisar con este detalle no elimina el valor de generar el código rápido. El ahorro real no está en saltarse la revisión: está en no escribir la estructura básica desde cero. La revisión rigurosa sigue haciendo falta, igual que con código de un junior talentoso sin el contexto completo del proyecto. La diferencia es que la IA nunca aprende de la revisión anterior. El mismo error puede repetirse la próxima vez, y hay que buscarlo con el mismo rigor cada vez.
