"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
}

interface HeaderClientProps {
  navItems: NavItem[];
  locale: string;
}

export function HeaderClient({ navItems, locale }: HeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Default to dark theme as base
  const [theme, setTheme] = useState("dark");

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  // Detect scroll for the blurred background effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Initialize theme based on user's system/saved preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleLocale = () => {
    const nextLocale = locale === "es" ? "en" : "es";
    router.replace(
      // @ts-expect-error -- Using dynamic router.replace with params
      { pathname, params }, 
      { locale: nextLocale }
    );
  };

  const isActive = (to: string) => pathname === to;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-card/90 backdrop-blur-md border-b border-border py-3 shadow-sm"
        : "bg-transparent py-5"
        }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12 lg:px-24">
        <Link
          href="/"
          className={`font-display font-bold text-xl hover:scale-105 transition-all duration-200 ${
            ((scrolled || pathname !== "/") && theme === "light") ? "text-foreground" : "text-white"
          }`}
        >
          NF<span className="text-accent">.</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              href={item.to as any}
              className={cn(
                buttonVariants({ variant: "link" }),
                isActive(item.to)
                  ? "text-accent"
                  : ((scrolled || pathname !== "/") && theme === "light") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="w-px h-5 bg-border mx-2" />

          {/* Lang toggle */}
          <Button
            onClick={toggleLocale}
            variant="ghost"
            aria-label="Toggle language"
            className={`hover:text-accent transition-all duration-200 ${((scrolled || pathname !== "/") && theme === "light") ? "text-foreground" : "text-muted-foreground"}`}
          >
            <Globe className="w-4 h-4" />
            {locale === "es" ? "EN" : "ES"}
          </Button>

          {/* Theme toggle */}
          <Button
            onClick={toggleTheme}
            variant="ghost"
            aria-label="Toggle theme"
            className={`hover:text-accent transition-all duration-200 ${((scrolled || pathname !== "/") && theme === "light") ? "text-foreground" : "text-muted-foreground"}`}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            onClick={toggleLocale}
            aria-label="Toggle language"
            variant="ghost"
            className={`hover:text-accent transition-all duration-200 ${((scrolled || pathname !== "/") && theme === "light") ? "text-foreground" : "text-muted-foreground"}`}
          >
            <Globe className="w-4 h-4" />
          </Button>
          <Button
            onClick={toggleTheme}
            variant="ghost"
            aria-label="Toggle theme"
            className={`hover:text-accent transition-all duration-200 ${((scrolled || pathname !== "/") && theme === "light") ? "text-foreground" : "text-muted-foreground"}`}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => setMobileOpen(!mobileOpen)}
            variant="ghost"
            aria-label="Toggle menu"
            className={`hover:text-accent transition-all duration-200 ${((scrolled || pathname !== "/") && theme === "light") ? "text-foreground" : "text-muted-foreground"}`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-md border-b border-border overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  href={item.to as any}
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    isActive(item.to) ? "text-accent" : "text-muted-foreground"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
