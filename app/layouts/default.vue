<template>
  <v-app>
    <v-app-bar color="purple-lighten-4" flat>
      <div class="d-flex align-center w-100 px-10">
        <img src="/icon-full.png" alt="Magical Land" class="app-logo">
        <v-spacer />
        <v-tabs color="purple-darken-3" class="flex-grow-0">
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
