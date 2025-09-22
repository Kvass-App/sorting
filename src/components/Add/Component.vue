<template>
  <Dialog
    class="kvass-sorting-add"
    ref="dialog"
    :teleport="false"
    :title="`Legg til et nytt element`"
    alignment="top"
  >
    <template #default>
      <div class="kvass-sorting-add__items">
        <template v-for="item in getItems()">
          <Item
            :item="item"
            :class="[
              'kvass-sorting-add__item',
              {
                'kvass-sorting-add__item--selected': item.key === selected.key,
              },
            ]"
            @click="selected = item"
          />
        </template>
      </div>
    </template>
    <template #actions="{ close }">
      <Flex justify="flex-end" gap="xs">
        <Button
          :label="props.labels?.cancel"
          icon-right="fa-pro-regular:xmark"
          variant="secondary"
          @click="() => update(true)"
        />
        <Button
          label="Legg til"
          icon-right="fa-pro-regular:arrow-right"
          variant="primary"
          @click="() => update(false)"
        />
      </Flex>
    </template>
  </Dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Flex, Dialog, Button } from '@kvass/ui'
import Item from '../Item.vue'
const emit = defineEmits(['update'])

const dialog = ref(null)
const selected = ref({})

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
  items: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Object,
    default: {},
  },
})

function update(reset = false) {
  emit('update', !reset ? selected.value : null)
  return dialog.value.close()
}

function getItems() {
  if (!props.items?.length) return

  return props.items?.filter((i) => {
    if (i?.limit?.min === 0) return false
    return true
  })
}

onMounted(() => {
  if (dialog.value) {
    dialog.value.open()
  }
})
</script>

<style lang="scss">
.kvass-sorting-add {
  position: relative;
  z-index: 1;
  width: 600px;
  &__items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  &__item {
    &:hover {
      cursor: pointer;
      --kvass-sorting-item-background: var(--k-ui-color-neutral-lightest);
    }
    &--selected {
      --kvass-sorting-item-background: hsla(
        var(--primary-h),
        var(--primary-s),
        var(--primary-l),
        0.2
      ) !important;

      --kvass-sorting-item-border-color: hsla(
        var(--primary-h),
        var(--primary-s),
        var(--primary-l),
        0.4
      );
    }
  }
}
</style>
