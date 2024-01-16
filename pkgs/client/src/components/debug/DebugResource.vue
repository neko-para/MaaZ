<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VBtn, VCard, VDataTable } from 'vuetify/components'

import { type MaaAPICallback } from '@/model/callback'
import { handle } from '@/model/handle'
import { type MaaResourceAPI, resource } from '@/model/resource'

import DebugResourceDetail from './DebugResourceDetail.vue'
import DebugSelectCallback from './DebugSelectCallback.vue'
import { dockerAddComponent } from './utils'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    resource?: MaaResourceAPI
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:resource': [MaaResourceAPI | undefined]
}>()

const headers = computed(() => {
  return [
    {
      title: 'ID',
      key: 'id'
    },
    {
      title: 'Addr',
      key: 'pointer'
    },
    {
      title: 'Action',
      key: 'action'
    }
  ]
})
const loading = ref(0)
const items = ref<
  {
    id: MaaResourceAPI
    pointer: string
  }[]
>([])

const selectCallbackEl = ref<InstanceType<typeof DebugSelectCallback> | null>(null)

async function update() {
  loading.value += 1
  const res: {
    id: MaaResourceAPI
    pointer: string
  }[] = []
  for (const [id, v] of Object.entries(await resource.dump())) {
    res.push({
      id: id as MaaResourceAPI,
      pointer: v.pointer
    })
  }

  if (props.selectMode && props.resource && res.findIndex(x => x.id === props.resource) !== -1) {
    emits('update:resource', undefined)
  }
  items.value = res
  loading.value -= 1
}

async function add(id: MaaAPICallback) {
  loading.value += 1
  await resource.create(id)
  await update()
  loading.value -= 1
}

async function remove(id: MaaResourceAPI) {
  loading.value += 1
  await resource.destroy(id)
  await update()
  loading.value -= 1
}

async function removeDirect(id: MaaResourceAPI) {
  loading.value += 1
  await resource.destroyDirect(id)
  await update()
  loading.value -= 1
}

function detail(id: MaaResourceAPI) {
  dockerAddComponent(id, DebugResourceDetail)
}

onMounted(() => {
  update()
})
</script>

<template>
  <debug-select-callback ref="selectCallbackEl" @selected="add"></debug-select-callback>

  <v-card class="flex flex-col gap-2 p-2">
    <span class="text-lg font-bold"> MaaResource </span>
    <div class="flex gap-2">
      <v-btn text="刷新" append-icon="mdi-refresh" @click="update"></v-btn>
      <v-btn text="添加" append-icon="mdi-plus" @click="selectCallbackEl?.trigger()"></v-btn>
    </div>
    <v-data-table
      :headers="headers"
      :loading="loading > 0"
      :items="items"
      :show-select="selectMode"
      select-strategy="single"
      :model-value="props.resource ? [props.resource] : ([] as MaaResourceAPI[])"
      @update:model-value="
        v => {
          emits('update:resource', v.length > 0 ? v[0] : undefined)
        }
      "
    >
      <template v-slot:item.id="{ item }">
        <span v-if="handle.getResource(item.id)">{{ item.id }}</span>
        <span v-else class="text-red-500">{{ item.id }}</span>
      </template>

      <template v-slot:item.action="{ item }">
        <template v-if="handle.getResource(item.id)">
          <v-btn
            variant="text"
            icon="mdi-dots-horizontal"
            size="small"
            @click="detail(item.id)"
          ></v-btn>
          <v-btn variant="text" icon="mdi-close" size="small" @click="remove(item.id)"></v-btn>
        </template>
        <template v-else>
          <v-btn
            variant="text"
            icon="mdi-close"
            size="small"
            @click="removeDirect(item.id)"
          ></v-btn>
        </template>
      </template>
    </v-data-table>
  </v-card>
</template>
