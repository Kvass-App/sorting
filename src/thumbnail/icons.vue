<template>
  <Flex class="thumbnail-icons" :nowrap="true" align="center" gap="1rem">
    <Icon v-for="item in items" :icon="item" :width="width"> </Icon>
  </Flex>
</template>

<script setup lang="ts">
import { Icon, Flex } from '@kvass/ui'
import { computed } from 'vue'

const items = computed(() => {
  return props.value.split(',')
})
const props = defineProps({
  value: {
    type: String,
    default: 'fa-pro-solid:xmark',
  },
  width: {
    type: String,
    default: 'inherit',
  },
})
</script>

<style lang="scss">
.thumbnail-icons {
  svg {
    color: var(--primary);
  }
  $space: 10px;
  height: calc(#{var(--thumbnail-height)} - $space) !important;
  width: calc(#{var(--thumbnail-width)} - $space) !important;
  background-color: white;
  border-radius: var(--k-ui-rounding);
  border: 1px solid var(--k-ui-color-neutral);
  padding: calc($space/2);
}
</style>
