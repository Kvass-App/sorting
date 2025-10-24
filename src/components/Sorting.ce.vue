<script setup>
import { Button, Card, Dialog, Flex, Alert, Icon } from '@kvass/ui'
import { ref, watch, onMounted, computed } from 'vue'
import draggable from 'vuedraggable'
import Settings from './Settings/Component.vue'
import Add from './Add/Component.vue'
import Item from './Item.vue'

import { useCurrentElement } from '@vueuse/core'

const props = defineProps({
  value: String,
  mode: {
    type: String,
    enums: 'build' | 'sort',
    default: 'sort',
  },
  disableReset: {
    type: Boolean,
    default: false,
  },

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
      addAll: 'Legg til alle',
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
const fields = ref([])

const add = ref(false)
const current = ref({})

const settingsDialog = ref(null)
const element = useCurrentElement()

const labelsComp = computed(() => {
  if (typeof props.labels === 'string') {
    return JSON.parse(props.labels)
  }

  return props.labels
})

const buildMode = computed(() => {
  return props.mode === 'build'
})
function findCurrentIndex(current, items) {
  return items.findIndex((item) => item.key === current.key)
}

function openSettings(item) {
  current.value = item
  settingsDialog.value.open()
}

watch(
  () => props.config,
  (newValue, oldValue) => {
    if (!newValue) return

    let addedItems = []
    let val = JSON.parse(newValue)
    const value = JSON.parse(props.value)

    //if value sort config based on value
    if (value?.length) {
      const orderMap = new Map(value.map((item, index) => [item.key, index]))

      val.sort((a, b) => {
        return orderMap.get(a.key) - orderMap.get(b.key)
      })
    }

    fields.value = val.map((i) => {
      const index = findCurrentIndex(i, value)
      const data = value?.[index]?.data

      return {
        data: data || {},
        ...i,
        id: i.key,
      }
    })

    addedItems = value.map((i) => {
      const referenceItem = val.find(
        (v) => v.key === (i.data?.reference || i.key),
      )
      return {
        ...referenceItem,
        ...i,
      }
    })

    if (buildMode.value || value?.length) {
      // find added items if there is a value
      addedItems = value.map((i) => {
        const referenceItem = val.find(
          (v) => v.key === (i.data?.reference || i.key),
        )
        return {
          ...referenceItem,
          ...i,
        }
      })

      //filter out items that is added maximum times from the limt
      if (buildMode.value) {
        if (!value?.length) {
          addedItems = fields.value.filter((i) => {
            if (i?.limit?.min === 0) return true
            return false
          })
        }

        fields.value = fields.value.filter((item) => {
          const currentAdded = addedItems.filter((i) => i.key === item.key)
          return item.limit?.max
            ? item?.limit?.max !== currentAdded?.length
            : true
        })
      }

      items.value = addedItems
    } else {
      items.value = fields.value
    }
  },
  {
    immediate: true,
  },
)

function addUpdate(item) {
  if (item) {
    let key = item.key

    const count = items.value.filter(
      (i) => i.key === key || i?.data?.reference === key,
    )

    //filter out form fields of max
    updateFields(item, count.length)

    if (count?.length) {
      key = `${key}-${count.length}`
    }

    items.value.push({
      ...item,
      key,
      data: {
        reference: item.key,
      },
    })
  }
  add.value = false
}

function remove(item) {
  items.value = items.value.filter((i) => i.key !== item.key)
}

function updateFields(item, count) {
  if (item?.limit?.max <= count + 1) {
    fields.value = fields.value.filter((i) => i.key !== item.key)
  }
}
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
      //if no changes -> Just return empty
      if (
        !buildMode.value &&
        !props.disableReset &&
        arraysEqualByKeyInOrder(JSON.parse(props.config), items.value, 'key')
      )
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
    if (buildMode.value) {
      items.value.forEach((i) => updateFields(i, 0))
    }
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
            :label="labelsComp.cancel"
            icon-right="fa-pro-regular:xmark"
            variant="secondary"
            @click="close"
          />
          <Button
            :label="labelsComp.confirm"
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
      :title="buildMode ? 'Rediger felter' : labelsComp.title"
      :subtitle="
        buildMode
          ? 'Her kan du tilpasse rekkefølge og legge til felter for denne siden'
          : labelsComp.subtitle
      "
    >
      <draggable
        :move="checkMove"
        class="kvass-sorting__draggable"
        v-model="items"
        v-bind="dragOptions"
        item-key="sorting"
      >
        <template #item="{ element }">
          <Item :item="element">
            <template #end>
              <div class="kvass-sorting__draggable-actions">
                <Button
                  v-if="element.alternatives || element.settings"
                  size="small"
                  variant="secondary"
                  icon-right="fa-pro-regular:sliders"
                  @click="openSettings(element)"
                ></Button>
                <Button
                  v-if="buildMode && !element.fixed"
                  size="small"
                  variant="secondary"
                  icon-right="fa-pro-regular:xmark"
                  @click="remove(element)"
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
            </template>
          </Item>
        </template>
      </draggable>
      <template v-if="buildMode">
        <Add
          v-if="add"
          :items="fields"
          @update="addUpdate"
          :labels="labelsComp"
        ></Add>
        <Button
          class="kvass-sorting__draggable-add"
          label="Legg til"
          icon="fa-pro-solid:plus-circle"
          @click="add = true"
        >
        </Button>
      </template>

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
          v-if="!disableReset"
          :icon-right="`fa-pro-regular:${
            buildMode ? 'plus' : 'arrow-rotate-left'
          }`"
          @click="update('reset')"
          :label="buildMode ? labelsComp.addAll : labelsComp.reset"
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

    &-actions {
      margin-left: auto;
      display: flex;
      gap: 0.25rem;
    }

    &-add {
      --k-button-secondary-background-hover: var(--k-ui-color-neutral);
      --k-button-secondary-background: var(--k-ui-color-neutral-lightest);

      margin-top: 1rem;
      width: 100%;
      display: flex;
      padding: 1rem;
      justify-content: center;
    }
  }
}
</style>
