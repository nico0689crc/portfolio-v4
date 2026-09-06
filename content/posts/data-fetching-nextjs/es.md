---
slug: data-fetching-en-nextjs-donde-pido-los-datos
title: "Data fetching en Next.js: dónde pido los datos y por qué importa dónde"
excerpt: "El mismo dato pedido en el componente equivocado puede significar tres segundos de espera o cero. La regla que uso para decidir en qué nivel del árbol hacer cada consulta."
focusKeyphrase: data fetching Next.js
seoTitle: "Data fetching en Next.js: dónde pedir los datos"
seoDescription: "Cómo hacer data fetching en Next.js App Router sin cascadas ni pedidos duplicados: en qué componente del árbol conviene cada consulta."
ogTitle: "El mismo dato, pedido un nivel más arriba, cambia el tiempo de carga"
ogDescription: "Dónde pido los datos en el árbol de componentes de Next.js, y el error de cascada que más se repite."
coverAlt: "Árbol de componentes con flechas mostrando el orden de pedidos de datos"
status: published
publishedAt: 2027-01-25
tags: nextjs, rendimiento, react
imagePrompt: "Editorial vector illustration, an abstract waterfall of geometric request arrows cascading down a component tree versus parallel arrows firing together, muted amber and deep navy palette on dark background, flat geometric design, generous negative space, subtle grain texture, no text, no letters, wide 1200x630 composition"
---

Hay un error de data fetching en Next.js que no se ve en el código, solo en la pestaña de red del navegador. Son pedidos de datos que deberían dispararse todos juntos y se disparan uno atrás del otro, porque cada uno espera a que termine el anterior.

Se llama cascada de requests. En el App Router es sorprendentemente fácil de crear sin darse cuenta, sobre todo cuando la mayoría del árbol son [Server Components](/es/blog/server-vs-client-components-nextjs).

## Cómo se forma una cascada de data fetching en Next.js sin querer

```tsx
async function Page() {
  const user = await getUser();          // espera esto
  return <Profile userId={user.id} />;
}

async function Profile({ userId }) {
  const posts = await getPosts(userId);  // recién ahora arranca esto
  return <PostList posts={posts} />;
}
```

`getPosts` no puede empezar hasta que `getUser` termine, porque `Profile` necesita el `userId` que devuelve el primero. Eso es correcto: hay una dependencia real entre los dos datos. El problema aparece cuando esa dependencia **no existe** y el código igual queda escrito en cascada, porque fue la forma más natural de escribirlo.

## El caso sin dependencia real

```tsx
async function Page() {
  const user = await getUser();
  const settings = await getSettings();  // no depende de `user` para nada
  return <Dashboard user={user} settings={settings} />;
}
```

`getSettings` no usa nada de `user`. Podría haber arrancado al mismo tiempo. Pero como está escrito con dos `await` seguidos, se ejecuta uno después del otro, sumando sus tiempos en vez de superponerse.

La forma correcta:

```tsx
async function Page() {
  const [user, settings] = await Promise.all([getUser(), getSettings()]);
  return <Dashboard user={user} settings={settings} />;
}
```

Ahora los dos arrancan en el mismo instante. Si cada uno tarda 200ms, la versión en cascada tarda 400ms y esta tarda 200ms. La diferencia crece con cada pedido adicional que se agregue en cascada sin necesidad. Con cuatro consultas encadenadas sin motivo, la página tarda cuatro veces más de lo que debería, y en el código no se nota nada raro.

## El criterio que uso para decidir en qué nivel pedir cada dato

**Si dos datos no dependen entre sí, se piden en el componente más alto posible, en paralelo.** Esto evita la cascada y además evita que cada componente hijo tenga que volver a pedir el mismo dato que ya pidió su padre.

**Si un dato es específico de una sola sección de la página, se pide en el componente de esa sección, no arriba de todo.** Pedirlo arriba "por las dudas" retrasa el render de toda la página esperando un dato que solo una parte necesita. En este mismo portafolio, `WhyMe` pide sus propias traducciones en vez de recibirlas del padre. No hay razón para que el Hero espere un dato que no usa.

**Si un dato realmente depende de otro, la cascada es correcta y no hay que forzarla a paralelo.** Forzar un `Promise.all` entre datos que sí dependen entre sí no acelera nada. Igual hay que esperar al primero para poder pedir el segundo, así que solo agrega complejidad.

Esta distinción es la que separa el data fetching en Next.js bien hecho del que solo parece paralelo. Y la única forma de saber en cuál estás es mirar la red, no el código.

## Cache: la otra mitad del problema

Pedir el mismo dato en dos componentes distintos del mismo request no debería duplicar la consulta a la base. En este sitio, cada función de lectura de contenido pasa por `cached()`, que envuelve la consulta con [`unstable_cache`](https://nextjs.org/docs/app/api-reference/functions/unstable_cache). Si `Header` y `Footer` piden el mismo dato de configuración, la segunda llamada devuelve el resultado cacheado en vez de golpear la base de nuevo.

Esto es lo que hace seguro pedir un dato "más cerca de donde se usa" sin miedo a duplicar el costo. La duplicación del pedido en el código no es duplicación del trabajo real, si el cache está bien puesto.

## Cómo detecto una cascada cuando ya pasó

Abro la pestaña de red del navegador y miro la forma de las barras de tiempo. Los pedidos en paralelo se ven como una fila de barras que empiezan en el mismo punto. Una cascada se ve como una escalera: cada barra empieza donde termina la anterior.

Si veo una escalera donde esperaba una fila, reviso si hay una dependencia real entre esos dos pedidos. La mitad de las veces no la hay. Solo estaba escrito en el orden en que se me ocurrió, no en el orden que el rendimiento necesitaba.
