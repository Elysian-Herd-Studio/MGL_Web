<template>
  <v-app>
    <NuxtLoadingIndicator color="#c4b5fd" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
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

.nuxt-loading-indicator {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}
</style>
