<script setup>
import { Button, Card, Dialog, Flex } from '@kvass/ui'
import { ref, watch, onMounted } from 'vue'
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
})

const dragOptions = {
  animation: 150,
  easing: 'cubic-bezier(1, 0, 0, 1)',
  filter: '.fixed', // Don't allow dragging of .fixed items
  preventOnFilter: false, // Allow clicking but prevent dragging
}

const items = ref([])
const current = ref({})

const dialog = ref(null)
const edit = ref(false)

const element = useCurrentElement()

function findCurrentIndex(current, items) {
  return items.findIndex((item) => item.key === current.key)
}

function openSettings(item) {
  current.value = item
  console.log(current.value)
  dialog.value.open()
}
function getThumbnailComponent(thumbnail) {
  const fallback = thumbnails.icons

  if (!thumbnail) return fallback
  if (thumbnail.startsWith('https')) return thumbnails.image
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

function reset() {
  items.value = JSON.parse(props.config)
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: [],
      bubbles: true,
      composed: true,
    }),
  )
}
const update = () => {
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: items.value.map(({ key, data }) => ({
        key,
        data,
      })),
      bubbles: true,
      composed: true,
    }),
  )
}

onMounted(() => {})
</script>

<template>
  <div :class="['kvass-sorting', { 'kvass-sorting--editing': edit }]">
    <Button
      class="kvass-sorting__trigger"
      label="Endre på rekkefølge"
      icon-right="fa-pro-regular:angle-down"
      @click="edit = !edit"
    >
    </Button>

    <Dialog
      :teleport="true"
      ref="dialog"
      :title="`Tilpasninger ${current.label}`"
      alignment="top"
    >
      <template #default>
        <Settings
          @update="update"
          class="kvass-sorting__settings"
          :value="current"
          :items="items"
        >
        </Settings>
      </template>
      <template #actions="{ close }">
        <Flex
          justify="flex-end"
          gap="xs"
          :style="{
            width: '100%',
          }"
        >
          <Button
            label="Avbryt"
            icon-right="fa-pro-regular:xmark"
            variant="secondary"
            @click="close"
          />
          <Button
            label="Bekreft"
            icon-right="fa-pro-regular:arrow-right"
            variant="primary"
            @click="close"
          />
        </Flex>
      </template>
    </Dialog>
    <div v-if="edit" class="kvass-sorting__wrapper">
      <Button
        class="kvass-sorting__reset"
        icon-right="fa-pro-regular:arrow-rotate-left"
        @click="reset"
        label="Tilbakestill"
      >
      </Button>

      <draggable
        :move="checkMove"
        @change="update"
        class="kvass-sorting__draggable"
        v-model="items"
        v-bind="dragOptions"
        item-key="sorting"
      >
        <template #item="{ element }">
          <Card
            variant="horizontal"
            :class="[
              'kvass-sorting__draggable-item',
              {
                fixed: Boolean(element.fixed),
              },
            ]"
          >
            <template #header>
              <span> {{ element.label }}</span>
            </template>

            <template #actions>
              <Button
                v-if="element.alternatives || element.settings"
                class="kvass-sorting__element-header-right"
                label="Tilpasninger"
                size="small"
                variant="secondary"
                icon-right="fa-pro-regular:sliders"
                @click="openSettings(element)"
              ></Button>

              <Button
                class="handle"
                size="small"
                variant="secondary"
                icon="fa-pro-regular:arrows-up-down"
                :disabled="element.fixed"
              ></Button>
            </template>
            <template #default>
              <component
                :is="getThumbnailComponent(element.thumbnail)"
                :value="element.thumbnail"
              ></component>
            </template>
          </Card>
        </template>
      </draggable>
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-sorting {
  &--editing {
    .kvass-sorting__trigger {
      // background-color: white;
      border-bottom: none;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;

      transform: translate(0, 1px);
    }
  }

  &__reset {
    font-size: 0.8rem;
    border: none;
    padding: 0;
    margin: 0.5rem 0;
    margin-left: auto;
    text-decoration: underline;

    &:hover {
      background-color: transparent !important;
      opacity: 0.7;
    }
  }
  &__wrapper {
    width: 300px;
    padding: 0.5rem;
    border-radius: var(--k-ui-rounding);
    border-top-left-radius: 0;

    border: 1px solid var(--k-ui-color-neutral);
    background-color: white;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__draggable {
    cursor: move;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &-item {
      &.fixed {
        background: #ccc;
        cursor: not-allowed;
      }
    }

    .k-card {
      --k-card-spacing: 0.3rem;
      background-color: var(--k-ui-color-neutral-lightest);
      --k-card-border-color: var(--k-ui-color-neutral-lightest);
      &__actions,
      &__header {
        --k-button-small-padding-inline: 6px;
        --k-button-small-padding-block: 5px;
        --k-button-small-font-size: 0.7rem;

        gap: 0.5rem;

        justify-content: center !important;
      }
      &__header {
        font-size: 0.7em;
      }

      &__content {
        padding: 0;
      }

      &--variant-horizontal {
        grid-template-areas:
          'header actions'
          'content content';

        & > .k-card__actions {
          border: none;
        }
      }
    }
  }

  &__element-header-right {
    border: none;
  }
  .handle {
    background-color: var(--k-ui-color-neutral);
  }
}
</style>
