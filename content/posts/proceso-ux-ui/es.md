---
slug: como-diseno-una-interfaz-desde-cero
title: "Cómo diseño una interfaz desde cero: mi proceso completo de UX/UI"
excerpt: "Las cinco etapas que recorro antes de dar por terminada una interfaz, con los números reales del rediseño que hice para el retailer de tecnología más grande de Argentina."
focusKeyphrase: proceso de diseño UX/UI
seoTitle: "Proceso de diseño UX/UI: cómo diseño una interfaz desde cero"
seoDescription: "Mi proceso de diseño UX/UI en cinco etapas, con datos reales de un rediseño de e-commerce: auditoría, research, arquitectura, prototipo y testing."
ogTitle: "Abrir Figma es el paso cuatro, no el uno"
ogDescription: "El proceso completo que sigo para diseñar una interfaz, con los números del rediseño de Mexx."
coverAlt: "Diagrama de las cinco etapas de un proceso de diseño UX/UI"
status: published
publishedAt: 2026-09-06
tags: ux-research, diseno-ui, producto
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. Five stations along a horizontal path, each more resolved than the last: the first three are loose research marks and rough problem definition blocks, the fourth is a structured layout grid, the fifth a test result panel with plotted outcomes. Composition: horizontal band across the middle third of the frame, wide empty margins above and below, nothing important in the outer 8 percent. Palette: deep navy ground #0F172A, desaturated slate mid-tones #1E293B and #334155, off-white #F8FAFC for thin lines and highlights, and a single amber #F59E0B accent used only on the fourth station, the layout grid. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

Cuando alguien me pide una interfaz nueva, la primera reacción casi siempre es la misma: mandame el Figma. Y es entendible, porque en todo proceso de diseño UX/UI el Figma es lo único que se puede mirar. Pero abrirlo primero es como empezar a cocinar sin saber cuánta gente viene a comer.

Abrir Figma es el paso cuatro. Antes hay tres etapas que no se ven pero que deciden si lo que dibujás sirve o es decoración cara.

Este es el proceso de diseño UX/UI que sigo. No lo inventé yo: está construido sobre los [Cinco Planos de James Garrett](https://www.jjg.net/elements/) y sobre metodologías de research que existen hace décadas. Pero está afinado a fuerza de aplicarlo en proyectos reales. Los números que aparecen acá salen del rediseño que hice para Mexx, el retailer de tecnología más grande de Argentina, con 34 años en el mercado.

## Etapa 1 del proceso de diseño UX/UI: entender antes de opinar

La primera etapa no produce ni un píxel. Produce evidencia.

Cuando arranqué con Mexx, la tentación era obvia: la plataforma se veía anticuada, así que "modernizarla". Ese instinto es exactamente el problema. Modernizar es una opinión estética. No te dice qué está costando plata.

Así que hice tres cosas antes de tener una sola idea de diseño:

**Auditoría heurística.** Recorrí la plataforma contra los 10 principios de usabilidad de Nielsen, uno por uno, documentando cada violación con captura. Resultado: 7 de los 10 principios fallaban. Eso ya no es una opinión, es un inventario.

**Encuesta a usuarios reales.** Diseñé 12 preguntas cuidando no inducir la respuesta —preguntar "¿te molestan los costos ocultos?" garantiza un sí que no significa nada— y la respondieron 10 personas que compran tecnología online.

**Análisis de leyes de UX.** Revisé qué principios de comportamiento estaba violando la interfaz: Hick, Fitts, Jakob, la de proximidad. Encontré 6 en violación directa.

De ahí salieron dos hallazgos que no habría encontrado dibujando:

- El **80%** de los usuarios investigaba en el celular y compraba en la computadora. Y el carrito no sobrevivía el salto, porque vivía en `localStorage`. La persona armaba su compra en el colectivo y llegaba a su casa con el carrito vacío.
- El **100%** de los encuestados mencionó los costos de envío inesperados como motivo de abandono. En Mexx eso incluía productos digitales: una licencia de Windows llegaba al checkout con más de $250 de envío físico, revelado recién en el paso de Mercado Pago.

Ninguno de esos dos problemas era visual. Los dos costaban ventas.

## Etapa 2: definir el problema, no la solución

Con la evidencia arriba de la mesa, la etapa dos es acotar. Y acotar significa, sobre todo, elegir qué **no** vas a resolver.

Un rediseño completo de un e-commerce con 34 años de historia es un proyecto de años. Yo tenía cuatro semanas. Así que la pregunta no era "¿qué está mal?" —la lista era larguísima— sino "¿qué dos cosas, arregladas, mueven la aguja?".

Elegí los dos flujos que la evidencia ya había señalado: persistencia del carrito entre dispositivos y transparencia de costos.

En esta etapa también hice **tree testing** con 10 participantes en UXTweak, que es una prueba de arquitectura de información pura: sin diseño, sin colores, solo el árbol de categorías y una tarea. El resultado fue incómodo y valiosísimo: la categoría "Software" tenía apenas **40% de directness**. La gente no la encontraba porque no la buscaba con ese nombre. La renombré a "Licencias Digitales" y el problema se evaporó.

Ese cambio costó dos palabras. Lo encontré porque testeé la estructura antes de diseñar sobre ella.

## Etapa 3: idear y descartar

Acá sí aparecen las ideas, y aparecen muchas. El trabajo no es tenerlas, es matarlas.

Usé un Lean UX Canvas para ordenar hipótesis y una **matriz FVD** —factibilidad, valor, dificultad— para puntuar 10 ideas. Sobrevivieron 6:

1. Carrito persistente sincronizado en base de datos, no en `localStorage`
2. Desglose flotante de costos, visible desde el primer momento
3. Etiqueta explícita de producto digital
4. Modal de login exprés
5. Checkout como invitado
6. Recuperación de carrito por magic link

Y descarté 4: integración de carrito por WhatsApp, calculadora fiscal de AFIP, chatbot con IA y gamificación. Las cuatro sonaban bien en una reunión. Ninguna resolvía los dos problemas que la evidencia había marcado.

Descartar explícitamente, y dejar registrado por qué, es lo que evita que esas ideas vuelvan tres meses después disfrazadas de "propuesta nueva".

## Etapa 4: recién ahora, Figma

El prototipo de alta fidelidad es donde la mayoría cree que empieza el trabajo. Para mí es donde empieza a hacerse visible.

Construí los dos flujos completos en Figma, con un sistema de diseño real detrás: paleta con el rojo de la marca (#E73E3E), tipografías Inter y Merriweather, sistema de espaciado de 4 píxeles, componentes atómicos reutilizables y seis animaciones documentadas.

La palabra clave ahí es **sistema**. Un prototipo bonito es una imagen. Un sistema de diseño es algo que un desarrollador puede implementar sin adivinar: cada color es un token, cada espaciado es un múltiplo, cada componente tiene estados definidos.

Como yo también escribo el código, esa diferencia me la cobro a mí mismo. Un diseño que no se puede implementar es un diseño que no terminé.

## Etapa 5: testear, que es la etapa que casi nadie hace

Acá se separa el diseño que sirve del diseño que gusta.

Corrí un test de usabilidad en Maze con 10 participantes sobre las dos tareas críticas. Los resultados:

**Tarea 1 — continuidad del carrito:** 100% de tasa de éxito, 32 segundos promedio, 80% de directness, 0% de abandono.

**Tarea 2 — transparencia de costos:** 85,7% de éxito, 71 segundos, 40% de directness, 14,3% de abandono.

Y acá viene lo interesante: ese 14,3% de abandono en la tarea 2 **no es una falla del diseño**. Es gente que vio el costo, lo evaluó y decidió no comprar. Eso es exactamente lo que tiene que pasar cuando la información es transparente. La alternativa —que compren sin ver el costo y lo descubran en el último paso— no es una conversión, es una devolución con enojo.

Leer bien esa métrica es la diferencia entre entender el dato y usarlo para justificar lo que ya querías hacer.

El test también me marcó algo que yo no estaba buscando: un **49-51% de misclick rate** en el header. La jerarquía visual del encabezado no estaba resuelta. No llegué a arreglarlo en esas cuatro semanas, y lo dejé documentado como deuda, porque un caso de estudio que solo cuenta lo que salió bien no es un caso de estudio, es un folleto.

## Lo que este proceso me cambió como desarrollador

Yo entré al diseño desde el código, no al revés. Y el efecto más fuerte no fue aprender a usar Figma: fue dejar de discutir interfaces con opiniones.

Antes, una discusión sobre un botón terminaba en quién tenía más autoridad en la sala. Ahora termina en qué dice el tree test. Es una forma mucho menos agotadora de trabajar, y produce mejores productos.

También me cambió el orden en que construyo. Cuando arranqué [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios), mi plataforma SaaS para gimnasios, empecé por entender por qué los dueños perseguían a los socios para cobrarles, no por elegir el framework. El stack salió de ahí, no al revés.

## El resumen honesto

Cinco etapas: entender, definir, idear, prototipar, testear. Tres de las cinco pasan antes de abrir Figma.

Si tenés poco tiempo y tenés que elegir una sola, elegí la primera. Una auditoría heurística y diez encuestas bien hechas te dan más dirección que dos semanas de explorar visuales. Y si tenés que elegir dos, agregá la última: testear con diez personas te dice en una tarde lo que si no vas a descubrir recién en producción, con usuarios reales y plata real de por medio.

El caso completo de Mexx, con las capturas y el prototipo navegable, está en [mi portafolio](/es/proyectos/rediseno-ux-ui-ecommerce-mexx). Y si estás pensando en un proyecto donde el diseño y el código se piensen juntos desde el arranque, [escribime](/es/contacto).
