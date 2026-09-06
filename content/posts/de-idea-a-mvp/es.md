---
slug: de-idea-a-mvp-que-construir
title: "De idea a MVP: cómo decido qué construir y qué dejar afuera"
excerpt: "La parte difícil de un MVP no es construirlo, es recortarlo. El método que uso para decidir qué entra en la primera versión, con las decisiones reales del SaaS que sostengo en producción."
focusKeyphrase: cómo definir un MVP
seoTitle: "Cómo definir un MVP: qué construir y qué dejar afuera"
seoDescription: "Cómo definir un MVP con criterio: una sola pregunta de negocio, la prueba del camino crítico y la lista escrita de lo que queda afuera."
ogTitle: "Un MVP no es tu producto con menos cosas"
ogDescription: "Cómo decidir qué entra en la primera versión, con las decisiones reales de un SaaS en producción."
coverAlt: "Diagrama de alcance de producto con funcionalidades dentro y fuera de la primera versión"
status: published
publishedAt: 2026-09-21
tags: producto, negocio
imagePrompt: "Editorial vector illustration, an abstract funnel narrowing many geometric shapes down to one solid shape, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Todos los proyectos que vi fracasar por alcance fracasaron igual: nadie dijo que no a tiempo. Saber cómo definir un MVP es, sobre todo, saber recortarlo. No fue una mala decisión grande, fueron treinta decisiones chicas, cada una razonable por separado, que convirtieron una primera versión de tres meses en una de catorce.

La parte difícil de un MVP no es construirlo. Es recortarlo. Y recortar es una habilidad incómoda porque cada cosa que sacás tiene a alguien que la quiere.

Este es el método que uso. Lo apliqué construyendo [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios), mi plataforma para gimnasios, que está en producción con clientes que pagan. Las decisiones de acá tuvieron consecuencias reales, no de ejercicio.

## Cómo definir un MVP: primero, no es tu producto con menos cosas

La confusión más cara del vocabulario de producto es tratar al MVP como una versión recortada del producto final. No lo es.

Un MVP es **un experimento con forma de software**, en el sentido original que le dio [Eric Ries](http://www.startuplessonslearned.com/2009/08/minimum-viable-product-guide.html). Existe para responder una pregunta que todavía no sabés responder, lo más barato posible. Si ya sabés la respuesta, no necesitás un MVP: necesitás construir bien la primera versión.

La diferencia es práctica. Si es una versión recortada, la pregunta es "¿qué le saco?", y eso no tiene criterio: todo parece necesario. Si es un experimento, la pregunta es "¿qué necesito para contestar esto?", y de golpe la mitad de la lista se cae sola.

## Segundo: escribí la pregunta, una sola

Antes de listar funcionalidades, escribo en una línea qué quiero saber.

En GymSmartAccess la pregunta fue: **¿un dueño de gimnasio de barrio va a pagar una cuota mensual por dejar de perseguir a sus socios para cobrarles?**

Fijate lo que esa pregunta no incluye. No pregunta si el sistema puede manejar 500 sedes. No pregunta si la app es linda. No pregunta si hay reportes. Pregunta una cosa de negocio, y la respuesta es sí o no.

Toda funcionalidad que no ayude a contestarla es candidata a quedar afuera. No "mala idea": afuera **de esta versión**.

## Tercero: la prueba del camino crítico

Con la pregunta escrita, dibujo el camino más corto entre un usuario que no conoce el producto y el momento donde la pregunta queda contestada.

Para GymSmartAccess ese camino era: el dueño carga sus socios → el socio recibe un link de pago → paga → el sistema lo marca al día → el socio entra al gimnasio mostrando un QR → el monitor de recepción dice si está al día.

Eso es el producto. Todo lo demás es equipaje.

Cada funcionalidad que alguien propone pasa por una pregunta única: **si esto no existe, ¿el camino se corta?** Si el camino sigue funcionando sin eso, no entra. No importa cuánto se pida ni cuán barato parezca.

Lo barato es justamente la trampa: nadie agrega catorce meses de una vez, los agrega en tandas de "esto son dos días".

## Cuarto: la lista de lo que queda afuera, escrita

Este paso parece burocracia y es el que más discusiones ahorra.

Escribo explícitamente qué dejo afuera y por qué. En GymSmartAccess la lista incluía: app nativa (la PWA alcanza para mostrar un QR), reportes avanzados (nadie paga por gráficos antes de confiar en los cobros), multi-sede (mi pregunta era sobre gimnasios de una sola sede), rutinas de entrenamiento (otro producto disfrazado de funcionalidad) y control de acceso biométrico (el costo en dólares del hardware es exactamente el problema que vengo a resolver).

Escribirlo hace dos cosas. Le muestra a quien lo pidió que su idea fue considerada y no ignorada, que es la mitad de la discusión. Y evita que la misma idea vuelva en tres meses presentada como nueva.

## Quinto: elegí el stack después, no antes

Esto se hace mal casi siempre, y yo lo hice mal durante años.

La tecnología es una consecuencia de las restricciones, no un punto de partida. En GymSmartAccess las restricciones eran: cobros recurrentes en Argentina (o sea Mercado Pago, no hay opción), cero costo de hardware para el gimnasio (o sea QR en el celular del socio, no biometría), y un solo desarrollador sosteniéndolo (o sea infraestructura administrada, no servidores que cuidar).

De ahí salió el stack. Si hubiera elegido el stack primero, habría llegado a las restricciones cuando ya era caro cambiar.

## El error que igual cometí

Para no vender esto como un método infalible: igual me pasé de alcance.

Construí el monitor de recepción en tiempo real —la pantalla que le avisa al recepcionista si el socio está al día— con más pulido del necesario para responder la pregunta. Animaciones, estados sonoros, diseño legible a distancia. Nada de eso era necesario para saber si alguien pagaría.

Lo hice porque era la parte divertida. Ese es el sesgo real y ningún método lo elimina: recortás mejor las funcionalidades ajenas que las tuyas.

Lo que sí puedo decir es que el pulido llegó después de que el camino crítico funcionara completo. El orden importa incluso cuando la disciplina falla.

## El resumen

Una pregunta de negocio escrita en una línea. Un camino crítico dibujado de punta a punta. Una regla única: si el camino no se corta, no entra. Y una lista escrita de lo que queda afuera, para que las discusiones ocurran una vez.

Si estás por arrancar un proyecto a medida y querés que el alcance se decida así, [escribime](/es/contacto): la primera conversación siempre es sobre la pregunta, no sobre la lista de funcionalidades.
