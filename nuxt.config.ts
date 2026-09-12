// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 4200 },
  modules: ['vuetify-nuxt-module'],
  vuetify: {
    moduleOptions: {
      // Vuetify 4 moved createRulesPlugin/useRules into core; the module still
      // resolves them from `vuetify/labs/rules`, which no longer exists.
      enableRules: false
    }
  }
})
