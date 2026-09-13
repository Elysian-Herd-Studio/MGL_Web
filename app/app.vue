<script setup lang="ts">
const { isDark } = useThemeMode()
const theme = useTheme()

watchEffect(() => {
  theme.global.name.value = isDark.value ? 'dark' : 'light'
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
</style>
