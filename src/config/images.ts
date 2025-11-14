// src/config/images.ts
// ЦЕНТРАЛИЗОВАННАЯ КОНФИГУРАЦИЯ ВСЕХ ИЗОБРАЖЕНИЙ

export const IMAGES = {
  hero: {
    main: "/images/hero-main.jpg",
    alt: 'TJ Yoga - Женя и Тим, преподаватели классической хатха йоги'
  },
  about: {
    teachers: "/images/about-teachers.jpg",
    alt: 'Женя Старовойтова и Тим - основатели TJ Yoga'
  },
  services: {
    onlineClub: "/images/services-online-club.jpg",
    retreat: "/images/services-retreat.jpg",
    personal: "/images/services-personal.jpg",
  },
  blog: {
    // Изображения для блога о йоге - философия и практика
    preview1: "/images/blog-preview1.jpg",
    preview2: "/images/blog-preview2.jpg",
  },
  testimonials: {
    // Используются локальные изображения из /images/testimonials/
    student1: "/images/testimonials/ekaterina.jpg",
    student2: "/images/testimonials/natalya.jpg",
    student3: "/images/testimonials/yulia.jpg",
  }
} as const;