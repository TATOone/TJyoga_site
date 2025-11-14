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
    onlineClub: "https://i.imgur.com/LRxChic.jpeg",
    retreat: "https://i.imgur.com/CkHdHdV.jpeg",
    personal: "https://i.imgur.com/3O3wkme.jpeg",
  },
  blog: {
    // Изображения для блога о йоге - философия и практика
    preview1: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    preview2: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  testimonials: {
    student1: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    student2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    student3: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  }
} as const;