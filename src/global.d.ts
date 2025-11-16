// Global type declarations for non-TypeScript modules

// CSS modules
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

// Image modules
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';
declare module '*.webp';

// Other asset types
declare module '*.json' {
  const value: any;
  export default value;
}

