<script setup lang="ts">
interface DocEntry {
  slug: string
  title: string
}

interface DocPage extends DocEntry {
  html: string
}

const route = useRoute()

const slug = computed(() => {
  const param = route.params.slug
  return (Array.isArray(param) ? param[0] : param) || 'home'
})

const { data: pages, error: pagesError } = await useFetch<DocEntry[]>('/api/docs')

const { data: page, status, error: pageError } = await useFetch<DocPage>(
  () => `/api/docs/${slug.value}`,
  { watch: [slug] }
)

const pageErrorMessage = computed(() => {
  const error = pageError.value
  if (!error) return ''
  if (error.statusCode === 404) return '页面不存在'
  return `Wiki 暂不可用：${error.statusMessage || error.message}`
})

useHead(() => ({
  title: page.value ? `${page.value.title} · 文档` : '文档'
}))
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <v-alert v-if="pagesError" type="warning" variant="tonal">
      Wiki 暂不可用：{{ pagesError.statusMessage || pagesError.message }}
    </v-alert>

    <v-row v-else>
      <v-col cols="12" md="3" lg="2">
        <v-card class="docs-nav-card">
          <v-card-title class="text-subtitle-1">文档</v-card-title>
          <v-divider />
          <v-list v-if="pages?.length" nav density="compact">
            <v-list-item
              v-for="item in pages"
              :key="item.slug"
              :to="`/docs/${item.slug}`"
              :title="item.title"
              :active="item.slug === slug"
            />
          </v-list>
          <v-card-text v-else class="text-medium-emphasis">暂无文档</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="9" lg="10">
        <v-card class="docs-content-card pa-4 pa-md-6">
          <v-progress-linear v-if="status === 'pending'" indeterminate />
          <v-alert v-else-if="pageError" type="warning" variant="tonal">
            {{ pageErrorMessage }}
          </v-alert>
          <article v-else-if="page" class="markdown-body" v-html="page.html" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.docs-nav-card {
  position: sticky;
  top: 80px;
  /* Override the site-wide card surface so the sidebar sits on the page
     background; unlayered CSS beats Vuetify's layered bg-surface-light. */
  background: transparent;
}

.docs-content-card {
  background: transparent;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin: 1.2em 0 0.6em;
  font-weight: 500;
}

.markdown-body :deep(h1) {
  font-size: 1.75rem;
}

.markdown-body :deep(h2) {
  font-size: 1.4rem;
}

.markdown-body :deep(h3) {
  font-size: 1.15rem;
}

.markdown-body :deep(p) {
  margin: 0.6em 0;
  line-height: 1.7;
}

.markdown-body :deep(a) {
  color: rgb(var(--v-theme-primary));
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0.6em 0;
  padding-left: 1.5rem;
}

.markdown-body :deep(code) {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 4px;
  font-size: 0.9em;
  padding: 0.15em 0.35em;
}

.markdown-body :deep(pre) {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 8px;
  overflow-x: auto;
  padding: 12px 16px;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.5);
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0.8em 0;
  padding-left: 1rem;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  margin: 0.8em 0;
  width: 100%;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  padding: 6px 12px;
}

.markdown-body :deep(img) {
  max-width: 100%;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  margin: 1.5em 0;
}
</style>
