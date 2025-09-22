<template>
  <div
    :class="[
      'kvass-sorting-item',
      {
        fixed: Boolean(item.fixed),
      },
    ]"
  >
    <component
      :is="getThumbnailComponent(item.thumbnail)"
      :value="item.thumbnail"
    ></component>

    <Flex direction="column" gap="0.25rem">
      <strong> {{ item.label }}</strong>
      <span v-if="item.tags"> {{ item.tags.join(', ') }}</span>
    </Flex>

    <slot name="end"></slot>
  </div>
</template>

<script setup>
import { Flex } from '@kvass/ui'

import thumbnails from '../thumbnail'
const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
})

function getThumbnailComponent(thumbnail) {
  const fallback = thumbnails.icons
  if (!thumbnail) return fallback
  if (['https', '/'].some((i) => thumbnail.startsWith(i)))
    return thumbnails.image
  if (thumbnail.includes(',')) return thumbnails.icons
  return fallback
}
</script>

<style lang="scss">
.kvass-sorting-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: var(--kvass-sorting-item-background, white);
  border: 1px solid
    var(--kvass-sorting-item-border-color, var(--k-ui-color-neutral));
  border-radius: var(--k-ui-rounding);
  --thumbnail-width: var(--kvass-sorting-item-thumbnail-width, 65px);
  --thumbnail-height: var(--kvass-sorting-item-thumbnail-height, 55px);
  &.fixed {
    cursor: not-allowed;
  }
}
</style>
