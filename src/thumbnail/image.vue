<template>
  <Image class="thumbnail-image" :src="imageComp" :height="height"> </Image>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Image } from '@kvass/ui'

const imageComp = computed(() => {
  switch (true) {
    case props.value.includes('vimeo'):
    case props.value.includes('youtube'):
      return `https://production.kvass.no/api/media/thumbnail?url=${props.value}`
    default:
      return props.value
  }
})

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: 'inherit',
  },
})
</script>

<style lang="scss">
.thumbnail-image {
  border-radius: var(--k-ui-rounding);
  border: 1px solid var(--k-ui-color-neutral);
  height: var(--thumbnail-height) !important;
  width: var(--thumbnail-width) !important;
}
</style>
