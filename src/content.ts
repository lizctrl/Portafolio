// Todo el contenido del portafolio está aquí. Cambia textos, enlaces y proyectos sin tocar los componentes.
// Las imágenes viven en /public: sustituye el archivo y actualiza su ruta aquí (por ejemplo '/liz-hero.jpg').
import type { IconName } from './components/Icon';

export interface Link {
  label: string;
  href: string;
}
export interface SocialLink extends Link {
  icon: IconName;
}
export interface Image {
  src: string;
  alt: string;
}
export interface Trait {
  icon: IconName;
  label: string;
}
export interface Tech {
  name: string;
  /** Color del punto junto al nombre. */
  color: string;
}
export interface TechGroup {
  title: string;
  icon: IconName;
  items: Tech[];
}
export interface Project {
  title: string;
  description: string;
  image: Image;
  tags: string[];
  url: string;
}

export const content = {
  // Lo que ven Google y las redes sociales al compartir el enlace.
  seo: {
    title: 'Liz · Ingeniera en Software',
    description:
      'Portafolio de Liz, desarrolladora de software. Proyectos web con React, Next.js, Node.js y TypeScript. Disponible para nuevos proyectos.',
    // En Vercel se usa el dominio de producción automáticamente; esta URL es la de respaldo.
    siteUrl: 'https://portafolio-lizctrl.vercel.app',
    image: '/og-image.png',
    locale: 'es_ES',
  },
  brand: 'codebyliz',
  nav: [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Sobre mí', href: '#sobre-mi' },
    { label: 'Habilidades', href: '#habilidades' },
    { label: 'Proyectos', href: '#proyectos' },
    { label: 'Contacto', href: '#contacto' },
  ] satisfies Link[] as Link[],

  social: [
    { label: 'GitHub', href: 'https://github.com/lizctrl', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
    { label: 'Correo', href: 'mailto:lizmonram@gmail.com', icon: 'mail' },
    { label: 'Código de este portafolio', href: 'https://github.com/lizctrl/Portafolio', icon: 'code' },
  ] satisfies SocialLink[] as SocialLink[],

  hero: {
    badge: 'Disponible para proyectos',
    greeting: 'Hola, soy',
    name: 'Liz',
    role: 'Ingeniera en Software',
    intro: 'Transformo ideas en experiencias digitales funcionales, intuitivas y con gran atención al detalle.',
    primaryCta: { label: 'Ver proyectos', href: '#proyectos' } as Link,
    secondaryCta: { label: 'Sobre mí', href: '#sobre-mi' } as Link,
    photo: { src: '/liz-hero.svg', alt: 'Liz trabajando con su portátil' } as Image,
    code: {
      file: 'about-me.ts',
      variable: 'developer',
      fields: [
        ['name', 'Liz'],
        ['role', 'Software Developer'],
        ['passion', 'Crear soluciones'],
        ['mindset', 'Always learning'],
      ] as [string, string][],
    },
  },

  about: {
    badge: 'Sobre mí',
    title: 'Conoce un poco más de mí',
    text: 'Soy Ingeniera en Software con una gran pasión por la tecnología, la creatividad y la resolución de problemas. Disfruto crear soluciones que no solo funcionen bien, sino que también ofrezcan una gran experiencia de usuario.',
    photo: { src: '/liz-about.svg', alt: 'Liz sonriendo frente a su portátil' } as Image,
    traits: [
      { icon: 'code', label: 'Desarrollo de software' },
      { icon: 'layers', label: 'Aprendizaje constante' },
      { icon: 'heart', label: 'Cuidando los detalles' },
    ] satisfies Trait[] as Trait[],
    motivation: {
      title: 'Me motiva...',
      items: [
        'Convertir ideas en proyectos reales',
        'Aprender y explorar nuevas tecnologías',
        'Diseñar soluciones útiles y escalables',
        'Colaborar en equipos creativos',
      ],
    },
  },

  skills: {
    badge: 'Habilidades',
    title: 'Tecnologías que uso',
    subtitle: 'Estas son algunas de las herramientas y tecnologías con las que desarrollo mis proyectos.',
    groups: [
      {
        title: 'Frontend',
        icon: 'monitor',
        items: [
          { name: 'React', color: '#61dafb' },
          { name: 'Angular', color: '#dd0031' },
          { name: 'Next.js', color: '#000000' },
          { name: 'Tailwind CSS', color: '#38bdf8' },
          { name: 'TypeScript', color: '#3178c6' },
        ],
      },
      {
        title: 'Backend',
        icon: 'server',
        items: [
          { name: 'Node.js', color: '#5fa04e' },
          { name: 'Java', color: '#f89820' },
          { name: 'Python', color: '#3776ab' },
        ],
      },
      {
        title: 'Bases de datos',
        icon: 'database',
        items: [
          { name: 'PostgreSQL', color: '#336791' },
          { name: 'SQL Server', color: '#cc2927' },
          { name: 'MongoDB', color: '#47a248' },
          { name: 'Firebase', color: '#ffca28' },
        ],
      },
      {
        title: 'Herramientas',
        icon: 'wrench',
        items: [
          { name: 'Git', color: '#f05032' },
          { name: 'GitHub', color: '#6e5494' },
          { name: 'Docker', color: '#2496ed' },
          { name: 'Figma', color: '#f24e1e' },
        ],
      },
    ] satisfies TechGroup[] as TechGroup[],
  },

  projects: {
    badge: 'Proyectos',
    title: 'Proyectos destacados',
    subtitle: 'Una selección de trabajos que reflejan mi enfoque, habilidades y creatividad.',
    allLink: { label: 'Ver todos los proyectos', href: 'https://github.com/lizctrl?tab=repositories' } as Link,
    items: [
      {
        title: 'Virtual Buddy',
        description: 'Proyecto web en desarrollo construido con Next.js, React y TypeScript.',
        image: { src: '/virtual-buddy.svg', alt: 'Virtual Buddy: proyecto en desarrollo' },
        tags: ['Next.js', 'React', 'TypeScript'],
        url: 'https://github.com/lizctrl/virtual-buddy',
      },
      {
        title: 'TaskFlow',
        description: 'App de gestión de tareas con autenticación, organización por proyectos y estadísticas.',
        image: { src: '/taskflow.svg', alt: 'Captura de TaskFlow' },
        tags: ['Next.js', 'TypeScript', 'PostgreSQL'],
        url: 'https://github.com/lizctrl',
      },
      {
        title: 'MovieHub',
        description: 'Plataforma para explorar películas y series usando una API pública, con búsqueda y filtros.',
        image: { src: '/moviehub.svg', alt: 'Captura de MovieHub' },
        tags: ['React', 'Tailwind CSS', 'API REST'],
        url: 'https://github.com/lizctrl',
      },
      {
        title: 'Tienda Online',
        description: 'E-commerce con carrito de compras, gestión de productos y panel de administración.',
        image: { src: '/tienda.svg', alt: 'Captura de Tienda Online' },
        tags: ['React', 'Node.js', 'MongoDB'],
        url: 'https://github.com/lizctrl',
      },
    ] satisfies Project[] as Project[],
  },

  contact: {
    title: '¿Trabajemos juntos?',
    text: 'Estoy abierta a nuevas oportunidades, colaboraciones o proyectos interesantes. ¡Hablemos!',
    button: { label: 'Contáctame', href: 'mailto:lizmonram@gmail.com' } as Link,
  },

  footer: { owner: 'CodeByLiz', madeBy: 'Liz' },
};
