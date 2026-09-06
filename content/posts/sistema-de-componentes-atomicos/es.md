---
slug: componentes-atomicos-que-realmente-se-reutilizan
title: "Componentes atómicos que se reutilizan de verdad (no solo en la teoría)"
excerpt: "El atomic design se explica fácil y se aplica mal seguido: componentes que técnicamente son atómicos pero que nadie reutiliza porque nacieron acoplados a una sola pantalla."
focusKeyphrase: componentes atómicos
seoTitle: "Componentes atómicos que se reutilizan: cómo evitar el atomic design de mentira"
seoDescription: "Por qué muchos sistemas de componentes 'atómicos' no se reutilizan en la práctica, y el criterio que uso para diseñar componentes que sí sobreviven a la segunda pantalla."
ogTitle: "Un componente reutilizable no sabe en qué pantalla está"
ogDescription: "El criterio real detrás del atomic design, más allá de la nomenclatura de átomos y moléculas."
coverAlt: "Componentes de interfaz organizados de piezas pequeñas a pantallas completas"
status: published
publishedAt: 2026-11-23
tags: design-systems, react, diseno-ui
imagePrompt: "Editorial vector illustration, small abstract geometric pieces assembling upward into larger composite shapes, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

El atomic design tiene un problema de marketing: la metáfora de átomos, moléculas y organismos es tan pegadiza que la gente memoriza los nombres y se olvida de la pregunta que la metodología en realidad viene a contestar. Y sin esa pregunta, terminás con una carpeta de "átomos" que técnicamente cumple la nomenclatura y que en la práctica nadie reutiliza.

## La pregunta que importa, no la metáfora

**¿Este componente sabe en qué pantalla está?**

Si la respuesta es sí, no es reutilizable, sin importar cuán chico sea o en qué carpeta lo hayas guardado. Un botón que dice `if (page === 'checkout') { ... }` adentro no es un átomo. Es un componente de la pantalla de checkout que decidiste mover de carpeta.

La prueba real de un componente atómico es: **¿podría usarse en una pantalla que todavía no existe, sin que nadie tenga que tocarlo?** Si la respuesta es no, el componente está acoplado a algo, aunque el acoplamiento no se note a simple vista.

## Dónde se filtra el acoplamiento, en la práctica

**Texto hardcodeado en vez de props.** Un componente `Badge` que dice `<span>Disponible</span>` en vez de recibir el texto como prop está atado a un solo caso de uso. El día que necesitás el mismo badge para decir "Agotado", terminás copiando el componente entero en vez de reutilizarlo, porque copiarlo es más rápido que refactorizarlo bajo presión de entrega.

**Estilos que asumen su contenedor.** Un componente con `margin-top: 40px` fijo asume que siempre va a estar debajo de algo específico. El margen es responsabilidad del padre, que sabe qué hay alrededor — el componente en sí no debería saber si tiene algo arriba o no. Esto es exactamente lo que describí en [de Figma a producción](/es/blog/de-figma-a-produccion-sin-perder-nada) sobre diseñar con espaciado consistente vía [tokens](/es/blog/design-tokens-figma-a-tailwind): el espaciado externo vive en quien lo usa, no en el componente.

**Lógica de negocio adentro de un componente visual.** Un componente `PriceTag` que calcula el descuento adentro suyo deja de ser un componente de presentación y pasa a ser una regla de negocio disfrazada de UI. El día que la regla de descuento cambia, hay que tocar un archivo que se supone que solo debía dibujar un número.

## El criterio que uso para saber si algo es realmente un átomo

Un componente pasa la prueba si cumple tres cosas:

**Recibe todo por props, no asume nada del contexto.** Ni el texto, ni el estado, ni el color vienen hardcodeados — todos entran desde afuera.

**No tiene margen ni posición propios.** El espaciado externo es responsabilidad de quien lo usa. El componente solo controla su espaciado interno.

**No conoce reglas de negocio.** Si tiene que decidir algo más complejo que "cómo me veo con estos datos", esa decisión no es suya.

Con esas tres condiciones, un botón, una etiqueta o una tarjeta se pueden mover a cualquier pantalla futura sin que nadie tenga que abrir el archivo y "adaptarlo primero". Sin ellas, cada componente nuevo hereda el acoplamiento del anterior, y el sistema de diseño se convierte en una colección de componentes que técnicamente están en la carpeta correcta pero que en la práctica nadie reutiliza — cada pantalla nueva termina escribiendo los suyos, porque adaptar el existente sale más caro que copiarlo.

## Cuándo NO conviene atomizar

Esto tiene un límite, y vale la pena decirlo porque el extremo contrario también falla.

No todo necesita ser un átomo reutilizable. Una sección específica de una landing page, que existe una sola vez en todo el sitio, no gana nada siendo diseñada como si fuera a reutilizarse en cinco lugares. Atomizar algo que nunca se va a repetir es trabajo invertido en una flexibilidad que nadie va a usar, y ese trabajo tiene el mismo costo de oportunidad que cualquier otro.

La señal para atomizar es que **ya viste el patrón repetirse dos veces**, no que podría llegar a repetirse algún día. Construir la abstracción antes de tener el segundo caso real casi siempre adivina mal la forma que el componente necesitaba tener.

## El resultado, cuando funciona

En este mismo portafolio, el componente `Reveal` que envuelve casi todas las animaciones de scroll no sabe si está en el hero, en una tarjeta del blog o en una pregunta del FAQ. Recibe la animación como prop, recibe el contenido como children, y no le importa nada más. Por eso se usa en más de diez lugares distintos sin que ninguno haya requerido tocar el componente en sí.

Esa es la prueba de que un componente es atómico de verdad: no que esté en la carpeta `atoms/`, sino que nadie necesitó abrirlo para usarlo en un lugar nuevo.
