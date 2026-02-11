# 🗳️ Application de Vote en Ligne - IAI-Cameroun

Concours Miss & Master - Plateforme de vote avec paiement Mobile Money (MTN, Orange) via **NotchPay**.

## Structure du projet

| Dossier | Rôle | Hébergement |
|---------|------|-------------|
| **frontend/** | App React (Vite) | Vercel — définir **Root Directory** = `frontend` |
| **server/** | API Express + notchpay-js (Option B) | Railway — **Root Directory** = `server` |

Les documents d'analyse (`.md` à la racine) ne sont pas utilisés par le build ; les mettre dans un dossier (ex. `docs/`) ne dérange pas Vercel.

## Démarrage en local

```bash
# Terminal 1 - Backend
cd server && npm install && npm run dev

# Terminal 2 - Frontend (avec proxy /api vers localhost:3000)
cd frontend && npm install && npm run dev
```

## 📚 Documentation du projet

| Document | Description |
|----------|-------------|
| [docs/GUIDE_PAS_A_PAS.md](./docs/GUIDE_PAS_A_PAS.md) | **Déploiement pas à pas** (NotchPay, Vercel, Railway, webhooks) |
| [docs/NOTCHPAY_IMPLEMENTATION.md](./docs/NOTCHPAY_IMPLEMENTATION.md) | Guide technique d'intégration NotchPay |
| [docs/PAIEMENT_NOTCHPAY_EXPLIQUE.md](./docs/PAIEMENT_NOTCHPAY_EXPLIQUE.md) | Flux de paiement, Orange/MTN, dépannage 404/400 |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | État de l'implémentation UI/UX |
| [AMELIORATIONS_PROPOSEES.md](./AMELIORATIONS_PROPOSEES.md) | Propositions d'amélioration frontend |
| [QUICK_START.md](./QUICK_START.md) | Résumé des améliorations UI/UX |
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Checklist des 4 phases d'implémentation |

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
