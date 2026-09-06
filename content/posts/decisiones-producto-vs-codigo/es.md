---
slug: decisiones-de-producto-que-no-son-de-codigo
title: "Las decisiones de un SaaS que no tienen nada que ver con el código"
excerpt: "El framework que elegís importa menos de lo que crees. Las decisiones que de verdad definen si un producto sobrevive pasan antes, y son de negocio, no de arquitectura."
focusKeyphrase: decisiones de producto
seoTitle: "Decisiones de producto que definen un SaaS antes del código"
seoDescription: "Las decisiones de producto que definieron GymSmartAccess antes de elegir un framework: a quién no venderle, cómo cobrar y qué automatizar primero."
ogTitle: "Elegí a quién no venderle antes de elegir el framework"
ogDescription: "Las decisiones que definen si un SaaS funciona, y ninguna es sobre el código."
coverAlt: "Diagrama de decisiones de negocio previas a la arquitectura técnica de un producto"
status: published
publishedAt: 2026-09-28
tags: producto, negocio, casos
imagePrompt: "Flat editorial vector illustration, modern tech-magazine spot art, geometric and diagrammatic. A decision sequence where four business choice nodes come first in a line, and only the fifth node is a stack of technical layers. The technical stack is drawn smaller and clearly downstream of the four that precede it. Composition: horizontal band across the middle third of the frame, wide empty margins above and below, nothing important in the outer 8 percent. Palette: deep navy ground #0F172A, desaturated slate mid-tones #1E293B and #334155, off-white #F8FAFC for thin lines and highlights, and a single amber #F59E0B accent used only on the first business node. Soft light from the top left, long low-contrast shadows, layered overlapping planes for depth. Fine film grain. No text, no letters, no numbers, no logos, no user interface chrome, no faces, no photorealism, no mesh gradients, no drop shadows on text. Aspect ratio 1.91:1, 1200x630."
---

Cuando alguien me pregunta por [GymSmartAccess](/es/proyectos/gymsmartaccess-gestion-gimnasios), la primera pregunta casi siempre es técnica: por qué Next.js, por qué Supabase, cómo maneja los webhooks de pago. Son preguntas legítimas y las contesto con gusto. Pero ninguna de esas decisiones fue la que definió si el producto iba a funcionar.

Las que importaron pasaron antes, y son incómodas de discutir porque no tienen una respuesta "correcta" objetiva. Son apuestas de negocio.

## Decisión 1: a quién no venderle

La más importante de todas, y la que casi nadie toma a propósito.

GymSmartAccess resuelve cobros y control de acceso para gimnasios independientes en Argentina. Decidí explícitamente **no** apuntar a cadenas grandes con múltiples sedes, aunque pagarían más por suscripción.

La razón no es modestia. Es que una cadena grande ya tiene un sistema instalado, malo probablemente, pero instalado. Cambiarlo es una decisión de comité que tarda meses y pasa por licitación. Un gimnasio independiente lo decide el dueño, en una conversación, la misma semana. El ciclo de venta es diez veces más corto. Para un producto que necesita validar rápido si la idea sirve, eso vale más que el ticket promedio alto.

Decir que no al cliente grande es la decisión de producto más rentable que tomé, y la tomé sin escribir una línea de código.

## Decisión 2: cómo cobrar, antes de cómo cobrar técnicamente

Mercado Pago fue la decisión técnica. La decisión de producto fue **quién paga y cuándo**.

Elegí que el gimnasio le cobre a sus propios socios directamente, en vez de pagarme a mí una licencia mensual fija. Así el costo del producto escala junto con el negocio del cliente. Un gimnasio con 40 socios y uno con 400 pagan proporcional a lo que factura cada uno, no un monto fijo que le pesa distinto a cada uno.

Esa decisión determinó la arquitectura de cobros mucho antes de que la arquitectura de cobros existiera. Elegí el modelo de negocio y el código vino a servirlo, no al revés.

## Decisión 3: qué automatizar primero

Con presupuesto y tiempo limitados, no automaticé todo el ciclo de vida del socio de un gimnasio. Automaticé **una sola fricción**: el cobro manual en efectivo, que es lo que hacía que los dueños de gimnasio "persiguieran" a sus socios cada mes.

Podría haber empezado por las rutinas de entrenamiento, o por un sistema de reservas de clases, que son funcionalidades más vistosas para mostrar en una demo. Elegí el cobro porque es lo que afecta directamente el ingreso del cliente. Un cliente que ve su morosidad bajar a cero en el primer mes no necesita que le explique el valor del producto. Lo ve en su cuenta bancaria.

Automatizar lo que se ve primero en una demo y automatizar lo que primero convence a alguien de pagar son, casi siempre, dos cosas distintas. Es lo que Clayton Christensen llamó [el trabajo que el cliente contrata al producto](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done): acá el trabajo era cobrar, no entrenar. Elegir la segunda es una decisión de producto, no de ingeniería.

## Decisión 4: el hardware que decidí no vender

Los sistemas de acceso biométrico tradicionales cuestan en dólares y requieren instalación física. Decidí que el control de acceso fuera un QR dinámico en el celular del socio, leído por una cámara barata, sin hardware propietario.

Esto no fue una limitación técnica disfrazada de elección. Fue al revés: elegí primero que el costo de entrada para el gimnasio fuera cero en hardware. Esa es la barrera real que hace que un dueño de gimnasio de barrio ni se plantee modernizarse. Después busqué la solución técnica que cumpliera esa restricción.

Si hubiera elegido la tecnología primero —"hagamos control de acceso biométrico, que es lo que hacen los gimnasios grandes"— habría construido un producto que mi cliente real no puede pagar.

## Qué decisiones de producto discutir antes de contratar

Si estás evaluando construir algo a medida, la conversación más valiosa no es sobre el stack. Es sobre estas cuatro preguntas: a quién no le vendés, quién paga y cuándo, y qué automatizás primero. La cuarta: qué restricción de negocio tiene que cumplir la solución técnica antes de elegirla.

Un desarrollador que solo pregunta por funcionalidades va a construir lo que le pedís. Uno que pregunta por estas cuatro cosas primero va a ayudarte a construir lo que en realidad necesitás, que no siempre es lo mismo.

El recorte de alcance que sostiene todo esto lo escribí en [de idea a MVP](/es/blog/de-idea-a-mvp-que-construir), y el caso completo de GymSmartAccess está en [el portafolio](/es/proyectos/gymsmartaccess-gestion-gimnasios).
