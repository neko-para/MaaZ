<script setup lang="ts">
import type { APICallbackId, InstanceId } from '@maaz/maa'
import { computed, onMounted, ref } from 'vue'
import { onUnmounted } from 'vue'
import { VBtn, VDataTable } from 'vuetify/components'

import { handle } from '@/model/handle'
import { instance } from '@/model/instance'

import DebugCallback from './DebugCallback.vue'
import DebugDockerCard from './DebugDockerCard.vue'
import DebugSelect from './DebugSelect.vue'
import { dockerAddComponent, registerUpdate, triggerUpdate, unregisterUpdate } from './utils'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    instance?: InstanceId
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:instance': [InstanceId | undefined]
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
    id: InstanceId
    pointer: string
  }[]
>([])

const selectCallbackEl = ref<InstanceType<typeof DebugSelect> | null>(null)

async function realUpdate() {
  loading.value += 1
  const res: {
    id: InstanceId
    pointer: string
  }[] = []
  for (const [id, v] of Object.entries(await instance.dump())) {
    res.push({
      id: id as InstanceId,
      pointer: v.pointer
    })
  }

  if (props.selectMode && props.instance && res.findIndex(x => x.id === props.instance) !== -1) {
    emits('update:instance', undefined)
  }
  items.value = res
  loading.value -= 1
}

function update() {
  return triggerUpdate('instance')
}

async function add(id: APICallbackId) {
  loading.value += 1
  await instance.create(id)
  await update()
  loading.value -= 1
}

async function remove(id: InstanceId) {
  loading.value += 1
  await instance.destroy(id)
  await update()
  loading.value -= 1
}

async function removeDirect(id: InstanceId) {
  loading.value += 1
  await instance.destroyDirect(id)
  await update()
  loading.value -= 1
}

function detail(id: InstanceId) {
  dockerAddComponent(id, 'DebugInstanceDetail')
}

onMounted(() => {
  registerUpdate('instance', realUpdate)
  update()
})

onUnmounted(() => {
  unregisterUpdate('instance', realUpdate)
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

  <debug-docker-card id="#instance" :closable="false" class="bg-blue-200">
    <template #title> 实例列表 </template>

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
      :model-value="props.instance ? [props.instance] : ([] as InstanceId[])"
      @update:model-value="
        v => {
          emits('update:instance', v.length > 0 ? v[0] : undefined)
        }
      "
    >
      <template v-slot:item.id="{ item }">
        <span v-if="handle.getInstance(item.id)">{{ item.id }}</span>
        <span v-else class="text-red-500">{{ item.id }}</span>
      </template>

      <template v-slot:item.action="{ item }">
        <template v-if="handle.getInstance(item.id)">
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
  </debug-docker-card>
</template>
