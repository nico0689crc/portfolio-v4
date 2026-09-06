// Third-party Imports
import type * as Icon from 'lucide-react'

type IconName = keyof typeof Icon

export type MenuLeafSubItem = {
  label: string
  href: string
  activePath?: string
  badge?: string
  badgeClassName?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export type MenuGroupSubItem = {
  label: string
  childItems: MenuLeafSubItem[]
}

export type MenuSubItem = MenuLeafSubItem | MenuGroupSubItem

export type MenuItem = {
  icon: IconName
  label: string
} & (
  | {
      href: string
      // Prefijo que mantiene el item activo en las rutas hijas (p.ej. /admin/proyectos/nuevo).
      activePath?: string
      badge?: string
      badgeClassName?: string
      childItems?: never
      target?: '_blank' | '_self' | '_parent' | '_top'
    }
  | {
      href?: never
      badge?: string
      badgeClassName?: string
      childItems: MenuSubItem[]
    }
)

export type NavItem = {
  groupLabel?: string
  items: MenuItem[]
}

export const navItems: NavItem[] = [
  {
    items: [
      {
        icon: 'LayoutDashboard',
        label: 'Resumen',
        href: '/admin'
      }
    ]
  },
  {
    groupLabel: 'Contenido',
    items: [
      {
        icon: 'FolderKanban',
        label: 'Proyectos',
        href: '/admin/proyectos',
        activePath: '/admin/proyectos'
      },
      {
        icon: 'PenLine',
        label: 'Posts',
        href: '/admin/posts',
        activePath: '/admin/posts'
      },
      {
        icon: 'Tags',
        label: 'Tags',
        href: '/admin/tags',
        activePath: '/admin/tags'
      },
      {
        icon: 'Linkedin',
        label: 'LinkedIn',
        href: '/admin/linkedin',
        activePath: '/admin/linkedin'
      }
    ]
  },
  {
    groupLabel: 'Currículum',
    items: [
      {
        icon: 'Briefcase',
        label: 'Trayectoria',
        childItems: [
          { label: 'Experiencia', href: '/admin/curriculum/experiencia' },
          { label: 'Educación', href: '/admin/curriculum/educacion' },
          { label: 'Certificaciones', href: '/admin/curriculum/certificaciones' }
        ]
      },
      {
        icon: 'Layers',
        label: 'Skills',
        href: '/admin/curriculum/skills',
        activePath: '/admin/curriculum/skills'
      },
      {
        icon: 'Star',
        label: 'Destacados',
        href: '/admin/curriculum/destacados',
        activePath: '/admin/curriculum/destacados'
      }
    ]
  },
  {
    groupLabel: 'Sitio',
    items: [
      {
        icon: 'Search',
        label: 'SEO por página',
        href: '/admin/seo',
        activePath: '/admin/seo'
      },
      {
        icon: 'TrendingUp',
        label: 'Métricas de SEO',
        href: '/admin/metricas',
        activePath: '/admin/metricas'
      },
      {
        icon: 'Languages',
        label: 'Textos de UI',
        href: '/admin/textos',
        activePath: '/admin/textos'
      },
      {
        icon: 'MessageCircleQuestion',
        label: 'FAQs',
        href: '/admin/faqs',
        activePath: '/admin/faqs'
      },
      {
        icon: 'Signpost',
        label: 'Redirecciones',
        href: '/admin/redirecciones',
        activePath: '/admin/redirecciones'
      },
      {
        icon: 'Settings',
        label: 'Ajustes',
        href: '/admin/ajustes',
        activePath: '/admin/ajustes'
      }
    ]
  },
  {
    groupLabel: 'Bandeja',
    items: [
      {
        icon: 'Mail',
        label: 'Mensajes',
        href: '/admin/mensajes',
        activePath: '/admin/mensajes'
      }
    ]
  }
]
