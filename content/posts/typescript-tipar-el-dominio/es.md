---
slug: tipar-el-dominio-ahorra-mas-bugs-que-cualquier-test
title: "Tipar bien el dominio de negocio ahorra más bugs que cualquier test"
excerpt: "TypeScript se usa casi siempre para atrapar errores de sintaxis. Su valor más grande está en otro lado: hacer que un estado inválido de negocio directamente no se pueda representar en el código."
focusKeyphrase: tipar el dominio con TypeScript
seoTitle: "Tipar el dominio con TypeScript, no solo los typos"
seoDescription: "Tipar el dominio con TypeScript hace que un estado de negocio inválido no se pueda ni escribir, y eso previene más bugs que cualquier test."
ogTitle: "El mejor bug es el que ni siquiera se puede escribir"
ogDescription: "Por qué tipar el dominio de negocio con TypeScript previene más errores que cualquier suite de tests."
coverAlt: "Diagrama de tipos de TypeScript modelando estados válidos de un dominio de negocio"
status: published
publishedAt: 2027-05-31
tags: react, nextjs
imagePrompt: "Editorial vector illustration, an abstract set of interlocking geometric shapes where only valid combinations physically fit together, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

La forma más común de explicar el valor de TypeScript es que atrapa errores antes de producción, con el ejemplo del typo en el nombre de una propiedad. Es real, y es la parte menos interesante. Tipar el dominio con TypeScript apunta a otra cosa: modelar el negocio de forma que un estado inválido no se pueda ni escribir.

## Tipar el dominio con TypeScript previene, no atrapa

Un test atrapa un error después de que el código ya lo permite escribir: corre, falla, avisa. Un tipo bien diseñado hace que ese código no compile. Es una garantía más fuerte, porque no depende de que alguien haya escrito el test correcto ni de que ese test se ejecute a tiempo. Las [uniones discriminadas](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) son la herramienta principal para eso.

## Un ejemplo concreto: el estado de un pedido

La forma ingenua de modelar el estado de un pedido es con un string y un booleano suelto:

```typescript
interface Order {
  status: string; // "pending" | "paid" | "shipped" | "cancelled"
  trackingNumber?: string;
}
```

Este tipo permite escribir estados que no tienen sentido de negocio: un pedido con `status: "pending"` que igual tiene un `trackingNumber` cargado, o un `status: "shpiped"` con la falta de ortografía que TypeScript no puede detectar porque es un string libre.

## Cómo lo modelo en su lugar

```typescript
type Order =
  | { status: "pending" }
  | { status: "paid" }
  | { status: "shipped"; trackingNumber: string }
  | { status: "cancelled"; reason: string };
```

Con esta unión discriminada, un pedido en estado `"shipped"` **tiene que** tener un `trackingNumber` — el tipo no compila si falta. Y un pedido en `"pending"` no puede tener un `trackingNumber`, porque ese campo no existe en esa variante del tipo. El estado inválido —pedido pendiente con número de seguimiento— dejó de ser algo que hay que recordar evitar con disciplina, y pasó a ser algo que el compilador rechaza directamente.

## Por qué esto ahorra más bugs que los tests

Un test que verifica "un pedido pendiente no debería tener tracking number" solo protege ese caso, y solo si alguien pensó en escribirlo. El tipo protege ese caso y todos los que nadie anticipó todavía. La restricción vive en la estructura de datos, no en una verificación que corre después.

Esto no reemplaza los tests: sigo necesitándolos para verificar comportamiento. Pero saca una categoría entera de bugs de su responsabilidad, porque esos bugs ya no pueden existir en el código.

## Dónde aplico esto con más cuidado

**En los límites del sistema.** Los datos de una API externa o de un formulario llegan sin tipo real. Ahí valido y transformo explícitamente hacia el tipo interno, en vez de confiar en que el dato externo viene con la forma correcta. Es el mismo criterio con el que trato la [validación de formularios](/es/blog/validacion-en-tiempo-real-puede-ser-peor-que-al-enviar).

**En los estados que el negocio realmente distingue.** No todo necesita una unión discriminada: para datos simples, un tipo plano alcanza. Reservo este modelado para los conceptos donde el negocio tiene reglas sobre qué combinaciones son válidas. El estado de un pedido, de un pago, o de una publicación de este blog: `draft` contra `published`, donde solo un post publicado tiene sentido con fecha real.

## El costo real de hacerlo así

Modelar el dominio con esta precisión toma más tiempo al principio que usar un string suelto y confiar en la disciplina del equipo. Ese tiempo extra se paga una sola vez, al definir el tipo. El costo de no hacerlo se paga cada vez que alguien, incluido yo meses después, escribe una combinación que no debería existir. Ese costo recurrente casi siempre supera la inversión inicial.

## La señal de que un tipo está mal modelado

Hay una pista que aparece rápido: si el código tiene que preguntar "¿pero esto puede ser null acá?" cada vez que se usa un valor, el tipo no está describiendo el dominio. Está describiendo la forma del JSON que llegó.

Un tipo bien modelado no necesita comentarios que expliquen qué combinaciones son válidas. Si hace falta escribirlo, es porque el tipo permite representar algo que no debería existir.
