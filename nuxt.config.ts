import { resolve } from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 4200 },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  modules: ['vuetify-nuxt-module'],
  runtimeConfig: {
    // Git-backed wiki source, cached locally and refreshed hourly by a Nitro
    // background task (see server/plugins/wiki-sync.ts).
    wikiRepoUrl: 'https://github.com/Elysian-Herd-Studio/Magical-Land.wiki.git',
    // Resolved at build time so the path stays valid in a built .output server.
    wikiDir: process.env.NUXT_WIKI_DIR || resolve(process.cwd(), '.data/wiki')
  },
  vuetify: {
    moduleOptions: {
      // Vuetify 4 moved createRulesPlugin/useRules into core; the module still
      // resolves them from `vuetify/labs/rules`, which no longer exists.
      enableRules: false,
      // Vuetify exports `useLayout`, which collides with Nuxt's built-in
      // `useLayout` (#app/composables/layout). Prefix it to `useVLayout`.
      prefixComposables: ['useLayout']
    },
    ssrClientHints: {
      reloadOnFirstRequest: true,
      prefersColorScheme: true,
      prefersColorSchemeOptions: {
        baseUrl: '/',
        cookie: { name: 'vuetify-color-scheme' },
        darkThemeName: 'dark',
        lightThemeName: 'light'
      }
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {},
          dark: {}
        }
      },
      defaults: {
        // Site-wide card look: extra-large radius, no border/shadow, and a
        // contrasting surface so cards stay visible without an outline.
        VCard: {
          rounded: 'xl',
          variant: 'flat',
          color: 'surface-light'
        }
      }
    }
  }
})
