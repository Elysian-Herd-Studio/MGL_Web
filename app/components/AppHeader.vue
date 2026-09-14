<script setup lang="ts">
import { THEME_MODES, type ThemeMode } from '../composables/useThemeMode'

const route = useRoute()
const activeItems = computed(() => ({
  home: route.path === '/',
  docs: route.path === '/docs' || route.path.startsWith('/docs/')
}))
const themeMode = useThemeMode()
const themeOptions: Record<ThemeMode, { label: string, icon: string }> = {
  light: { label: '浅色', icon: 'mdi-weather-sunny' },
  dark: { label: '深色', icon: 'mdi-weather-night' },
  system: { label: '跟随系统', icon: 'mdi-theme-light-dark' }
}
const nextThemeMode = computed(() => THEME_MODES[(THEME_MODES.indexOf(themeMode.value) + 1) % THEME_MODES.length] ?? 'system')
const themeButtonLabel = computed(() => `当前主题：${themeOptions[themeMode.value].label}，点击切换为${themeOptions[nextThemeMode.value].label}`)
</script>

<template>
  <v-app-bar density="comfortable" class="app-header">
    <div class="app-header__brand">
      <NuxtLink to="/" class="d-flex align-center" aria-label="Magical Land 主页">
        <img src="/icon-full.png" alt="Magical Land" width="128" height="64" class="app-header__logo">
      </NuxtLink>
      <v-btn
        type="button"
        variant="text"
        size="small"
        :icon="themeOptions[themeMode].icon"
        :aria-label="themeButtonLabel"
        :title="themeButtonLabel"
        @click="themeMode = nextThemeMode"
      />
    </div>

    <v-spacer />

    <nav class="app-header__actions" aria-label="主导航">
      <v-btn
        to="/"
        variant="text"
        :active="activeItems.home"
        :aria-current="activeItems.home ? 'page' : undefined"
        :prepend-icon="activeItems.home ? 'mdi-home' : 'mdi-home-outline'"
      >主页</v-btn>
      <v-btn
        to="/docs"
        variant="text"
        :active="activeItems.docs"
        :aria-current="activeItems.docs ? 'page' : undefined"
        :prepend-icon="activeItems.docs ? 'mdi-book-open' : 'mdi-book-open-outline'"
      >文档</v-btn>
    </nav>
  </v-app-bar>
</template>

<style scoped>
.app-header :deep(.v-toolbar__content) {
  padding-inline: clamp(24px, 4vw, 72px);
}

.app-header__brand,
.app-header__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

.app-header__logo {
  display: block;
  height: 36px;
  width: auto;
}

@media (max-width: 599.98px) {
  .app-header :deep(.v-toolbar__content) {
    padding-inline: 16px;
  }

  .app-header__logo {
    height: 32px;
  }

  .app-header__actions {
    gap: 4px;
  }

  .app-header__actions .v-btn {
    min-width: 0;
    padding-inline: 8px;
  }
}
</style>
