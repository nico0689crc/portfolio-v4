import { getTranslations, getLocale } from 'next-intl/server';
import { HeaderClient } from './header-client';

export async function Header() {
  const t = await getTranslations('Header');
  const locale = await getLocale();

  const navItems = [
    { label: t("home"), to: "/" },
    { label: t("about"), to: "/about" },
    { label: t("portfolio"), to: "/portfolio" },
    { label: t("contact"), to: "/contact" },
  ];

  return <HeaderClient navItems={navItems} locale={locale} />;
}
