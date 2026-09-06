---
slug: tipar-el-dominio-ahorra-mas-bugs-que-cualquier-test
title: "Tipar bien el dominio de negocio ahorra más bugs que cualquier test"
excerpt: "TypeScript se usa casi siempre para atrapar errores de sintaxis. Su valor más grande está en otro lado: hacer que un estado inválido de negocio directamente no se pueda representar en el código."
focusKeyphrase: tipar el dominio con TypeScript
seoTitle: "TypeScript: tipar el dominio de negocio en vez de solo atrapar errores de sintaxis"
seoDescription: "Por qué el mayor valor de TypeScript no es atrapar errores tipográficos sino hacer que un estado de negocio inválido no se pueda representar, con ejemplos concretos."
ogTitle: "El mejor bug es el que ni siquiera se puede escribir"
ogDescription: "Por qué tipar el dominio de negocio con TypeScript previene más errores que cualquier suite de tests."
coverAlt: "Diagrama de tipos de TypeScript modelando estados válidos de un dominio de negocio"
status: published
publishedAt: 2027-08-02
tags: react, nextjs
imagePrompt: "Editorial vector illustration, an abstract set of interlocking geometric shapes where only valid combinations physically fit together, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

La forma más común de explicar el valor de TypeScript es "atrapa errores antes de que lleguen a producción" — típicamente ejemplificado con un typo en el nombre de una propiedad. Eso es real, pero es la parte menos interesante de lo que un buen sistema de tipos puede hacer. El valor más grande está en modelar el dominio de negocio de forma que un estado inválido no se pueda ni siquiera escribir.

## La diferencia entre atrapar un error y prevenir que exista

Un test atrapa un error después de que el código ya lo permite escribir — corre, falla, avisa. Un tipo bien diseñado hace que ese código directamente no compile, lo cual es una garantía más fuerte: no depende de que alguien haya escrito el test correcto para ese caso específico, ni de que ese test se ejecute antes de llegar a producción.

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

Un test que verifica "un pedido pendiente no debería tener tracking number" solo protege ese caso específico, y solo si alguien pensó en escribirlo. El tipo protege ese caso y todos los casos futuros que nadie anticipó todavía, porque la restricción vive en la estructura de datos, no en una verificación que corre después.

Esto no reemplaza los tests — sigo necesitando tests para verificar comportamiento, no solo estructura de datos. Pero elimina una categoría entera de bugs de la responsabilidad de los tests, porque esos bugs específicos ya no pueden existir en el código para empezar.

## Dónde aplico esto con más cuidado

**En los límites del sistema.** Los datos que vienen de una API externa o de un formulario llegan sin tipo real, como `any` disfrazado de `unknown`. Ahí valido y transformo explícitamente hacia el tipo interno bien modelado, en vez de confiar en que el dato externo ya viene con la forma correcta.

**En los estados que el negocio realmente distingue.** No todo necesita una unión discriminada — para datos simples, un tipo plano alcanza. Reservo este nivel de modelado para los conceptos donde el negocio realmente tiene reglas sobre qué combinaciones son válidas, como el estado de un pedido, de un pago, o de una publicación de este mismo blog (`draft` vs `published`, donde solo un post publicado tiene sentido con una fecha de publicación real).

## El costo real de hacerlo así

Modelar el dominio con este nivel de precisión toma más tiempo al principio que usar un string suelto y confiar en la disciplina del equipo para no escribir combinaciones inválidas. Ese tiempo extra se paga una sola vez, al definir el tipo. El costo de no hacerlo se paga cada vez que alguien —incluido yo mismo, meses después— escribe sin querer una combinación que no debería existir, y ese costo recurrente casi siempre termina siendo mayor que la inversión inicial.
