/**
 * Single source of truth for the skill matrix, shared by the home page's
 * Skills section and the resume page. `labelKey` resolves against the `Home`
 * namespace; soft skills are the only locale-dependent values.
 */
export interface SkillCategory {
  labelKey: string;
  skills: string[] | Record<string, string[]>;
}

export const skillCategories: SkillCategory[] = [
  {
    labelKey: 'skills.frontend',
    skills: ['React.js', 'Next.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Material UI']
  },
  {
    labelKey: 'skills.backend',
    skills: ['Node.js', 'Express.js', 'NestJS', 'GraphQL', 'REST APIs', 'Laravel', 'Ruby on Rails']
  },
  {
    labelKey: 'skills.databases',
    skills: ['MongoDB', 'PostgreSQL', 'MySQL']
  },
  {
    labelKey: 'skills.devops',
    skills: ['Docker', 'Git', 'CI/CD', 'GitHub Actions', 'AWS', 'Linux', 'WordPress', 'Bricks Builder', 'Automaticss']
  },
  {
    labelKey: 'skills.ai',
    skills: ['GitHub Copilot', 'ChatGPT', 'Claude', 'Cursor', 'Prompt Engineering']
  },
  {
    labelKey: 'skills.soft',
    skills: {
      en: ['Leadership', 'Teamwork', 'Problem Solving', 'Assertive Communication', 'Time Management', 'Adaptability', 'Proactivity'],
      es: ['Liderazgo', 'Trabajo en equipo', 'Resolución de problemas', 'Comunicación asertiva', 'Gestión del tiempo', 'Adaptabilidad', 'Proactividad']
    }
  }
];

/** Resolves a category's skills for a locale, falling back to Spanish. */
export function skillsForLocale(category: SkillCategory, locale: string): string[] {
  if (Array.isArray(category.skills)) return category.skills;
  return category.skills[locale] ?? category.skills.es;
}

/** Flat list of technical skills, used for `Person.knowsAbout` style output. */
export function allTechnicalSkills(): string[] {
  return skillCategories
    .filter((c) => Array.isArray(c.skills))
    .flatMap((c) => c.skills as string[]);
}
