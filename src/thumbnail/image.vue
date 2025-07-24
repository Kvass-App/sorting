<template>
  <Image :src="value" height="100px"> </Image>
</template>

<script setup lang="ts">
import { Image } from '@kvass/ui'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss"></style>
