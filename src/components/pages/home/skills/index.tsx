import { Reveal } from "@/components/ui/reveal";
import { getLocale, getTranslations } from "next-intl/server";
import { getSkillCategories } from "@/lib/content";

const Skills = async () => {
  const t = await getTranslations("Home");
  const locale = await getLocale();

  // La etiqueta de cada categoría ya viene traducida de la base, así que no hay
  // clave de mensaje que mantener en sincronía con la fila.
  const categories = (await getSkillCategories(locale)).map((category) => ({
    title: category.label,
    skills: category.skills.map((skill) => skill.name),
  }));

  return (
    <section className="section-padding section-dark">
      <div className="container mx-auto">
        <Reveal
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">{t("skills.title")}</h2>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
        </Reveal>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {categories.map((cat, catIndex) => (
            <Reveal
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1, duration: 0.5 }}
              className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] p-6 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 flex flex-col"
              as="div"
            >
              <h3 className="font-bold text-lg mb-4 text-accent">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill, i) => (
                  <Reveal
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIndex * 0.1 + i * 0.03, duration: 0.3 }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border border-primary-foreground/15 text-primary-foreground/80 hover:border-accent hover:text-accent transition-colors duration-200 cursor-default"
                  >
                    {skill}
                  </Reveal>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;