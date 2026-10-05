<script setup lang="ts">
import type { DocTocEntry } from '#shared/types/docs'

const props = defineProps<{ toc: DocTocEntry[] }>()
const route = useRoute()
const activeId = ref('')
let headings: HTMLElement[] = []
let frame: number | null = null
let resizeObserver: ResizeObserver | undefined

function updateActiveHeading() {
  frame = null
  let current = headings[0]

  for (const heading of headings) {
    if (heading.getBoundingClientRect().top > 97) break
    current = heading
  }

  if (window.scrollY > 0
    && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    current = headings.at(-1)
  }

  activeId.value = current?.id ?? ''
}

function scheduleUpdate() {
  if (frame === null) frame = requestAnimationFrame(updateActiveHeading)
}

function refreshHeadings() {
  headings = props.toc
    .map((entry) => document.getElementById(entry.id))
    .filter((heading): heading is HTMLElement => Boolean(heading?.closest('.doc-body')))

  resizeObserver?.disconnect()
  const article = headings[0]?.closest('.docs-article')
  if (article) resizeObserver?.observe(article)
  scheduleUpdate()
}

onMounted(() => {
  resizeObserver = new ResizeObserver(scheduleUpdate)
  watch(() => props.toc, refreshHeadings, { immediate: true, flush: 'post' })
  watch(() => route.hash, scheduleUpdate, { flush: 'post' })
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
  resizeObserver?.disconnect()
  if (frame !== null) cancelAnimationFrame(frame)
})
</script>

<template>
  <v-list
    class="docs-toc"
    tag="nav"
    aria-label="本页内容"
    color="primary"
    bg-color="transparent"
    density="compact"
    nav
  >
    <v-list-subheader>本页内容</v-list-subheader>
    <v-list-item
      v-for="entry in toc"
      :key="entry.id"
      :title="entry.text"
      :to="{ path: route.path, query: route.query, hash: `#${entry.id}` }"
      :active="activeId === entry.id"
      :aria-current="activeId === entry.id ? 'location' : undefined"
      :style="{ paddingInlineStart: `${12 + Math.max(0, entry.depth - 2) * 12}px` }"
    />
  </v-list>
</template>

<style scoped>
.docs-toc {
  position: sticky;
  top: 88px;
  width: 200px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-block: 0;
}

.docs-toc :deep(.v-list-item-title) {
  font-size: 13px;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

@media (max-width: 1279.98px) {
  .docs-toc {
    display: none;
  }
}
</style>
