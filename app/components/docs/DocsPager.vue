<script setup lang="ts">
import type { DocEntry } from '#shared/types/docs'
import { docsPath } from '#shared/utils/docs'

defineProps<{
  prev: DocEntry | null
  next: DocEntry | null
}>()
</script>

<template>
  <nav v-if="prev || next" class="docs-pager" aria-label="文档上下篇">
    <v-btn v-if="prev" class="docs-pager-link" :to="docsPath(prev.slug)" variant="tonal" prepend-icon="mdi-arrow-left">
      <span class="docs-pager-copy">
        <span class="docs-pager-label">上一篇</span>
        <span class="docs-pager-title">{{ prev.title }}</span>
      </span>
    </v-btn>
    <span v-else class="docs-pager-spacer" />

    <v-btn v-if="next" class="docs-pager-link is-next" :to="docsPath(next.slug)" variant="tonal" append-icon="mdi-arrow-right">
      <span class="docs-pager-copy">
        <span class="docs-pager-label">下一篇</span>
        <span class="docs-pager-title">{{ next.title }}</span>
      </span>
    </v-btn>
  </nav>
</template>

<style scoped>
.docs-pager {
  display: grid;
  margin-top: 72px;
  padding-top: 32px;
  border-top: 1px solid rgba(var(--v-theme-on-background), 0.12);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.docs-pager-link {
  display: flex;
  width: 100%;
  height: auto;
  min-height: 76px;
  padding: 18px 22px;
  justify-content: flex-start;
  text-transform: none;
  letter-spacing: normal;
  white-space: normal;
}

.docs-pager-link :deep(.v-btn__content) {
  min-width: 0;
  flex: 1;
  justify-content: flex-start;
}

.docs-pager-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  text-align: left;
  overflow-wrap: anywhere;
}

.is-next,
.is-next :deep(.v-btn__content) {
  justify-content: flex-end;
}

.is-next .docs-pager-copy {
  align-items: flex-end;
  text-align: right;
}

.docs-pager-label {
  color: rgb(var(--v-theme-primary));
  font-size: 12px;
  font-weight: 700;
}

.docs-pager-title {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
}

@media (max-width: 959.98px) {
  .docs-pager {
    grid-template-columns: 1fr;
    margin-top: 48px;
  }

  .docs-pager-spacer {
    display: none;
  }

  .is-next,
  .is-next :deep(.v-btn__content) {
    justify-content: flex-start;
  }

  .is-next .docs-pager-copy {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
