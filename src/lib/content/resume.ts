import { supabasePublic } from '@/lib/supabase/public';
import { cached } from './cache';
import { TAGS } from './tags';
import { FALLBACK_LOCALE, localesFor, orThrow, pick, toYearMonth } from './internal';
import { computeYearsOfExperience } from './experience-span';
import type {
  Certification,
  Education,
  Experience,
  Faq,
  Highlight,
  SkillCategory
} from './types';

/**
 * Résumé content.
 *
 * Every collection is ordered by `sort_order` ascending in the query, and the
 * seed writes it newest-first, so `getExperiences()[0]` is the current role.
 * That is part of the contract: consumers must not re-sort. Explicit ordering
 * rather than `ORDER BY start_date DESC` because the backoffice has to be able
 * to move a row by hand without fighting the dates.
 */

/**
 * Años de experiencia técnica, derivados de las fechas.
 *
 * Reemplaza al valor que vivía en `settings`. Comparte el mismo tag que las
 * experiencias, así que agregar un puesto lo actualiza sin que nadie tenga que
 * acordarse de tocar un segundo lugar — que es exactamente como el número
 * quedaba viejo antes.
 */
export const getYearsOfExperience = cached(
  async (locale: string): Promise<number> => computeYearsOfExperience(await getExperiences(locale)),
  ['years-of-experience'],
  [TAGS.experiences, TAGS.all]
);

export const getExperiences = cached(
  async (locale: string): Promise<Experience[]> => {
    const rows = orThrow(
      'getExperiences',
      await supabasePublic
        .from('experiences')
        .select(
          `id, organization, employment_type, remote, techs, start_date, end_date, periods,
           counts_as_experience,
           experience_translations(locale, role, company, location, date_label, description, techs),
           experience_roles(id, organization, location, sort_order,
                            experience_role_translations(locale, title, date_label, description))`
        )
        .in('experience_translations.locale', localesFor(locale))
        .order('sort_order')
    );

    return rows.flatMap((row) => {
      const t = pick(row.experience_translations, locale);
      if (!t) return [];
      const periods = Array.isArray(row.periods)
        ? (row.periods as Array<{ start_date: string; end_date: string | null }>).map((p) => ({
            startDate: toYearMonth(p.start_date)!,
            endDate: toYearMonth(p.end_date)
          }))
        : undefined;

      return [
        {
          id: row.id,
          organization: row.organization,
          location: t.location,
          employmentType: row.employment_type,
          remote: row.remote,
          // El override por idioma gana: la entrada de gastronomía lista
          // competencias, no tecnologías, y esas sí se traducen.
          techs: t.techs ?? row.techs,
          startDate: toYearMonth(row.start_date),
          endDate: toYearMonth(row.end_date),
          ...(periods ? { periods } : {}),
          role: t.role,
          // Falls back to the neutral name for a row seeded before the label
          // column existed, so it renders something rather than blank.
          company: t.company ?? row.organization,
          dateLabel: t.date_label,
          countsAsExperience: row.counts_as_experience,
          roles: [...row.experience_roles]
            .sort((a, b) => a.sort_order - b.sort_order)
            .flatMap((child) => {
              const ct = pick(child.experience_role_translations, locale);

              return ct
                ? [
                    {
                      id: child.id,
                      organization: child.organization,
                      location: child.location,
                      title: ct.title,
                      dateLabel: ct.date_label,
                      description: ct.description
                    }
                  ]
                : [];
            }),
          description: t.description
        }
      ];
    });
  },
  ['experiences'],
  [TAGS.experiences, TAGS.all]
);

export const getEducation = cached(
  async (locale: string): Promise<Education[]> => {
    const rows = orThrow(
      'getEducation',
      await supabasePublic
        .from('education')
        .select(
          `id, institution, url, start_date, end_date,
           education_translations(locale, degree, date_label, location)`
        )
        .in('education_translations.locale', localesFor(locale))
        .order('sort_order')
    );

    return rows.flatMap((row) => {
      const t = pick(row.education_translations, locale);
      if (!t) return [];
      return [
        {
          id: row.id,
          institution: row.institution,
          ...(row.url ? { url: row.url } : {}),
          startDate: toYearMonth(row.start_date),
          endDate: toYearMonth(row.end_date),
          degree: t.degree,
          dateLabel: t.date_label,
          location: t.location
        }
      ];
    });
  },
  ['education'],
  [TAGS.education, TAGS.all]
);

export const getCertifications = cached(
  async (locale: string): Promise<Certification[]> => {
    const rows = orThrow(
      'getCertifications',
      await supabasePublic
        .from('certifications')
        .select('id, issuer, year, url, certification_translations(locale, name)')
        .in('certification_translations.locale', localesFor(locale))
        .order('sort_order')
    );

    return rows.flatMap((row) => {
      const t = pick(row.certification_translations, locale);
      if (!t) return [];
      return [
        {
          id: row.id,
          issuer: row.issuer,
          year: row.year,
          ...(row.url ? { url: row.url } : {}),
          name: t.name
        }
      ];
    });
  },
  ['certifications'],
  [TAGS.certifications, TAGS.all]
);

export const getSkillCategories = cached(
  async (locale: string): Promise<SkillCategory[]> => {
    const rows = orThrow(
      'getSkillCategories',
      await supabasePublic
        .from('skill_categories')
        .select(
          `id, slug, sort_order,
           skill_category_translations(locale, label),
           skills(name_default, is_translatable, sort_order, skill_translations(locale, name))`
        )
        .in('skill_category_translations.locale', localesFor(locale))
        .order('sort_order')
    );

    return rows.flatMap((row) => {
      const label = pick(row.skill_category_translations, locale)?.label;
      if (!label) return [];

      const skills = [...row.skills]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({
          // A translatable skill without a row for this locale keeps its
          // default name rather than disappearing from the list.
          name: s.is_translatable
            ? pick(s.skill_translations, locale)?.name ?? s.name_default
            : s.name_default,
          isTranslatable: s.is_translatable
        }));

      return [{ id: row.id, slug: row.slug, label, skills }];
    });
  },
  ['skill-categories'],
  [TAGS.skills, TAGS.all]
);

/**
 * Technical skill names only, with no locale.
 *
 * This is what `Person.knowsAbout` in the JSON-LD must use. That property is a
 * language-neutral entity reference, so filling it with translated soft skills
 * would break the entity merge between the ES and EN versions of the page —
 * which is exactly what the shared `@id` achieves. `is_translatable = false`
 * is precisely the right filter for it.
 */
export const getTechnicalSkills = cached(
  async (): Promise<string[]> => {
    const rows = orThrow(
      'getTechnicalSkills',
      await supabasePublic
        .from('skills')
        .select('name_default, sort_order')
        .eq('is_translatable', false)
        .order('sort_order')
    );
    return rows.map((r) => r.name_default);
  },
  ['technical-skills'],
  [TAGS.skills, TAGS.all]
);

export const getResumeHighlights = cached(
  async (locale: string): Promise<Highlight[]> => {
    const rows = orThrow(
      'getResumeHighlights',
      await supabasePublic
        .from('resume_highlights')
        .select('id, resume_highlight_translations(locale, label, value)')
        .in('resume_highlight_translations.locale', localesFor(locale))
        .order('sort_order')
    );

    return rows.flatMap((row) => {
      const t = pick(row.resume_highlight_translations, locale);
      return t ? [{ id: row.id, label: t.label, value: t.value }] : [];
    });
  },
  ['resume-highlights'],
  [TAGS.highlights, TAGS.all]
);

export const getFaqs = cached(
  async (locale: string): Promise<Faq[]> => {
    const rows = orThrow(
      'getFaqs',
      await supabasePublic
        .from('faqs')
        .select('id, faq_translations(locale, question, answer)')
        .in('faq_translations.locale', localesFor(locale))
        .order('sort_order')
    );

    return rows.flatMap((row) => {
      const t = pick(row.faq_translations, locale);
      return t ? [{ id: row.id, question: t.question, answer: t.answer }] : [];
    });
  },
  ['faqs'],
  [TAGS.faqs, TAGS.all]
);

export { FALLBACK_LOCALE };
