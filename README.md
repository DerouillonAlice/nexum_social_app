# Nexum — Plateforme de discussion collaborative

> Projet universitaire IUT — Application sociale temps réel construite avec Nuxt 4, Vue 3 et Tailwind CSS v4.

![Nuxt](https://img.shields.io/badge/Nuxt-4.2-00DC82?logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859?logo=vue.js&logoColor=black)

---

## Fonctionnalités

- **Authentification** — Inscription, connexion, déconnexion avec persistance par cookies (SSR)
- **Publications** — Créer, modifier, supprimer des publications avec upload d'images
- **Commentaires** — Fil de discussion complet sur chaque publication
- **Réactions** — Système de likes sur les publications
- **Salons (Channels)** — Créer, explorer, supprimer des salons thématiques
- **Profils** — Page profil personnelle et publique, édition avatar/bio
- **Recherche** — Recherche globale utilisateurs, salons et publications
- **Sidebar** — Navigation latérale avec tous les salons, expansion au survol
- **Tri** — Fil d'actualité triable par date (récent) ou popularité
- **Thème** — Mode clair / sombre avec détection automatique
- **Responsive** — Interface adaptée mobile, tablette et desktop
- **Accessibilité** — ARIA, navigation clavier, contraste AA, `lang`, `<title>`

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | [Nuxt 4.2](https://nuxt.com) / [Vue 3.5](https://vuejs.org) |
| State management | [Pinia 3](https://pinia.vuejs.org) + `pinia-plugin-persistedstate` (cookies) |
| CSS | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/postcss` |
| Tests unitaires | [Vitest 4](https://vitest.dev) + `@vue/test-utils` + jsdom |
| Tests E2E | [Cypress 15](https://cypress.io) |
| API Backend | REST / JSON-LD (Hydra) |

## Structure du projet

```
nexum/
├── assets/css/          # Styles globaux (Tailwind)
├── components/          # Composants Vue réutilisables
│   ├── AppNavbar.vue        # Barre de navigation supérieure
│   ├── AppSidebar.vue       # Sidebar latérale (salons, navigation)
│   ├── AuthImage.vue        # Composant image avec proxy media
│   ├── LoadingSpinner.vue   # Indicateur de chargement (bouncing dots)
│   ├── PostThread.vue       # Fil de commentaires d'une publication
│   ├── ProfileEdit.vue      # Formulaire d'édition du profil
│   ├── PublicationComposer.vue  # Composer une publication
│   ├── SearchBar.vue        # Barre de recherche globale
│   ├── UserAvatar.vue       # Avatar utilisateur
│   └── UserMenu.vue         # Menu dropdown utilisateur
├── composables/         # Logique métier réutilisable
│   ├── useAPI.js            # Client HTTP ($fetch, auth headers)
│   ├── useChannels.js       # CRUD salons
│   ├── useMedia.js          # Upload et gestion des médias
│   ├── useMessages.js       # CRUD publications
│   ├── useReactions.js      # Likes / réactions
│   ├── useSearch.js         # Recherche globale
│   ├── useTheme.js          # Thème clair/sombre
│   └── useUsers.js          # Gestion des utilisateurs
├── cypress/e2e/         # Tests end-to-end
├── layouts/             # Layout par défaut (Navbar + slot)
├── middleware/           # Middleware auth (redirection /login)
├── pages/               # Routes (file-based routing)
│   ├── index.vue            # Fil d'actualité + landing page
│   ├── login.vue            # Page de connexion
│   ├── register.vue         # Page d'inscription
│   ├── settings.vue         # Paramètres utilisateur
│   ├── channels/            # Explorer & détail des salons
│   └── profile/             # Profil personnel & public
├── server/api/          # Proxy media côté serveur
├── stores/              # Stores Pinia (auth)
└── tests/unit/          # Tests unitaires (Vitest)
```

## Installation

```bash
git clone https://github.com/DerouillonAlice/nexum_social_app.git
cd nexum_social_app
npm install
```

Créer un fichier `.env` à la racine (voir `.env.example`) :

```env
API_BASE_URL=https://votre-api.example.com/api
API_SLUG=votre-slug
```

## Commandes

```bash
# Serveur de développement (http://localhost:3000)
npm run dev

# Build production
npm run build

# Tests unitaires
npm run test:run

# Tests E2E (Cypress)
npm run test:e2e

# Cypress (mode interactif)
npm run cypress:open
```

## Tests

### Tests unitaires — 13 tests ✅

- **Auth Store** (8 tests) — état initial, login, logout, persistance, gestion d'erreurs
- **LoadingSpinner** (5 tests) — rendu, animation, accessibilité, message custom

### Tests E2E — 6 tests ✅

- **Authentification** (4 tests) — login valide/invalide, navigation protégée, déconnexion
- **Publications** (2 tests) — création et suppression de publication

## Auteur

**Alice Derouillon** — Projet IUT · 2026
