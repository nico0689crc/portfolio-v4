# Backoffice (`/admin`)

Panel de contenido del portafolio. Portado de [AdminCN Free](https://github.com/shadcnstudio/shadcn-nextjs-admincn-admin-template-free)
(MIT, © shadcn/studio) y adaptado a Supabase.

## Por qué el admin vive aparte del sitio público

Son dos árboles de rutas hermanos con **root layouts distintos**:

| | Sitio público | Panel |
|---|---|---|
| Rutas | `src/app/[locale]/` | `src/app/(admin)/` |
| CSS | `[locale]/globals.css` | `(admin)/admin.css` |
| Tokens | tripletas HSL, estilo `base-nova` | `oklch`, estilo `base-vega` |
| Primitivas | `src/components/ui/` | `src/components/admin/ui/` |
| i18n | next-intl (`es`/`en`) | monolingüe, excluido en `src/middleware.ts` |

La separación no es cosmética: `globals.css` del sitio público pisa `p` y `h1..h6`
a nivel de elemento (`p { @apply text-lg text-muted-foreground }`). Eso es correcto
para una landing y rompería la tipografía de cada tabla y formulario del panel.

**No unifiques las dos carpetas `ui/`.** `src/components/ui/button.tsx` está
customizado para la marca del portafolio (ámbar, `hover:scale-103`, tamaños
responsive); `src/components/admin/ui/button.tsx` es el stock de shadcn v4.

## shadcn CLI y MCP de shadcn studio

`components.json` apunta a la carpeta del panel:

```json
"style": "base-vega",
"aliases": { "ui": "@/components/admin/ui" }
```

O sea que `npx shadcn@latest add …` y los bloques que genere el MCP caen
directo en `src/components/admin/ui/`, que es lo que queremos mientras el trabajo
en curso sea el dashboard. Si alguna vez hay que agregar una primitiva al **sitio
público**, revertí esas dos claves a `"base-nova"` / `"@/components/ui"` para esa
corrida y volvelas a dejar como están.

El MCP corre en **modo freemium, sin credenciales**:

```
claude mcp add --transport stdio shadcn-studio-mcp --scope user -- npx -y shadcn-studio-mcp
```

No hay "API key gratis": en `build/utils/config.js` del paquete, `isPro()` es
`!!(API_KEY && EMAIL)`, y `http-client.js` sólo manda los headers `x-license-key`
/ `x-email` cuando eso da true. Pasar la key **es** activar Pro. Sin ella el
servidor responde igual, con el catálogo recortado: 61 bloques, de los cuales 17
son de dashboard (Application Shell, DataTable, statistics, widgets, Form Layout,
Empty State, File Upload…). `/iui` (inspiration) es el workflow que queda afuera.

Prácticas que sí valen la pena del workflow de shadcn studio:

- **Un bloque por vez.** Pedir varios en un mismo prompt degrada el resultado.
- En `/cui`, completar la selección de bloques antes de instalar nada.
- Las primitivas de `admin/ui/` se mantienen **stock**. Si algo necesita otro
  comportamiento, envolvelo (ver `layout/Header.tsx`, que usa `Link` con las
  clases de `BreadcrumbLink` en vez de parchear la primitiva).

## Autenticación

Dos capas, y hacen falta las dos:

1. `supabase.auth.getUser()` — que haya sesión válida.
2. Fila en `public.admins` — que esa sesión sea de un editor.

`is_admin()` es lo que leen todas las policies de RLS, así que el guard del panel
usa exactamente el mismo criterio. Ver `src/lib/admin/auth.ts`.

- `requireAdmin()` corre en `src/app/(admin)/admin/(dashboard)/layout.tsx`. Toda
  página bajo ese layout ya está protegida; no repitas el chequeo.
- El login usa **server actions** (`src/lib/admin/actions.ts`), no un cliente de
  browser: `createSupabaseServerClient()` escribe la cookie de sesión con
  `cookies()`, que sólo funciona en action o route handler.
- `src/middleware.ts` refresca la sesión en cada request a `/admin/*`. Sin eso el
  token vence a la hora y el editor queda afuera en medio de una edición.

## Vistas de auth portadas pero sin rutear

`views/auth/register/`, `views/auth/two-steps/`, `views/auth/verify-email/` y
`views/misc/` (la 404) están en el repo y no tienen página. El registro abierto
crearía usuarios de `auth.users` sin fila en `admins` —que igual no entrarían—,
el segundo factor requiere configurar MFA en Supabase antes de servir de algo, y
la verificación de email sólo aplica si activás confirmación por mail en el
proyecto. Ruteálos cuando haya una razón concreta; el texto sigue en inglés.
