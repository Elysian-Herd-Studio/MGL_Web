<script setup lang="ts">
import type { DocEntry, DocPage } from '#shared/types/docs'
import { docsPath } from '#shared/utils/docs'

const route = useRoute()

definePageMeta({
  key: (route) => route.path
})

const slug = computed(() => {
  const param = route.params.slug
  return ((Array.isArray(param) ? param[0] : param) || 'home').trim().toLowerCase()
})

const { data: pages, error: pagesError, refresh: refreshPages } = await useFetch<DocEntry[]>('/api/docs')
const { data: page, status, error: pageError, refresh: refreshPage } = await useFetch<DocPage>(
  () => `/api/docs/${encodeURIComponent(slug.value)}`,
  { key: `docs-${slug.value}` }
)

const updatedDate = computed(() => {
  if (!page.value?.updatedAt) return ''
  const date = new Date(page.value.updatedAt)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
})

useSeoMeta({
  title: () => page.value ? `${page.value.title} · 文档 · Magical Land` : '文档 · Magical Land',
  description: 'Magical Land 官方文档'
})
</script>

<template>
  <div class="docs-shell" :class="{ 'docs-shell--with-toc': page && !pageError && page.toc.length > 0 }">
    <aside class="docs-sidebar" aria-label="文档导航">
      <v-alert v-if="pagesError" type="warning" variant="tonal" density="compact">
        文档导航暂时无法加载。
        <v-btn variant="text" size="small" @click="refreshPages()">重试</v-btn>
      </v-alert>
      <v-list
        v-else-if="pages?.length"
        class="docs-nav-list"
        tag="nav"
        aria-label="文档列表"
        color="primary"
        bg-color="transparent"
        density="compact"
        nav
        slim
      >
        <v-list-subheader>文档</v-list-subheader>
        <v-list-item
          v-for="item in pages"
          :key="item.slug"
          :to="docsPath(item.slug)"
          :title="item.title"
          :active="item.slug === slug"
          :aria-current="item.slug === slug ? 'page' : undefined"
          exact
        />
      </v-list>
      <p v-else class="docs-sidebar-empty">暂无可用文档</p>
    </aside>

    <div class="docs-main" :aria-busy="status === 'pending'">
      <v-progress-linear v-if="status === 'pending'" color="primary" indeterminate aria-label="正在加载文档" />
      <div v-else-if="pageError || !page" class="docs-empty" role="status">
        <h1>{{ pageError?.statusCode === 404 ? '页面不存在' : '文档暂未加载' }}</h1>
        <p>{{ pageError?.statusCode === 404 ? '这篇文档可能已移动或删除，请从文档导航选择其他文档。' : '暂时无法获取 Wiki 文档，请稍后重试。' }}</p>
        <v-btn v-if="pageError?.statusCode !== 404" class="mt-6" variant="tonal" @click="refreshPage()">重新加载</v-btn>
        <v-btn v-else class="mt-6" to="/docs" variant="tonal">返回文档首页</v-btn>
      </div>
      <article v-else class="docs-article">
        <header class="docs-header">
          <h1 class="docs-title">{{ page.title }}</h1>
          <div v-if="updatedDate || page.editUrl" class="docs-meta">
            <span v-if="updatedDate" class="docs-updated">
              更新于 <time :datetime="page.updatedAt">{{ updatedDate }}</time>
            </span>
            <a v-if="page.editUrl" class="docs-edit-link" :href="page.editUrl" target="_blank" rel="noopener noreferrer">
              在 GitHub 上编辑
            </a>
          </div>
        </header>

        <div class="doc-body" v-html="page.html" />
        <DocsPager :prev="page.prev" :next="page.next" />
      </article>
    </div>

    <DocsToc v-if="page && !pageError && status !== 'pending' && page.toc.length > 0" :toc="page.toc" />
  </div>
</template>

<style scoped>
.docs-shell {
  display: grid;
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding: 56px 12px 96px;
  grid-template-columns: 224px minmax(0, 1fr);
  align-items: start;
  gap: 40px;
}

.docs-shell--with-toc {
  grid-template-columns: 224px minmax(0, 1fr) 200px;
}

.docs-sidebar {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 8px;
}

.docs-nav-list {
  padding: 0;
}

.docs-nav-list :deep(.v-list-item-title) {
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.docs-sidebar-empty,
.docs-updated,
.docs-empty p {
  color: rgba(var(--v-theme-on-background), 0.65);
}

.docs-sidebar-empty {
  font-size: 14px;
}

.docs-main {
  min-width: 0;
  overflow-wrap: anywhere;
}

.docs-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.12);
}

.docs-title {
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
}

.docs-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  margin-top: 18px;
  font-size: 13px;
}

.docs-edit-link,
.doc-body :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}

.docs-empty {
  padding-block: 40px;
}

.docs-empty h1 {
  margin-bottom: 12px;
  font-size: 28px;
}

.docs-empty p {
  line-height: 1.75;
}

.doc-body {
  font-size: 16px;
  line-height: 1.85;
}

.doc-body :deep(h1),
.doc-body :deep(h2),
.doc-body :deep(h3),
.doc-body :deep(h4),
.doc-body :deep(h5),
.doc-body :deep(h6) {
  margin: 48px 0 16px;
  font-weight: 700;
  line-height: 1.3;
  scroll-margin-top: 96px;
}

.doc-body :deep(h1) {
  font-size: 30px;
}

.doc-body :deep(h2) {
  padding-top: 28px;
  border-top: 1px solid rgba(var(--v-theme-on-background), 0.12);
  font-size: 26px;
}

.doc-body :deep(h3) {
  font-size: 20px;
}

.doc-body :deep(h4) {
  font-size: 17px;
}

.doc-body :deep(> :first-child) {
  margin-top: 0;
}

.doc-body :deep(p),
.doc-body :deep(ul),
.doc-body :deep(ol) {
  margin: 0 0 20px;
}

.doc-body :deep(ul),
.doc-body :deep(ol) {
  padding-left: 24px;
}

.doc-body :deep(li) {
  margin-bottom: 8px;
}

.doc-body :deep(li > ul),
.doc-body :deep(li > ol) {
  margin-block: 8px 0;
}

.doc-body :deep(blockquote) {
  margin: 0 0 20px;
  padding: 4px 0 4px 20px;
  border-left: 3px solid rgb(var(--v-theme-primary));
  color: rgba(var(--v-theme-on-background), 0.65);
}

.doc-body :deep(blockquote > :last-child) {
  margin-bottom: 0;
}

.doc-body :deep(hr) {
  margin: 40px 0;
  border: 0;
  border-top: 1px solid rgba(var(--v-theme-on-background), 0.12);
}

.doc-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}

.doc-body :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(var(--v-theme-on-background), 0.06);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.875em;
}

.doc-body :deep(pre) {
  margin: 0 0 24px;
  padding: 18px 20px;
  overflow-x: auto;
  border: 1px solid rgba(var(--v-theme-on-background), 0.12);
  border-radius: 8px;
  background: rgba(var(--v-theme-on-background), 0.04);
  line-height: 1.65;
}

.doc-body :deep(pre code) {
  padding: 0;
  background: none;
}

.doc-body :deep(table) {
  display: block;
  width: 100%;
  margin: 0 0 24px;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 14px;
}

.doc-body :deep(th),
.doc-body :deep(td) {
  padding: 10px 14px;
  border: 1px solid rgba(var(--v-theme-on-background), 0.12);
}

.doc-body :deep(th) {
  background: rgba(var(--v-theme-on-background), 0.04);
  font-weight: 700;
}

@media (max-width: 1279.98px) {
  .docs-shell {
    grid-template-columns: 208px minmax(0, 1fr);
    gap: 32px;
  }
}

@media (max-width: 959.98px) {
  .docs-shell {
    display: block;
    padding-block: 32px 64px;
  }

  .docs-sidebar {
    position: static;
    max-height: 280px;
    margin-bottom: 32px;
    padding: 0 0 24px;
    border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.12);
  }

  .docs-title {
    font-size: 30px;
  }
}
</style>
