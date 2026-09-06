---
slug: server-vs-client-components-nextjs
title: "Server Components vs Client Components en Next.js: cuándo uso cada uno"
excerpt: "La pregunta no es cuál es mejor. Es qué necesita interactividad y qué no, y esa distinción cambia cuánto JavaScript le mandás al navegador de cada visitante."
focusKeyphrase: server components vs client components
seoTitle: "Server Components vs Client Components: criterio real"
seoDescription: "Server Components vs Client Components en Next.js: cuándo usar cada uno, con ejemplos reales de un portafolio en producción."
ogTitle: "El 90% de un sitio no necesita JavaScript en el navegador"
ogDescription: "El criterio que uso para elegir entre Server y Client Components en cada componente de un proyecto real."
coverAlt: "Diagrama de árbol de componentes con nodos marcados como servidor o cliente"
status: published
publishedAt: 2026-10-05
tags: nextjs, react, rendimiento
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. A component tree in which most nodes are flat solid blocks and only a few small leaves carry an extra attached layer of interactivity. A boundary line wraps tightly around just those few leaves. Composition: single focal cluster centred slightly left, wide empty margins, nothing important in the outer 8 percent. Palette: deep navy ground #0F172A, desaturated slate mid-tones #1E293B and #334155, off-white #F8FAFC for thin lines and highlights, and a single amber #F59E0B accent used only on the small bounded interactive leaves. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

La pregunta que más me hacen sobre Next.js App Router no es cómo funciona: la documentación explica eso bien. Es cómo decidir, componente por componente, entre Server Components vs Client Components. Esa es la pregunta que la documentación contesta peor, porque la respuesta depende del proyecto y no de la tecnología.

Este es el criterio que uso, con ejemplos de código real de este mismo portafolio y de [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios).

## Server Components vs Client Components: la distinción real

Es **interactividad vs contenido**.

Un Server Component se ejecuta en el servidor, arma su HTML, y ese HTML es todo lo que le llega al navegador. Cero JavaScript de ese componente viaja al cliente. No tiene `useState` ni `onClick`. No puede reaccionar a nada porque, para cuando el usuario lo ve, ya terminó de existir como código: solo queda el HTML que produjo.

Un Client Component sí viaja como JavaScript, se hidrata en el navegador, y puede tener estado, efectos, y responder a eventos.

La pregunta que realmente importa por cada componente es: **¿este componente necesita recordar algo, reaccionar a algo, o usar una API del navegador?** Si no, es candidato a Server. Si sí, tiene que ser Client.

## Ejemplos de este mismo sitio

El componente `Hero` del home es Server. Muestra un título, un subtítulo con los años de experiencia calculados en el servidor, y dos botones que son links. No hay nada ahí que necesite recordar estado entre renders ni reaccionar a un evento del navegador — los links son navegación, no interactividad de aplicación.

```tsx
export default async function Hero() {
  const t = await getTranslations("Home");
  const years = await getYearsOfExperience(locale);
  // ...arma el JSX y listo, nunca vuelve a ejecutarse en el navegador
}
```

El listado del blog, en cambio, **sí** es Client. Tiene un filtro por etiqueta que necesita estado y responder a clics sin recargar la página.

```tsx
"use client";
const [active, setActive] = useState<string>(ALL);
const filtered = active === ALL ? posts : posts.filter(/* ... */);
```

La diferencia no es de complejidad visual — las dos secciones tienen tarjetas, texto, imágenes. La diferencia es si algo tiene que cambiar en el navegador sin ir al servidor.

## El error que veo más seguido: "use client" en la raíz

El error típico es poner `"use client"` en un componente grande porque **una parte chica** de él necesita interactividad. Eso convierte todo el árbol de componentes hijos en cliente también, aunque el 90% de ellos solo muestre texto.

La solución casi siempre es la misma: extraer la parte interactiva a su propio componente chico, y dejar todo lo demás como Server. En vez de:

```tsx
"use client"; // todo esto viaja al navegador, sin necesitarlo
function ProductPage({ product }) {
  const [qty, setQty] = useState(1);
  return (
    <div>
      <ProductGallery images={product.images} />  {/* no necesita ser client */}
      <ProductDescription text={product.description} /> {/* tampoco */}
      <QuantityPicker qty={qty} onChange={setQty} /> {/* esto sí */}
    </div>
  );
}
```

Se aísla el estado en el componente que de verdad lo necesita:

```tsx
function ProductPage({ product }) {  // Server, sin declarar nada
  return (
    <div>
      <ProductGallery images={product.images} />
      <ProductDescription text={product.description} />
      <QuantityPicker />  {/* este archivo, y solo este, dice "use client" */}
    </div>
  );
}
```

La galería y la descripción nunca viajan como JavaScript. Solo el selector de cantidad, que es lo único que realmente necesita ejecutarse en el navegador.

## Un caso donde la elección no es obvia: formularios

Un formulario de contacto parece obviamente Client —tiene inputs, validación, estado del envío. Y la parte interactiva sí lo es. Pero eso no significa que la página entera tenga que serlo.

En este sitio, la página de contacto es Server; solo el componente `ContactForm` de adentro es Client. El texto de alrededor, el layout, la metadata de SEO — nada de eso necesita JavaScript en el navegador, así que se queda afuera de la frontera cliente.

## Por qué esto importa más de lo que parece

Cada componente Client agrega JavaScript que el navegador descarga, parsea y ejecuta antes de que la página responda a un clic. En un celular con mala conexión, esa es la diferencia entre una página instantánea y una que se siente pegada dos segundos aunque ya se vea completa. [La documentación de Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components) lo plantea igual.

Y hay un efecto compuesto: en Next.js, si un componente padre es Client, **todo lo que renderiza adentro sin pasar por `children`** también se vuelve parte del bundle del cliente, aunque ese hijo no tenga ningún `"use client"` propio. La frontera cliente/servidor no es por archivo, es por árbol de renderizado.

Por eso el default correcto es Server, y `"use client"` es la excepción que hay que ganarse componente por componente, no la configuración de base del proyecto.

## La regla práctica que uso

Empiezo todo componente como Server. Cuando el compilador o el linter me avisan que necesito un hook de estado o un evento del navegador, **no** le pongo `"use client"` al archivo entero: primero me pregunto si puedo aislar esa necesidad en un componente hijo más chico. Casi siempre se puede. Y cuando no se puede, ahí sí, ese componente específico se gana la etiqueta.

El resultado, en un proyecto typical, es que la enorme mayoría del árbol queda en Server, y la interactividad real —que suele ser una fracción chica de la interfaz— es la única parte que le cuesta JavaScript al visitante.
