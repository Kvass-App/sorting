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
    default: '40px',
  },
})
</script>

<style lang="scss">
.thumbnail-icons {
  svg {
    color: var(--k-ui-color-neutral);
  }
  padding: 0.5rem;
  background-color: white;
}
</style>
