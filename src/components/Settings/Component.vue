<template>
  <Flex direction="column" gap="sm">
    <Fields
      v-if="props.value?.settings"
      :item="props.value?.settings"
      @input="($ev) => updateData($ev)"
    ></Fields>
    <FormControl v-if="value.alternatives" label="Erstatt med">
      <Dropdown
        :label="value?.data?.replaceBy?.label || 'Velg..'"
        :items="getCurrentAlternatives()"
      >
      </Dropdown>
    </FormControl>
  </Flex>
</template>

<script setup>
import { provide, computed } from 'vue'

import { Flex, FormControl, Dropdown } from '@kvass/ui'
import Fields from './Fields.vue'

const emit = defineEmits(['update'])
const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
  items: {
    type: Array,
    default: () => [],
  },
})

const currentdata = computed(() => {
  const index = findCurrentIndex(props.value, props.items)
  if (index !== -1) {
    return props.items[index]?.data
  }
})

provide('data', currentdata.value)

function findCurrentIndex(current, items) {
  return items.findIndex((item) => item.key === current.key)
}

function updateData(value) {
  const index = findCurrentIndex(props.value, props.items)
  if (index !== -1) {
    props.items[index].data[value.key] = value.value
    emit('update')
  }
}

function getCurrentAlternatives() {
  return [
    ...props.value?.alternatives,
    { label: 'Velg..', value: 'none' },
  ]?.map((i) => ({
    ...i,
    action: () => {
      const index = findCurrentIndex(props.value, props.items)
      if (index !== -1) {
        props.items[index].data.replaceBy = i
      }

      emit('update')
    },
  }))
}
</script>

<style lang="scss"></style>
