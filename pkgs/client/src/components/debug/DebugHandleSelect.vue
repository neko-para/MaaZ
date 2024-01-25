<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onUnmounted } from 'vue'
import { VBtn, VDataTable } from 'vuetify/components'

import type { DockerComponent } from '@/model/docker'

import DebugDockerCard from './DebugDockerCard.vue'
import { dockerAddComponent, registerUpdate, triggerUpdate, unregisterUpdate } from './utils'

const props = defineProps<{
  selectMode?: boolean
  handle?: string | null
  type: string

  dump: () => Promise<string[]>
  add: () => Promise<string | null>
  del: (id: string, direct: boolean) => Promise<void>
  alive: (id: string) => boolean
  used: (id: string) => boolean
  detailCard: DockerComponent
}>()

const emits = defineEmits<{
  'update:handle': [string | null]
}>()

const headers = computed(() => {
  return [
    {
      title: 'ID',
      key: 'id'
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
    id: string
  }[]
>([])

async function realUpdate() {
  loading.value += 1
  const handles: {
    id: string
  }[] = []
  for (const id of await props.dump()) {
    handles.push({
      id: id
    })
  }

  if (props.selectMode && props.handle && handles.findIndex(x => x.id === props.handle) !== -1) {
    emits('update:handle', null)
  }
  items.value = handles
  loading.value -= 1
}

function update() {
  return triggerUpdate(props.type)
}

async function doAdd() {
  loading.value += 1
  if (await props.add()) {
    await update()
  }
  loading.value -= 1
}

async function doDel(id: string) {
  loading.value += 1
  await props.del(id, false)
  await update()
  loading.value -= 1
}

async function doDelDirect(id: string) {
  loading.value += 1
  await props.del(id, true)
  await update()
  loading.value -= 1
}

function detail(id: string) {
  dockerAddComponent(id, props.detailCard)
}

onMounted(() => {
  registerUpdate(props.type, realUpdate)
  update()
})

onUnmounted(() => {
  unregisterUpdate(props.type, realUpdate)
})
</script>

<template>
  <debug-docker-card :id="`#${type}`" :closable="false" class="bg-blue-200">
    <template #title> <slot name="title"></slot> </template>

    <div class="flex gap-2">
      <v-btn text="刷新" @click="update"></v-btn>
      <v-btn text="添加" @click="doAdd"></v-btn>
    </div>
    <v-data-table
      class="bg-white bg-opacity-50"
      :headers="headers"
      :loading="loading > 0"
      :items="items"
      density="compact"
      :show-select="selectMode"
      select-strategy="single"
      :model-value="props.handle ? [props.handle] : []"
      @update:model-value="
        v => {
          emits('update:handle', v.length > 0 ? v[0] : null)
        }
      "
    >
      <template v-slot:item.id="{ item }">
        <v-btn variant="text" @click="detail(item.id)" :disabled="!alive(item.id)">
          {{ item.id }}
        </v-btn>
      </template>
      <template v-slot:item.action="{ item }">
        <template v-if="alive(item.id)">
          <slot name="action" :handle="item.id"></slot>
          <v-btn variant="text" @click="doDel(item.id)" :disabled="used(item.id)"> 删除 </v-btn>
        </template>
        <template v-else>
          <v-btn variant="text" @click="doDelDirect(item.id)"> 移除 </v-btn>
        </template>
      </template>
    </v-data-table>
  </debug-docker-card>
</template>
