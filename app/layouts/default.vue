<template>
  <v-app>
    <v-app-bar color="primary" flat theme="dark">
      <div class="d-flex align-center w-100 px-6">
        <v-app-bar-title>MGL</v-app-bar-title>
        <v-spacer />
        <v-tabs color="white" class="flex-grow-0">
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
