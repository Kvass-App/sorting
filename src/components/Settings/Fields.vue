<template>
  <Field
    v-for="item in items"
    :item="item"
    @input="($ev) => emit('input', $ev)"
  ></Field>
</template>
<script setup>
import { computed } from 'vue'
import Field from './Field.vue'
const emit = defineEmits(['input'])

const props = defineProps({
  item: {
    type: String,
  },
})

const getKey = (index) => {
  switch (index) {
    case 0:
      return 'component'
    case 1:
      return 'key'
    case 2:
      return 'label'
  }
}
const items = computed(() => {
  return props.item.split(',').map((item) => {
    return item.split(':').reduce((acc, current, currentIndex) => {
      const key = getKey(currentIndex)
      acc[key] = current
      return acc
    }, {})
  })
})
</script>

<style lang="scss"></style>
