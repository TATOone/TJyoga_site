/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        body: ['"Source Sans 3"', 'Segoe UI', 'system-ui', 'sans-serif'],
        inter: ['"Source Sans 3"', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        terracotta: 'var(--color-terracotta)',
        'terracotta-ink': 'var(--color-terracotta-ink)',
        'terracotta-ink-hover': 'var(--color-terracotta-ink-hover)',
        'golden-sandy': 'var(--color-golden-sandy)',
        'olive-green': 'var(--color-olive-green)',
        'olive-ink': 'var(--color-olive-ink)',
        'olive-ink-hover': 'var(--color-olive-ink-hover)',
        cream: 'var(--color-cream)',
        'light-sandy': 'var(--color-light-sandy)',
        'light-olive': 'var(--color-light-olive)',
        'dark-brown': 'var(--color-dark-brown)',
        'light-text': 'var(--color-light-text)',
        'gray-brown': 'var(--color-gray-brown)',
        'footer-muted': 'var(--color-footer-muted)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        400: '400ms',
      },
      borderRadius: {
        soft: 'var(--radius-md)',
        card: 'var(--radius-xl)',
      },
      minHeight: {
        touch: 'var(--space-touch)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
    },
  },
  plugins: [],
}
