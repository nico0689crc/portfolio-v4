/**
 * Cliente de la API de LinkedIn: publica un posteo con su media y, si el
 * permiso está, deja el link como primer comentario.
 *
 * Server-only. Reemplaza a `@/lib/buffer` como camino principal —Buffer cobra
 * el primer comentario y los documentos, que acá vienen con `w_member_social`—
 * pero no lo jubila: el cron elige por `post_social_shares.provider`.
 *
 * La diferencia grande con Buffer es que **LinkedIn no agenda**:
 * `lifecycleState: PUBLISHED` es el único valor aceptado al crear, así que
 * publicar es un efecto inmediato y el "cuándo" lo pone el cron al correr.
 */

import type { ShareAsset } from '@/lib/social/shares';

const API = 'https://api.linkedin.com';

/**
 * La API es versionada y cada versión se da de baja al año: la de agosto 2025
 * muere en agosto 2026. Vive en una constante y no desperdigada por los
 * headers para que subirla sea una línea, y en una env var para poder subirla
 * sin deploy el día que LinkedIn corte.
 */
// `||` y no `??`: una variable declarada y vacía —lo normal al copiar un
// bloque de `.env.example`— tiene que caer al default igual que una ausente.
// Con `??` el header salía presente y sin valor, y LinkedIn respondía «A
// version must be present».
const VERSION = process.env.LINKEDIN_API_VERSION || '202608';

export type LinkedInConfig = { accessToken: string; authorUrn: string };

export type LinkedInPost = {
  text: string;
  assets: ShareAsset[];
  /** El link. Null lo omite. Si el scope de comentarios falta, se reporta y el post igual sale. */
  firstComment: string | null;
};

export type LinkedInResult = {
  /** URN del posteo publicado, para guardar en `external_id`. */
  postUrn: string;
  /** Por qué no se pudo comentar, si no se pudo. El posteo ya salió igual. */
  commentError: string | null;
};

const headers = (config: LinkedInConfig) => ({
  authorization: `Bearer ${config.accessToken}`,
  'linkedin-version': VERSION,
  'x-restli-protocol-version': '2.0.0',
  'content-type': 'application/json',
});

/** Los errores de LinkedIn vienen como JSON con `message`, pero no siempre. */
async function fail(res: Response, what: string): Promise<never> {
  const body = await res.text();

  let detail = body.slice(0, 300);

  try {
    const parsed = JSON.parse(body) as { message?: string };

    if (parsed.message) detail = parsed.message;
  } catch {
    // Se queda con el texto crudo: mejor eso que perder el motivo.
  }

  throw new Error(`${what}: HTTP ${res.status} — ${detail}`);
}

/**
 * Sube un archivo y devuelve su URN.
 *
 * Son tres viajes —registrar, subir el binario, referenciar— porque LinkedIn no
 * acepta una URL como Buffer: quiere los bytes. El archivo se trae del bucket
 * público de Supabase y se reenvía; no toca disco.
 */
async function upload(
  config: LinkedInConfig,
  kind: 'images' | 'documents',
  sourceUrl: string
): Promise<string> {
  const init = await fetch(`${API}/rest/${kind}?action=initializeUpload`, {
    method: 'POST',
    headers: headers(config),
    body: JSON.stringify({ initializeUploadRequest: { owner: config.authorUrn } }),
    cache: 'no-store',
  });

  if (!init.ok) await fail(init, `No se pudo registrar la subida (${kind})`);

  const { value } = (await init.json()) as {
    value: { uploadUrl: string; image?: string; document?: string };
  };

  const urn = value.image ?? value.document;

  if (!urn) throw new Error(`LinkedIn no devolvió el URN de ${kind}`);

  const source = await fetch(sourceUrl, { cache: 'no-store' });

  if (!source.ok) throw new Error(`No se pudo leer el archivo (HTTP ${source.status}): ${sourceUrl}`);

  // PUT y no POST: el endpoint de subida es un almacén, no una acción. Sin el
  // Authorization tampoco funciona aunque la URL venga firmada.
  const put = await fetch(value.uploadUrl, {
    method: 'PUT',
    headers: { authorization: `Bearer ${config.accessToken}` },
    body: await source.arrayBuffer(),
  });

  if (!put.ok) await fail(put, `No se pudo subir el archivo (${kind})`);

  return urn;
}

/** El bloque `content` del post según lo que se adjunte. Vacío = posteo de texto. */
async function buildContent(config: LinkedInConfig, assets: ShareAsset[]) {
  const [asset] = assets;

  if (!asset) return {};

  if (asset.kind === 'document') {
    const id = await upload(config, 'documents', asset.url);

    return { content: { media: { id, title: asset.title } } };
  }

  if (asset.kind === 'article') {
    // Sin `url` es la marca sin resolver: `deliverShare` la completa antes de
    // llegar acá, así que esto sólo protege de un dato viejo en la base.
    if (!('url' in asset)) throw new Error('La tarjeta de enlace llegó sin resolver');

    // La miniatura es opcional: sin portada LinkedIn muestra la tarjeta igual,
    // sólo que sin imagen.
    const thumbnail = asset.thumbnailUrl ? await upload(config, 'images', asset.thumbnailUrl) : null;

    return {
      content: {
        article: {
          source: asset.url,
          title: asset.title,
          description: asset.description,
          ...(thumbnail ? { thumbnail } : {}),
        },
      },
    };
  }

  const id = await upload(config, 'images', asset.url);

  return { content: { media: { id, ...(asset.altText ? { altText: asset.altText } : {}) } } };
}

/**
 * Publica y comenta.
 *
 * El comentario va aparte y su fallo no tumba la publicación: el posteo ya
 * está en el feed cuando se intenta, así que tirar un error acá dejaría al
 * cron marcando `failed` algo que en realidad salió, y el próximo intento lo
 * duplicaría. Se devuelve el motivo para que quede a la vista en el panel.
 */
export async function publishToLinkedIn(
  config: LinkedInConfig,
  post: LinkedInPost
): Promise<LinkedInResult> {
  const res = await fetch(`${API}/rest/posts`, {
    method: 'POST',
    headers: headers(config),
    body: JSON.stringify({
      author: config.authorUrn,
      commentary: post.text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
      ...(await buildContent(config, post.assets)),
    }),
    cache: 'no-store',
  });

  if (!res.ok) await fail(res, 'LinkedIn rechazó el posteo');

  // El URN no viene en el cuerpo sino en este header.
  const postUrn = res.headers.get('x-restli-id');

  if (!postUrn) throw new Error('LinkedIn publicó pero no devolvió el URN del posteo');

  if (!post.firstComment) return { postUrn, commentError: null };

  try {
    const comment = await fetch(
      `${API}/rest/socialActions/${encodeURIComponent(postUrn)}/comments`,
      {
        method: 'POST',
        headers: headers(config),
        body: JSON.stringify({
          actor: config.authorUrn,
          object: postUrn,
          message: { text: post.firstComment },
        }),
        cache: 'no-store',
      }
    );

    if (!comment.ok) await fail(comment, 'No se pudo comentar');

    return { postUrn, commentError: null };
  } catch (err) {
    return { postUrn, commentError: err instanceof Error ? err.message : String(err) };
  }
}
