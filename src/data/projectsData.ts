import ecommerce1 from "@/assets/projects/ecommerce-1.jpg";
import ecommerce2 from "@/assets/projects/ecommerce-2.jpg";
import gym1 from "@/assets/projects/gymsmartaccess/1.png";
import gym2 from "@/assets/projects/gymsmartaccess/2.png";
import gym3 from "@/assets/projects/gymsmartaccess/3.png";
import gym5 from "@/assets/projects/gymsmartaccess/5.png";
import gym6 from "@/assets/projects/gymsmartaccess/6.png";
import gym7 from "@/assets/projects/gymsmartaccess/7.png";
import gym8 from "@/assets/projects/gymsmartaccess/8.png";
import gym9 from "@/assets/projects/gymsmartaccess/9.png";
// import tasks1 from "@/assets/projects/tasks-1.jpg";
// import tasks2 from "@/assets/projects/tasks-2.jpg";
// import restaurant1 from "@/assets/projects/restaurant-1.jpg";
// import restaurant2 from "@/assets/projects/restaurant-2.jpg";
// import portfolio1 from "@/assets/projects/portfolio-1.jpg";
// import portfolio2 from "@/assets/projects/portfolio-2.jpg";

import { StaticImageData } from "next/image";

export type Category = "all" | "fullstack" | "ux-ui" | "wordpress";

export interface ProjectData {
  slug: string;
  titleKey: string;
  descKey: string;
  techs: string[];
  category: Category;
  images: (StaticImageData | string)[];
  github?: string;
  demo?: string;
  // Case study translation key prefix
  casePrefix: string;
}

export const projects: ProjectData[] = [
  // {
  //   slug: "ecommerce-dashboard",
  //   titleKey: "projects.1.title",
  //   descKey: "projects.1.desc",
  //   techs: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
  //   category: "fullstack",
  //   images: [ecommerce1, ecommerce2],
  //   github: "#",
  //   demo: "#",
  //   casePrefix: "case.ecommerce",
  // },
  {
    slug: "gym-smart-access",
    titleKey: "projects.2.title",
    descKey: "projects.2.desc",
    techs: ["Next.js", "Supabase", "Tailwind CSS", "Mercado Pago", "Mercadopago"],
    category: "fullstack",
    images: [gym1, gym2, gym3, gym5, gym6, gym7, gym8, gym9],
    // github: "#",
    demo: "https://gymsmartaccess.com",
    casePrefix: "case.gymaccess",
  }
];
