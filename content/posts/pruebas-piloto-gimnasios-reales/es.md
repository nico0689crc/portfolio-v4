---
slug: probar-con-clientes-reales-antes-de-escalar
title: "Probar con clientes reales antes de escalar: las pruebas piloto de GymSmartAccess"
excerpt: "Ningún ambiente de desarrollo simula un gimnasio real, con luz solar directa, wifi inestable y un recepcionista apurado. Lo que ajusté después de las pruebas piloto, y por qué ningún test previo lo hubiera mostrado."
focusKeyphrase: pruebas piloto de producto
seoTitle: "Pruebas piloto de producto: qué revelan que un test no"
seoDescription: "Qué ajustes surgieron de las pruebas piloto de producto de GymSmartAccess en gimnasios reales, y por qué el testing controlado no los encuentra."
ogTitle: "El wifi del gimnasio no era el mismo que el de mi departamento"
ogDescription: "Lo que las pruebas piloto en contexto real revelaron que ningún test controlado hubiera mostrado."
coverAlt: "Pantalla de monitor de acceso instalada en la recepción real de un gimnasio"
status: published
publishedAt: 2027-04-05
tags: casos, ux-research, producto
imagePrompt: "Editorial vector illustration, an abstract kiosk screen installed in a real busy environment with light and motion around it, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Antes de ofrecer [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios) como producto general, hice pruebas piloto de producto en gimnasios reales, con socios reales entrando por la puerta real. Esa distinción, real contra simulado, terminó siendo la que más ajustes generó. Ninguno hubiera aparecido en un ambiente de desarrollo, por más cuidadoso que fuera el testing ahí.

## Por qué un ambiente controlado no alcanza para esto

Un test de usabilidad en Maze o una demo en mi computadora tienen algo en común: controlan las variables. Luz constante, conexión estable, un usuario que sabe que lo observan y presta atención completa. Un gimnasio real no controla ninguna de esas tres cosas. Y el producto tiene que funcionar igual, porque esas son las condiciones reales de uso. Es el mismo argumento detrás del [testing de campo](https://www.nngroup.com/articles/field-studies/).

## Qué ajusté después de las pruebas piloto de producto

**El tamaño y contraste de la pantalla del monitor, por la luz real del lugar.** El monitor de recepción que diseñé para leerse en dos segundos —lo documenté en [ese artículo](/es/blog/disenar-una-pantalla-que-se-lea-en-dos-segundos)— se veía perfecto en mi escritorio, con luz de oficina controlada. En la recepción de un gimnasio real, con sol directo entrando por la vidriera a ciertas horas, ese contraste no alcanzaba. Ajusté tamaño y contraste pensando en el peor caso de iluminación, no en el promedio.

**El tiempo de escaneo del QR, por la congestión real en horarios pico.** En una prueba controlada, una persona escanea su QR sin apuro. En un gimnasio real a las siete de la tarde hay fila, y cada segundo extra se multiplica por la cantidad de gente esperando. Esa fricción era invisible en la prueba individual. Reduje el tiempo de procesamiento para ese escenario concurrente, que ningún test de a una persona podía revelar.

**El comportamiento con conexión inestable.** El wifi de un gimnasio de barrio no es el mismo que el de mi oficina. Encontré casos donde una confirmación de pago tardaba más de lo esperado por una conexión más lenta que la probada. Eso me hizo revisar cómo el sistema comunica un estado de "procesando", en vez de dejar al recepcionista sin información.

## Por qué esto no contradice el testing previo

El testing controlado y las pruebas piloto no son sustitutos: resuelven problemas distintos. El controlado responde si el flujo básico tiene sentido, si alguien entiende qué hacer y si la información está donde corresponde. El piloto responde si ese flujo sobrevive a las condiciones reales y desprolijas donde se va a usar.

Saltarse el testing controlado y probar directo en piloto significa gastar el recurso más caro, clientes reales con paciencia limitada, en problemas básicos. Un test de diez personas los encuentra mucho más barato. Hacer los dos, en ese orden, evita ambos errores.

## La señal de que valió la pena hacerlo así

Ningún ajuste que hice después del piloto apareció como queja directa. Nadie escribió "el contraste está mal" ni "el escaneo es lento". Lo noté observando el uso real: dónde alguien entrecerraba los ojos para leer la pantalla, dónde se formaba una fila más larga de lo esperado. Ese tipo de hallazgo casi nunca llega como feedback explícito. Llega solo si estás mirando el contexto real, no el reporte que alguien decide escribir después.

## La regla que aplico ahora en cualquier proyecto nuevo

Antes de llamar "terminado" a un producto que se usa en un contexto físico concreto, un mostrador, un local, una fábrica, insisto en verlo funcionando ahí. Aunque sea con una sola instalación piloto, antes de asumir que el testing de escritorio alcanzó. El contexto real siempre encuentra algo que el ambiente controlado no puede.

Y conviene que el piloto dure más de un día. La primera jornada todo el mundo está atento porque sabe que algo nuevo se está probando. Los problemas que importan aparecen en la segunda semana, cuando el sistema ya es rutina y nadie lo mira con cuidado.
