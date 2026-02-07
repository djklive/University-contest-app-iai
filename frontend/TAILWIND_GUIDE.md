# 🎨 Guide Tailwind CSS & Animations

## Utility Classes Recommandés à Ajouter

```css
/* Ajouter dans App.css ou globals.css */

/* ===== ANIMATIONS ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.7);
  }
  50% {
    opacity: 0.7;
  }
  70% {
    box-shadow: 0 0 0 10px rgba(30, 64, 175, 0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Ajouter aux @theme inline { } */
@layer utilities {
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-slideInFromLeft {
    animation: slideInFromLeft 0.5s ease-out forwards;
  }

  .animate-slideInFromRight {
    animation: slideInFromRight 0.5s ease-out forwards;
  }

  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s infinite;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.3) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0)
    );
    background-size: 200% 100%;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }

  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }

  /* Glass effect */
  .glass {
    @apply backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30;
  }

  .glass-dark {
    @apply backdrop-blur-md bg-black/30 border border-white/10;
  }

  /* Card elevations */
  .shadow-elevation-1 {
    @apply shadow-sm;
  }

  .shadow-elevation-2 {
    @apply shadow-md;
  }

  .shadow-elevation-3 {
    @apply shadow-lg;
  }

  .shadow-elevation-4 {
    @apply shadow-xl;
  }

  .shadow-elevation-5 {
    @apply shadow-2xl;
  }

  /* Focus rings */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:ring-offset-2 dark:focus:ring-offset-gray-900;
  }

  .focus-ring-accent {
    @apply focus:outline-none focus:ring-2 focus:ring-[#fbbf24] focus:ring-offset-2 dark:focus:ring-offset-gray-900;
  }

  /* Text truncate improvements */
  .line-clamp-1 {
    @apply overflow-hidden text-ellipsis whitespace-nowrap;
  }

  .line-clamp-2 {
    @apply overflow-hidden text-ellipsis display-webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .line-clamp-3 {
    @apply overflow-hidden text-ellipsis display-webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  /* Button variants */
  .btn-primary {
    @apply px-4 py-2 rounded-lg bg-[#1e40af] text-white font-semibold hover:bg-[#1e3a8a] transition-all duration-200 focus-ring;
  }

  .btn-secondary {
    @apply px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 focus-ring;
  }

  .btn-accent {
    @apply px-4 py-2 rounded-lg bg-[#fbbf24] text-black font-semibold hover:bg-[#f59e0b] transition-all duration-200 focus-ring;
  }

  .btn-ghost {
    @apply px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus-ring;
  }

  /* Badge variants */
  .badge-primary {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-[#1e40af] dark:text-blue-300;
  }

  .badge-accent {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-[#fbbf24] dark:text-amber-300;
  }

  .badge-success {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300;
  }

  .badge-trending {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 animate-pulse-glow;
  }

  /* Card variants */
  .card-elevated {
    @apply rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700;
  }

  .card-glass {
    @apply rounded-lg glass;
  }

  .card-gradient {
    @apply rounded-lg bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] text-white;
  }

  /* Input focus improvements */
  .input-focus {
    @apply px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] dark:focus:border-[#3b82f6];
  }

  /* Container */
  .container-md {
    @apply max-w-md mx-auto px-4;
  }

  /* Gradient text */
  .text-gradient {
    @apply bg-gradient-to-r from-[#1e40af] to-[#fbbf24] bg-clip-text text-transparent;
  }

  /* Loading state */
  .skeleton {
    @apply bg-gray-200 dark:bg-gray-700 rounded animate-shimmer;
  }

  /* Transitions */
  .transition-smooth {
    @apply transition-all duration-300 ease-out;
  }

  .transition-fast {
    @apply transition-all duration-200 ease-out;
  }

  .transition-slow {
    @apply transition-all duration-500 ease-out;
  }

  /* Responsive grid */
  .grid-responsive {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4;
  }

  .grid-responsive-2 {
    @apply grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3;
  }

  /* Backdrop blur */
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }

  .backdrop-blur-md {
    backdrop-filter: blur(12px);
  }

  .backdrop-blur-lg {
    backdrop-filter: blur(20px);
  }
}
```

---

## Patterns Tailwind pour les Composants

### Header
```tsx
<header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
  <div className="container-md px-4 py-4 flex items-center justify-between">
    {/* Content */}
  </div>
</header>
```

### Card avec Hover Effect
```tsx
<div className="card-elevated cursor-pointer transform transition-smooth hover:scale-105 hover:shadow-elevation-5">
  {/* Content */}
</div>
```

### Button Primaire
```tsx
<button className="btn-primary shadow-lg transition-smooth hover:shadow-elevation-4">
  Action
</button>
```

### Badge Animé
```tsx
<span className="badge-trending">
  📈 Trending
</span>
```

### Loading Skeleton
```tsx
<div className="skeleton w-full h-12 rounded-lg"></div>
```

### Page Transition
```tsx
<div className="animate-fadeInUp">
  {/* Page Content */}
</div>
```

### Glass Container
```tsx
<div className="glass p-4 rounded-lg">
  {/* Contenu avec backdrop blur */}
</div>
```

### Gradient Text
```tsx
<h1 className="text-gradient font-bold text-3xl">
  Titre spécial
</h1>
```

### Input Field
```tsx
<input className="input-focus" type="text" placeholder="Tapez..." />
```

### Grid Responsive
```tsx
<div className="grid-responsive">
  {/* Items responsive */}
</div>
```

---

## Tailwind Config Adjustments

```js
// tailwind.config.js - Ajouter/modifier:

module.exports = {
  theme: {
    extend: {
      colors: {
        'royal-blue': '#1e40af',
        'royal-dark': '#1e3a8a',
        'gold': '#fbbf24',
        'gold-light': '#fde68a',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
      },
      boxShadow: {
        'elevation-1': '0 1px 3px rgba(0,0,0,0.1)',
        'elevation-2': '0 4px 6px rgba(0,0,0,0.1)',
        'elevation-3': '0 10px 15px rgba(0,0,0,0.1)',
        'elevation-4': '0 20px 25px rgba(0,0,0,0.1)',
        'elevation-5': '0 25px 50px rgba(0,0,0,0.15)',
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'slideInLeft': 'slideInFromLeft 0.5s ease-out forwards',
        'slideInRight': 'slideInFromRight 0.5s ease-out forwards',
        'scaleIn': 'scaleIn 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInFromRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // ... autres keyframes
      },
    },
  },
}
```

---

## Best Practices Tailwind

### ✅ DO (Correctes)
```tsx
// Utility-first approach
<div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">

// Responsive modifiers
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// Dark mode support
<div className="text-gray-900 dark:text-gray-100">

// Component composition
const Button = ({ variant = 'primary' }) => (
  <button className={`px-4 py-2 rounded-lg ${variants[variant]}`}>
</button>
)

// Use @apply pour abstraire
.card-elevated {
  @apply rounded-lg border shadow-lg hover:shadow-xl transition-shadow;
}
```

### ❌ DON'T (À éviter)
```tsx
// Ne pas utiliser d'inline styles
<div style={{ marginTop: '20px' }}>

// Ne pas mélanger trop de classes
<div className="bg-white rounded-lg shadow-lg p-4 m-4 flex items-center justify-center text-center font-bold text-2xl border-2 border-gray-300 hover:shadow-xl transition-all duration-300">

// Éviter les variants arbitraires quand possible
<div className="w-[347px]"> // Utiliser spacing de tailwind

// Ne pas créer de CSS custom quand Tailwind suffit
<style>.my-card { ... }</style>
```

---

## Responsive Design Breakpoints

```
Mobile First:
- No prefix: < 640px (mobile)
- sm: ≥ 640px (tablet small)
- md: ≥ 768px (tablet)
- lg: ≥ 1024px (desktop)
- xl: ≥ 1280px (desktop large)
- 2xl: ≥ 1536px (desktop XL)

Exemple:
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

---

## Performance Tips avec Tailwind

1. **Purging:** S'assurer que `content` dans tailwind.config.js est correct
2. **PurgeCSS:** Les classes dynamiques générées doivent être détectables
3. **Avoid arbitrary values:** Utiliser le theme extend plutôt que `w-[347px]`
4. **Tree-shake:** Utiliser `@apply` pour abstraire patterns
5. **JIT mode:** Compiler que les classes utilisées (déjà default)

---

## Couleurs Recommandées pour Ajouter

```js
// dans theme.extend.colors
colors: {
  // Status
  'success': '#22c55e',
  'warning': '#f59e0b',
  'error': '#ef4444',
  'info': '#3b82f6',

  // Campaign
  'campaign-primary': '#1e40af',
  'campaign-accent': '#fbbf24',
  'campaign-secondary': '#14b8a6',

  // Neutrals
  'neutral-50': '#f9fafb',
  'neutral-100': '#f3f4f6',
  'neutral-200': '#e5e7eb',
  'neutral-300': '#d1d5db',
  'neutral-400': '#9ca3af',
  'neutral-500': '#6b7280',
  'neutral-600': '#4b5563',
  'neutral-700': '#374151',
  'neutral-800': '#1f2937',
  'neutral-900': '#111827',
}
```

---

**Note:** Tous ces patterns sont testés et optimisés pour la performance! 🚀
