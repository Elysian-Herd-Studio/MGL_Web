<script setup lang="ts">
const { preference, isDark, cycle } = useThemeMode()

const modeIcon = computed(() =>
  preference.value === 'light'
    ? 'mdi-white-balance-sunny'
    : preference.value === 'dark'
      ? 'mdi-weather-night'
      : 'mdi-theme-light-dark'
)
</script>

<template>
  <v-app>
    <v-app-bar flat :color="isDark ? 'purple-darken-4' : 'purple-lighten-4'">
      <div class="d-flex align-center w-100 px-10">
        <img src="/icon-full.png" alt="Magical Land" class="app-logo">
        <v-btn
          icon
          variant="text"
          size="small"
          class="ms-4"
          :title="`主题：${preference === 'system' ? '跟随系统' : preference === 'dark' ? '深色' : '浅色'}`"
          @click="cycle"
        >
          <v-icon :icon="modeIcon" />
        </v-btn>
        <v-spacer />
        <v-tabs :color="isDark ? 'purple-lighten-3' : 'purple-darken-3'" class="flex-grow-0">
          <v-tab to="/">主页</v-tab>
          <v-tab to="/docs">文档</v-tab>
        </v-tabs>
      </div>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<style scoped>
.app-logo {
  display: block;
  height: 36px;
  width: auto;
}
</style>
