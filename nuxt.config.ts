import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Nexum — Plateforme de discussion collaborative',
      meta: [
        { name: 'description', content: 'Nexum — Plateforme de discussion collaborative' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      slug: '',
      registrationCode: ''
    }
  }
})