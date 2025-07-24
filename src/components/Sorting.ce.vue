<script setup>
import {
  Button,
  Card,
  Dialog,
  Flex,
  FormControl,
  Dropdown,
  Input,
} from '@kvass/ui'
import { computed, ref, watch, onMounted } from 'vue'
import draggable from 'vuedraggable'
import thumbnails from '../thumbnail'
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
}

const items = ref([])
const current = ref({})

const dialog = ref(null)
const element = useCurrentElement()

function openSettings(item) {
  current.value = item
  console.log(dialog.value.open())
}
function getThumbnailComponent(thumbnail) {
  const fallback = thumbnails.icons

  if (!thumbnail) return fallback
  if (thumbnail.startsWith('https')) return thumbnails.image
  if (thumbnail.includes(',')) return thumbnails.icons
  return fallback
}

const update = (value) => {
  //@ts-ignore
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: value,
      bubbles: true,
      composed: true,
    }),
  )
}

onMounted(() => {
  items.value = JSON.parse(props.config)
})
</script>

<template>
  <div class="kvass-sorting">
    <Dialog
      :teleport="true"
      ref="dialog"
      :title="`Tilpasninger ${current.label}`"
      alignment="top"
    >
      <Flex direction="column" gap="sm">
        <FormControl label="Endre datakilde">
          <Input model-value="ola@nordmann.test" />
        </FormControl>
        <FormControl v-if="current.alternatives" label="Erstatt med">
          <Dropdown label="Velg..">
            <Button
              v-for="alternativ in current.alternatives"
              variant="tertiary"
            >
              {{ alternativ }}</Button
            >
          </Dropdown>
        </FormControl>
      </Flex>

      <template #footer="{ close }">
        <Flex
          justify="flex-end"
          gap="xs"
          :style="{
            width: '100%',
          }"
        >
          <Button label="Cancel" variant="tertiary" />
          <Button label="Save" variant="primary" />
        </Flex>
      </template>
    </Dialog>

    <draggable
      class="kvass-sorting-draggable"
      v-model="items"
      v-bind="dragOptions"
      item-key="sorting"
    >
      <template #item="{ element }">
        <Card variant="horizontal">
          <template #header>
            <span> {{ element.label }}</span>
          </template>

          <template #actions>
            <Button
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
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-sorting {
  &-draggable {
    $padding: 1rem;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    cursor: move;

    .k-card {
      --k-card-spacing: 0.5rem;
      background-color: var(--k-ui-color-neutral-lightest);
      --k-card-border-color: var(--k-ui-color-neutral-lightest);
      &__actions,
      &__header {
        --k-button-small-padding-inline: 6px;
        --k-button-small-padding-block: 5px;

        gap: 0.5rem;
        font-size: 0.8em;
        justify-content: center !important;
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
