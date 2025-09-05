<script setup>
import { Button, Card, Dialog, Flex, Alert, Icon } from '@kvass/ui'
import { ref, watch, onMounted, computed } from 'vue'
import draggable from 'vuedraggable'
import thumbnails from '../thumbnail'
import Settings from './Settings/Component.vue'
import { useCurrentElement } from '@vueuse/core'

const props = defineProps({
  value: String,
  config: {
    type: String,
    default: '[]',
  },
  labels: {
    type: Object,
    default: () => ({
      title: 'Tillpass rekkefølge',
      subtitle: 'Her kan du tilpasse rekkefølgen på modulene for denne siden',
      reset: 'Tilbakestill',
      cancel: 'Avbryt',
      confirm: 'Bekreft',
      alert:
        'Endringene blir synlig på selve nettsiden når du bekrefter og lagrer',
    }),
  },
})

const dragOptions = {
  animation: 250,
  easing: 'cubic-bezier(1, 0, 0, 1)',
  filter: '.fixed', // Don't allow dragging of .fixed items
  preventOnFilter: false, // Allow clicking but prevent dragging
}

const items = ref([])
const current = ref({})

const settingsDialog = ref(null)
const element = useCurrentElement()

const labelsComp = computed(() => {
  if (typeof props.labels === 'string') {
    return JSON.parse(props.labels)
  }

  return props.labels
})
function findCurrentIndex(current, items) {
  return items.findIndex((item) => item.key === current.key)
}

function openSettings(item) {
  current.value = item
  settingsDialog.value.open()
}
function getThumbnailComponent(thumbnail) {
  const fallback = thumbnails.icons
  if (!thumbnail) return fallback
  if (['https', '/'].some((i) => thumbnail.startsWith(i)))
    return thumbnails.image
  if (thumbnail.includes(',')) return thumbnails.icons
  return fallback
}

watch(
  () => props.config,
  (newValue, oldValue) => {
    if (!newValue) return

    let val = JSON.parse(newValue)
    const value = JSON.parse(props.value)

    //if value sort config based on value
    if (value?.length) {
      const orderMap = new Map(value.map((item, index) => [item.key, index]))

      val.sort((a, b) => {
        return orderMap.get(a.key) - orderMap.get(b.key)
      })
    }

    items.value = val.map((i) => {
      const index = findCurrentIndex(i, value)
      const data = value?.[index]?.data

      return {
        data: data || {},
        ...i,
        id: i.key,
      }
    })
  },
  {
    immediate: true,
  },
)

function checkMove(event) {
  // Prevent dragging if the target item or the dragged item is fixed
  return (
    !items.value[event.draggedContext.futureIndex].fixed &&
    !items.value[event.draggedContext.index].fixed
  )
}
function arraysEqualByKeyInOrder(arr1, arr2, key) {
  if (arr1.length !== arr2.length) return false
  return arr1.every((item, index) => item[key] === arr2[index][key])
}

const getValue = (state) => {
  switch (state) {
    case 'save': {
      if (arraysEqualByKeyInOrder(JSON.parse(props.config), items.value, 'key'))
        return []
      return items.value.map(({ key, data }) => ({
        key,
        data,
      }))
    }
    case 'reset':
      return []
    case 'default':
      return null
  }
}
const update = (state) => {
  if (state === 'reset') {
    items.value = JSON.parse(props.config)
  }
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: {
        state,
        value: getValue(state),
      },
      bubbles: true,
      composed: true,
    }),
  )
}
</script>

<template>
  <div :class="['kvass-sorting']">
    <Dialog
      :teleport="true"
      ref="settingsDialog"
      :title="`Tilpasninger ${current.label}`"
      alignment="top"
    >
      <template #default>
        <Settings
          class="kvass-sorting__settings"
          :value="current"
          :items="items"
        >
        </Settings>
      </template>
      <template #actions="{ close }">
        <Flex justify="flex-end" gap="xs">
          <Button
            :label="props.labelsComp.cancel"
            icon-right="fa-pro-regular:xmark"
            variant="secondary"
            @click="close"
          />
          <Button
            :label="labelsComp.config"
            icon-right="fa-pro-regular:arrow-right"
            variant="primary"
            @click="close"
          />
        </Flex>
      </template>
    </Dialog>

    <Card
      variant="prompt"
      class="kvass-sorting__wrapper"
      :title="labelsComp.title"
      :subtitle="labelsComp.subtitle"
    >
      <draggable
        :move="checkMove"
        class="kvass-sorting__draggable"
        v-model="items"
        v-bind="dragOptions"
        item-key="sorting"
      >
        <template #item="{ element }">
          <div
            :class="[
              'kvass-sorting__draggable-item',
              {
                fixed: Boolean(element.fixed),
              },
            ]"
          >
            <div class="kvass-sorting__draggable-thumbnail">
              <component
                :is="getThumbnailComponent(element.thumbnail)"
                :value="element.thumbnail"
              ></component>
            </div>
            <Flex direction="column" gap="0.25rem">
              <strong> {{ element.label }}</strong>
              <span v-if="element.tags"> {{ element.tags.join(', ') }}</span>
            </Flex>

            <div class="kvass-sorting__draggable-actions">
              <Button
                v-if="element.alternatives || element.settings"
                size="small"
                variant="secondary"
                icon-right="fa-pro-regular:sliders"
                @click="openSettings(element)"
              ></Button>

              <Button
                v-if="!element.fixed"
                class="handle"
                size="small"
                variant="secondary"
                icon="fa-pro-regular:arrows-up-down"
                :disabled="element.fixed"
              ></Button>
            </div>
          </div>
        </template>
      </draggable>

      <Alert class="k-mt-xl">
        <template #icon>
          <Icon icon="fa-pro-solid:info-circle"></Icon>
        </template>
        {{ labelsComp.alert }}
      </Alert>

      <template #actions>
        <Button
          icon-right="fa-pro-regular:xmark"
          @click="update('close')"
          :label="labelsComp.cancel"
        >
        </Button>
        <Button
          icon-right="fa-pro-regular:arrow-rotate-left"
          @click="update('reset')"
          :label="labelsComp.reset"
        >
        </Button>
        <Button
          variant="primary"
          icon-right="fa-pro-regular:arrow-right"
          @click="update('save')"
          :label="labelsComp.confirm"
        >
        </Button>
      </template>
    </Card>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-sorting {
  --k-card-background: var(--lightest-grey);

  &__draggable {
    cursor: move;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &-item {
      background-color: white;

      display: flex;
      border: 1px solid var(--k-ui-color-neutral);
      padding: 0.5rem;
      border-radius: var(--k-ui-rounding);
      gap: 0.75rem;
      align-items: center;

      &.fixed {
        cursor: not-allowed;
      }
    }
    &-thumbnail {
      --thumbnail-width: 65px;
      --thumbnail-height: 55px;
    }
    &-actions {
      margin-left: auto;
      display: flex;
      gap: 0.25rem;
    }
  }
}
</style>
