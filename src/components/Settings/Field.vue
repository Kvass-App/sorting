<template>
  <FormControl :label="item.label">
    <component :is="component" v-model="value"></component>
  </FormControl>
</template>

<script setup>
import { FormControl, Input } from '@kvass/ui'
import { computed, inject } from 'vue'

const emit = defineEmits(['input'])
const data = inject('data')

const component = computed(() => {
  switch (props.item.component) {
    case 'Input':
      return Input
  }
})

const value = computed({
  get() {
    return data?.[props.item.key]
  },
  set(value) {
    emit('input', {
      key: props.item.key,
      value: value,
    })
  },
})

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<style lang="scss"></style>
