import ecommerce1 from "@/assets/projects/ecommerce-1.jpg";
import ecommerce2 from "@/assets/projects/ecommerce-2.jpg";
import mexx1 from "@/assets/projects/mexx/1.png";
import mexx2 from "@/assets/projects/mexx/2.png";
import mexx3 from "@/assets/projects/mexx/3.png";
import mexx4 from "@/assets/projects/mexx/4.png";
import mexx5 from "@/assets/projects/mexx/5.png";
import mexx6 from "@/assets/projects/mexx/6.png";
import mexx7 from "@/assets/projects/mexx/7.png";
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
  canva?: string;
  figjam?: string;
  lofi?: string;
  // Case study translation key prefix
  casePrefix: string;
  // Path relative to /public for OG image
  ogImage?: string;
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
    slug: "mexx-ux-redesign",
    titleKey: "projects.5.title",
    descKey: "projects.5.desc",
    techs: ["Figma", "UX Research", "Maze", "UXTweak", "Google Forms", "Coderhouse", "Garrett"],
    category: "ux-ui",
    images: [
      mexx1,
      mexx6,
      mexx7,
      mexx2,
      mexx3,
      mexx4,
      mexx5
    ],
    demo: "https://www.figma.com/proto/V2BvEJ41xWP5QrVhTAFa2c/Prototipado---Entrega-Final---Nicolas-Ariel-Fernandez?node-id=2055-4162&t=2kg1vKuuRuAhHnpl-1&scaling=scale-down&content-scaling=fixed&page-id=2012%3A541&starting-point-node-id=2012%3A591&hotspot-hints=0",
    canva: "https://canva.link/bn7uslxr99b9daq",
    figjam: "https://www.figma.com/board/HD6zsWIhjrczXgkxrh39xj/Diagramas---Primera-entrega---Prototipado?node-id=6-44&t=VEvADcLt4ZDveahL-4",
    lofi: "https://www.figma.com/proto/5xxU7eFe2v4l9nJ3VYyLDa/Prototipado---Coderhouse---Nicolas-Ariel-Fernandez?node-id=2-2077&t=ucWqteKlRWumQbf7-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2%3A2179",
    casePrefix: "case.mexx",
    ogImage: "/og/mexx-ux-redesign.png",
  },
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
    ogImage: "/og/gym-smart-access.png",
  }
];
