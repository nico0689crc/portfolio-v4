---
slug: auditoria-heuristica-nielsen
title: "Cómo audito una interfaz con los 10 principios de Nielsen"
excerpt: "Una auditoría heurística es la forma más barata de encontrar problemas reales antes de tocar un píxel. Así la hago, con lo que encontré al aplicarla sobre un e-commerce con 34 años en el mercado."
focusKeyphrase: auditoría heurística
seoTitle: "Auditoría heurística: cómo evaluar una interfaz"
seoDescription: "Cómo hacer una auditoría heurística paso a paso con los 10 principios de Nielsen, con un caso real donde 7 de 10 principios fallaban."
ogTitle: "7 de 10 principios de usabilidad fallaban. Y nadie lo había notado"
ogDescription: "Cómo hacer una auditoría heurística que encuentre problemas reales, no opiniones de diseño."
coverAlt: "Lista de verificación de principios de usabilidad sobre una interfaz"
status: published
publishedAt: 2026-08-03
tags: ux-research, casos
imagePrompt: "Editorial vector illustration, a magnifying glass over an abstract wireframe interface with small warning markers, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

La auditoría heurística tiene mala fama porque suena a burocracia: una checklist, un informe, nadie la lee. Pero es la herramienta con mejor relación entre lo que cuesta y lo que encuentra. No necesitás usuarios, no necesitás presupuesto y no necesitás permiso. Necesitás una tarde y un método.

Es también la única forma que conozco de convertir "esta interfaz está mal" en una lista que se puede discutir sin pelear.

## Qué es, en concreto

Recorrer la interfaz evaluándola contra los [10 principios de usabilidad](https://www.nngroup.com/articles/ten-usability-heuristics/) que Jakob Nielsen publicó en 1994 y que envejecieron sorprendentemente bien. No es una opinión sobre si algo se ve lindo. Es un chequeo contra criterios que existen antes de que vos llegaras al proyecto.

Los diez, en una línea cada uno:

1. **Visibilidad del estado del sistema.** ¿El sistema me dice qué está pasando?
2. **Correspondencia con el mundo real.** ¿Habla mi idioma o el de la base de datos?
3. **Control y libertad del usuario.** ¿Puedo deshacer, salir, volver?
4. **Consistencia y estándares.** ¿Lo mismo se llama y se ve igual en todos lados?
5. **Prevención de errores.** ¿Me evita el error o solo me lo avisa después?
6. **Reconocer antes que recordar.** ¿Tengo que acordarme de algo de la pantalla anterior?
7. **Flexibilidad y eficiencia.** ¿Hay atajos para el que ya sabe?
8. **Diseño estético y minimalista.** ¿Cada cosa en pantalla se gana su lugar?
9. **Ayuda para reconocer y recuperarse de errores.** ¿El mensaje dice qué hacer?
10. **Ayuda y documentación.** ¿Puedo encontrar cómo se hace algo?

## Cómo la hago

**Elijo flujos, no pantallas.** Auditar "el sitio" no termina nunca. Auditar "comprar un producto digital desde el celular" tiene principio y fin. Yo tomo dos o tres flujos críticos —los que generan plata o los que generan soporte— y los recorro completos.

**Grabo la pantalla mientras lo hago.** Es el paso que más me cambió el resultado. Cuando revisás la grabación después, ves las dudas que tuviste en el momento y que ya te olvidaste: dónde frenaste, dónde volviste atrás, dónde leíste dos veces. Esa vacilación es el hallazgo.

**Documento cada violación con tres cosas:** captura, qué principio viola y qué le pasa al usuario. Ese tercer punto es el que hace que el informe se lea. "Viola el principio 1" no le importa a nadie. "El usuario no sabe si el pago se procesó y vuelve a apretar" mueve prioridades.

**Puntúo la severidad.** Uso la escala del propio Nielsen, de 0 a 4. Sin severidad, un informe con 40 hallazgos es una lista de reclamos. Con severidad, es un plan de trabajo.

## Lo que encontré en Mexx

Apliqué esto sobre la plataforma de Mexx, el retailer de tecnología más grande de Argentina. **7 de los 10 principios fallaban.** Dos ejemplos que muestran por qué esto no es un ejercicio académico:

**Correspondencia con el mundo real.** La categoría se llamaba "Software". La gente buscaba "licencias", "Windows", "Office". El nombre venía del catálogo interno, no del vocabulario del que compra. Un tree test posterior lo confirmó con número: **40% de directness**, o sea que 6 de cada 10 personas no llegaban.

**Prevención de errores.** Una licencia digital de Windows sumaba más de $250 de envío físico. Un producto que se descarga, con costo de flete. El error no era del usuario: el sistema lo dejaba entrar a un camino sin salida y se lo avisaba en el último paso, en la pantalla de Mercado Pago.

Ninguno de los dos hallazgos tenía que ver con lo que la interfaz parecía. Los dos costaban ventas.

## Lo que la auditoría heurística no puede hacer

Acá está el límite, y decirlo importa más que vender la técnica.

Una auditoría heurística te dice **qué está probablemente mal**. No te dice **qué tan seguido pasa** ni **a cuánta gente**. Sos vos evaluando, con tu criterio y tus sesgos, no diez personas usando el producto.

Por eso yo nunca la uso sola. La uso como primer filtro: reduce una superficie enorme a una lista corta de hipótesis, y recién ahí gasto el recurso caro —usuarios reales— en confirmar las que importan. En Mexx, la auditoría marcó los costos ocultos como sospechosos; la encuesta los confirmó cuando el **100%** de los encuestados los mencionó como motivo de abandono.

La auditoría encuentra. El test confirma. Saltarse el segundo paso es como diagnosticar por teléfono.

## Por dónde empezar mañana

Si nunca hiciste una, no arranques por el sitio entero. Elegí **un flujo**, grabá la pantalla mientras lo recorrés como si fueras un usuario nuevo, y anotá cada vez que dudás. Después mapeá esas dudas contra los diez principios.

Casi siempre, la mitad de tus dudas caen en el principio 2 —el sistema hablando en su idioma y no en el tuyo— y esa es, en mi experiencia, la clase de problema más barata de arreglar y la que más rápido se nota.

Este es uno de los cinco pasos de [mi proceso completo de diseño](/es/blog/como-diseno-una-interfaz-desde-cero), y el caso entero de Mexx, con el prototipo navegable, está en [el portafolio](/es/proyectos/rediseno-ux-ui-ecommerce-mexx).
