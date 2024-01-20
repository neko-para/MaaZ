<script setup lang="ts">
import type { APICallbackId, ResourceId } from '@maaz/maa'
import { computed, onMounted, ref } from 'vue'
import { onUnmounted } from 'vue'
import { VBtn, VDataTable } from 'vuetify/components'

import { handle } from '@/model/handle'
import { resource } from '@/model/resource'

import DebugCallback from './DebugCallback.vue'
import DebugDockerCard from './DebugDockerCard.vue'
import DebugSelect from './DebugSelect.vue'
import { dockerAddComponent, registerUpdate, triggerUpdate, unregisterUpdate } from './utils'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    resource?: ResourceId
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:resource': [ResourceId | undefined]
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
    id: ResourceId
    pointer: string
  }[]
>([])

const selectCallbackEl = ref<InstanceType<typeof DebugSelect> | null>(null)

async function realUpdate() {
  loading.value += 1
  const res: {
    id: ResourceId
    pointer: string
  }[] = []
  for (const [id, v] of Object.entries(await resource.dump())) {
    res.push({
      id: id as ResourceId,
      pointer: v.pointer
    })
  }

  if (props.selectMode && props.resource && res.findIndex(x => x.id === props.resource) !== -1) {
    emits('update:resource', undefined)
  }
  items.value = res
  loading.value -= 1
}

function update() {
  return triggerUpdate('resource')
}

async function add(id: APICallbackId) {
  loading.value += 1
  await resource.create(id)
  await update()
  loading.value -= 1
}

async function remove(id: ResourceId) {
  loading.value += 1
  await resource.destroy(id)
  await update()
  loading.value -= 1
}

async function removeDirect(id: ResourceId) {
  loading.value += 1
  await resource.destroyDirect(id)
  await update()
  loading.value -= 1
}

function detail(id: ResourceId) {
  dockerAddComponent(id, 'DebugResourceDetail')
}

onMounted(() => {
  registerUpdate('resource', realUpdate)
  update()
})

onUnmounted(() => {
  unregisterUpdate('resource', realUpdate)
})
</script>

<template>
  <debug-select
    ref="selectCallbackEl"
    v-slot="{ value, setValue }"
    @selected="id => add(id as APICallbackId)"
  >
    <debug-callback
      select-mode
      :callback="value as APICallbackId | null"
      @update:callback="setValue"
    ></debug-callback>
  </debug-select>

  <debug-docker-card id="#resource" :closable="false" class="bg-blue-200">
    <template #title> 资源列表 </template>

    <div class="flex gap-2">
      <v-btn text="刷新" @click="update"></v-btn>
      <v-btn text="添加" @click="selectCallbackEl?.trigger()"></v-btn>
    </div>
    <v-data-table
      class="bg-white bg-opacity-50"
      :headers="headers"
      :loading="loading > 0"
      :items="items"
      :show-select="selectMode"
      select-strategy="single"
      :model-value="props.resource ? [props.resource] : ([] as ResourceId[])"
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
          <v-btn
            variant="text"
            icon="mdi-close"
            size="small"
            @click="remove(item.id)"
            :disabled="Object.keys(handle.getResource(item.id).used).length > 0"
          ></v-btn>
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
  </debug-docker-card>
</template>
