<script setup lang="ts">
import type { APICallbackId, InstanceId } from '@maaz/maa'
import { onMounted, ref } from 'vue'
import { VBtn, VCard, VDialog } from 'vuetify/components'

import { handle } from '@/model/handle'
import { instance } from '@/model/instance'

import DebugCallback from './DebugCallback.vue'
import DebugHandleSelect from './DebugHandleSelect.vue'
import DebugSelect from './DebugSelect.vue'
import { service } from './service'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    instance?: InstanceId | null
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:instance': [InstanceId | null]
}>()

const showCreate = ref(false)
let createResolve: (done: InstanceId | null) => void = () => {}
const createCallback = ref<APICallbackId | null>(null)

const selectCallbackEl = ref<InstanceType<typeof DebugSelect> | null>(null)

async function dump() {
  return Object.keys(await instance.dump())
}

async function add() {
  showCreate.value = true
  return new Promise<InstanceId | null>(resolve => {
    createResolve = resolve
  })
}

async function create() {
  showCreate.value = false
  const id = await instance.create(createCallback.value!)
  createResolve(id)
}

function cancelCreate() {
  showCreate.value = false
  createResolve(null)
}

async function del(id: string, direct: boolean) {
  if (direct) {
    await instance.destroyDirect(id as InstanceId)
  } else {
    await instance.destroy(id as InstanceId)
  }
}

function alive(id: string) {
  return !!handle.getInstance(id as InstanceId)
}

function used(id: string) {
  return Object.keys(handle.getInstance(id as InstanceId).used).length > 0
}

onMounted(() => {
  service['#instance'] = {
    create: add
  }
})
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
    :handle="props.instance"
    @update:handle="h => emits('update:instance', h as InstanceId | null)"
    type="instance"
    :dump="dump"
    :add="add"
    :del="del"
    :alive="alive"
    :used="used"
    detail-card="DebugInstanceDetail"
  >
    <template #title> 实例列表 </template>
  </debug-handle-select>
</template>
