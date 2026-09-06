/**
 * Cliente mínimo de la API de Buffer, para agendar una nota en el canal de
 * LinkedIn.
 *
 * Server-only: usa `process.env` y lo llama únicamente el cron de
 * `src/app/api/cron/linkedin-share/route.ts`. No se reexporta desde ningún
 * barrel a propósito, mismo criterio que `src/lib/metrics/client.ts`.
 *
 * Se entrega con `dueAt` y no con `addToQueue`: el cuándo lo decide la agenda
 * del panel (`post_social_shares.scheduled_at`), no el horario de la cola
 * configurado en Buffer. Con la cola, dos notas entregadas el mismo día salen
 * cuando Buffer quiera y en un orden que no controlamos; con `dueAt` cada nota
 * sale exactamente en el turno que se le asignó, y la agenda del panel es la
 * única fuente de verdad sobre el calendario.
 */

import type { ShareAsset } from '@/lib/social/shares';

const API_URL = 'https://api.buffer.com';

export type BufferConfig = { apiKey: string; linkedinChannelId: string };

export type LinkedInPost = {
  text: string;
  dueAt: Date;
  assets: ShareAsset[];
  /** El link, cuando no va en el cuerpo. Null lo omite. */
  firstComment: string | null;
};

/**
 * Los assets en la forma que espera Buffer: cada entrada del array lleva una
 * sola variante (`image`, `video`, `document` o `link`).
 *
 * Buffer descarga estas URLs recién cuando publica, no cuando se crea el post.
 * Con la agenda semanas adelante eso significa que el archivo tiene que seguir
 * público y accesible todo ese tiempo — de ahí que se sirvan desde el bucket
 * público de Supabase y no desde una URL firmada, que expira.
 */
const toBufferAssets = (assets: ShareAsset[]) =>
  assets.map(asset =>
    asset.kind === 'image'
      ? { image: { url: asset.url, ...(asset.altText ? { metadata: { altText: asset.altText } } : {}) } }
      : { document: { url: asset.url, title: asset.title, thumbnailUrl: asset.thumbnailUrl } }
  );

/** `null` si falta alguna env var — el cron lo trata como "no configurado" y no falla. */
export function getBufferConfig(): BufferConfig | null {
  const apiKey = process.env.BUFFER_API_KEY;
  const linkedinChannelId = process.env.BUFFER_LINKEDIN_CHANNEL_ID;

  if (!apiKey || !linkedinChannelId) return null;

  return { apiKey, linkedinChannelId };
}

type CreatePostResponse = {
  data?: {
    createPost?:
      | { post: { id: string } }
      | { message: string };
  };
  errors?: Array<{ message: string }>;
};

/**
 * Agenda un posteo en el canal de LinkedIn para el momento indicado. Devuelve
 * el id del post creado en Buffer.
 */
export async function scheduleLinkedInPost(config: BufferConfig, post: LinkedInPost): Promise<string> {
  const query = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess { post { id } }
        ... on MutationError { message }
      }
    }
  `;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          text: post.text,
          channelId: config.linkedinChannelId,
          // `schedulingType` sólo acepta `automatic` (Buffer publica solo) o
          // `notification` (te avisa para publicar a mano). El "cuándo" no se
          // expresa acá sino en `mode`: `customScheduled` + `dueAt` es la hora
          // exacta, frente a `addToQueue`, que la decide la cola de Buffer.
          schedulingType: 'automatic',
          mode: 'customScheduled',
          dueAt: post.dueAt.toISOString(),
          ...(post.assets.length > 0 ? { assets: toBufferAssets(post.assets) } : {}),
          // `linkAttachment` vive en este mismo objeto y Buffer rechaza la
          // mutación si se manda junto con assets, así que no se usa: el link
          // va en el cuerpo o en el primer comentario, nunca como tarjeta.
          ...(post.firstComment ? { metadata: { linkedin: { firstComment: post.firstComment } } } : {}),
        },
      },
    }),
    cache: 'no-store',
  });

  const body = (await res.json()) as CreatePostResponse;

  if (!res.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message ?? `Buffer API respondió HTTP ${res.status}`);
  }

  const result = body.data?.createPost;

  if (!result || 'message' in result) {
    throw new Error(result && 'message' in result ? result.message : 'Buffer no devolvió el post creado');
  }

  return result.post.id;
}
