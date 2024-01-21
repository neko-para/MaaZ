<script setup lang="ts">
import type { APICallbackId, ResourceId } from '@maaz/maa'
import { ref } from 'vue'
import { VBtn, VCard, VDialog } from 'vuetify/components'

import { handle } from '@/model/handle'
import { resource } from '@/model/resource'

import DebugCallback from './DebugCallback.vue'
import DebugHandleSelect from './DebugHandleSelect.vue'
import DebugSelect from './DebugSelect.vue'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    resource?: ResourceId | null
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:resource': [ResourceId | null]
}>()

const showCreate = ref(false)
let createResolve: (done: boolean) => void = () => {}
const createCallback = ref<APICallbackId | null>(null)

const selectCallbackEl = ref<InstanceType<typeof DebugSelect> | null>(null)

async function dump() {
  return Object.keys(await resource.dump())
}

async function add() {
  showCreate.value = true
  return new Promise<boolean>(resolve => {
    createResolve = resolve
  })
}

async function create() {
  showCreate.value = false
  await resource.create(createCallback.value!)
  createResolve(true)
}

function cancelCreate() {
  showCreate.value = false
  createResolve(false)
}

async function del(id: string, direct: boolean) {
  if (direct) {
    await resource.destroyDirect(id as ResourceId)
  } else {
    await resource.destroy(id as ResourceId)
  }
}

function alive(id: string) {
  return !!handle.getResource(id as ResourceId)
}

function used(id: string) {
  return Object.keys(handle.getResource(id as ResourceId).used).length > 0
}
</script>

<template>
  <debug-select
    ref="selectCallbackEl"
    v-slot="{ value, setValue }"
    @selected="id => (createCallback = id)"
  >
    <debug-callback select-mode :callback="value" @update:callback="setValue"></debug-callback>
  </debug-select>

  <v-dialog :model-value="showCreate" class="w-2/3" @update:model-value="cancelCreate">
    <v-card class="flex flex-col gap-2 p-4">
      <div class="maa-simple-form p-4">
        <span> 回调 </span>
        <div class="flex items-center gap-2">
          <v-btn @click="selectCallbackEl?.trigger()"> 选择回调 </v-btn>
          <span> {{ createCallback }} </span>
        </div>
      </div>
      <div class="flex gap-2">
        <v-btn text="确认" color="primary" @click="create" :disabled="!createCallback"></v-btn>
        <v-btn text="取消" @click="cancelCreate"></v-btn>
      </div>
    </v-card>
  </v-dialog>

  <debug-handle-select
    :select-mode="selectMode"
    :handle="props.resource"
    @update:handle="h => emits('update:resource', h as ResourceId | null)"
    type="resource"
    :dump="dump"
    :add="add"
    :del="del"
    :alive="alive"
    :used="used"
    detail-card="DebugResourceDetail"
  >
    <template #title> 资源列表 </template>
  </debug-handle-select>
</template>
