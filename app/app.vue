<script setup lang="ts">
const { preference } = useThemeMode()
const theme = useTheme()
const { $ssrClientHints } = useNuxtApp()

const antiFlashScript = `;(function () {
  try {
    var dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    var cookie = document.cookie
    var hasScheme = /(?:^|;\\s*)vuetify-color-scheme=/.test(cookie)
    var guarded = /(?:^|;\\s*)vuetify-nuxt-client-hints-reloaded=/.test(cookie)
    if (dark && !hasScheme && !guarded) {
      document.documentElement.style.background = '#121212'
      var style = document.createElement('style')
      style.textContent = 'body{visibility:hidden!important}'
      document.head.appendChild(style)
    }
  } catch (e) {}
})()`

useHead({
  script: [{
    innerHTML: $ssrClientHints.firstRequest ? antiFlashScript : '',
    tagPosition: 'head'
  }]
})

watch(preference, (mode) => {
  theme.change(mode)
})

onMounted(() => {
  if (preference.value === 'system') {
    if (!theme.isSystem.value) {
      theme.change('system')
    }
  } else if (theme.name.value !== preference.value) {
    theme.change(preference.value)
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.docs-nav-card,
.docs-content-card {
  background: transparent !important;
}

.docs-nav-card .v-list {
  background: transparent;
}
</style>
