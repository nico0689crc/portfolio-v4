---
slug: tree-testing-arquitectura-informacion
title: "Tree testing: cómo descubrí que una categoría entera no se entendía"
excerpt: "Probar la estructura antes de diseñar sobre ella cuesta una tarde y evita rediseñar un menú dos veces. Cómo se hace y qué significan los números que devuelve."
focusKeyphrase: tree testing
seoTitle: "Tree testing: cómo probar la arquitectura de un sitio"
seoDescription: "Qué es el tree testing, cómo armarlo y cómo leer la tasa de éxito y el directness, con un caso real donde una categoría tenía 40% de directness."
ogTitle: "Renombrar una categoría subió su hallazgo de 40% a casi el doble"
ogDescription: "Cómo probar si tu menú se entiende, antes de diseñar sobre él."
coverAlt: "Árbol de categorías de un sitio con caminos de navegación marcados"
status: published
publishedAt: 2026-10-05
tags: ux-research
imagePrompt: "Editorial vector illustration, an abstract branching tree diagram of nested nodes with one path highlighted, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Hay un tipo de error de diseño que no se arregla con diseño, y el tree testing existe para encontrarlo: cuando el problema no es cómo se ve el menú, sino cómo se llaman las cosas que hay adentro.

Ese error es caro porque se descubre tarde. Rediseñás la navegación, queda preciosa, y la gente sigue sin encontrar lo que busca. Entonces culpás al diseño visual, lo cambiás otra vez, y tampoco.

El tree testing existe para descubrirlo antes. Y es de las técnicas de research más baratas que hay.

## Qué es el tree testing

Le mostrás a alguien **solamente la estructura** —el árbol de categorías y subcategorías, en texto plano, sin colores, sin diseño, sin buscador— y le pedís que encuentre algo. Es la contraparte del [card sorting](https://www.nngroup.com/articles/card-sorting-definition/): uno propone la estructura, el otro la pone a prueba.

Sin diseño es la parte importante. Si mostrás la interfaz real, no sabés si encontró el producto porque la estructura tiene sentido o porque un banner naranja se lo puso adelante. Al sacar todo lo visual, lo único que queda a prueba es si los nombres significan lo que vos creés que significan.

## Cómo armo un tree testing

**Escribo tareas, no preguntas.** No es "¿dónde pondrías las licencias?" —eso pregunta por su opinión de arquitecto—, sino "necesitás comprar una licencia de Windows 11: ¿dónde la buscás?". La tarea imita una intención real.

**Evito las palabras del árbol en la tarea.** Si la tarea dice "buscá software antivirus" y hay una categoría llamada "Software", no probaste nada: probaste si sabe leer. La tarea tiene que estar escrita con el vocabulario del usuario, no con el del menú.

**Entre 5 y 8 tareas.** Más que eso y la gente se cansa, y el cansancio se ve en los datos como si fuera confusión.

**10 participantes alcanzan.** Como en casi todo el research cualitativo, los patrones aparecen rápido.

Yo usé UXTweak. Optimal Workshop es la otra herramienta estándar. Ambas devuelven lo mismo.

## Los dos números que importan

**Tasa de éxito:** cuántos llegaron al destino correcto. Es el número obvio y el menos interesante.

**Directness:** cuántos llegaron **sin dar vueltas**, sin entrar y salir de otras ramas. Este es el número que hay que mirar.

La diferencia entre los dos es todo el hallazgo. Una tarea con éxito alto y directness bajo significa: *la gente termina encontrándolo, pero después de buscar en dos o tres lugares equivocados primero*. En un test eso se ve como éxito. En producción eso se ve como abandono, porque en la vida real nadie tiene la paciencia de un participante de estudio que sabe que lo están observando.

## El caso concreto

En el tree test que hice para el rediseño de Mexx, la categoría **"Software" tenía 40% de directness**.

Seis de cada diez personas que buscaban una licencia de Windows no iban primero a "Software". Iban a "Accesorios", a "Servicios", o buscaban en el buscador. La palabra "Software" venía del catálogo interno de la empresa — una categoría que tenía sentido para quien administra el inventario y no para quien compra.

La renombré a **"Licencias Digitales"**, que es más cerca de lo que la gente tiene en la cabeza cuando quiere comprar Windows u Office.

Ese cambio costó dos palabras. Y lo encontré porque probé la estructura antes de diseñar sobre ella. Si lo hubiera descubierto después del rediseño visual, el arreglo hubiera sido el mismo pero habría llegado con dos semanas de trabajo encima.

## Cuándo conviene hacerlo

**Antes de rediseñar una navegación.** Es el momento obvio y el más rentable.

**Cuando el buscador se usa demasiado.** Si una porción grande de tu tráfico va directo al buscador, no es que a la gente le guste buscar: es que se rindió con el menú. El buscador está tapando un problema de arquitectura.

**Cuando soporte recibe siempre la misma pregunta.** "¿Dónde encuentro X?" repetido es un tree test que ya te están haciendo gratis, solo que sin datos.

## El límite

El tree testing te dice si **los nombres y la jerarquía** funcionan. No te dice nada sobre si la página de producto convierte, si el checkout es claro o si el sitio carga rápido. Es una herramienta de precisión quirúrgica para un problema específico.

Y como todo research, no reemplaza la decisión: la informa. El test me dijo que "Software" no se entendía. Elegir "Licencias Digitales" en vez de "Programas" o "Descargas" sigue siendo un juicio de diseño — pero ahora es un juicio con piso.

Esta es una de las técnicas que uso en la etapa de definición de [mi proceso de diseño](/es/blog/como-diseno-una-interfaz-desde-cero), después de la [auditoría heurística](/es/blog/auditoria-heuristica-nielsen) y antes de dibujar cualquier cosa.
