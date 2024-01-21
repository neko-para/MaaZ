<script setup lang="ts">
import { type APICallbackId, type AdbConfig, type ControllerId } from '@maaz/maa'
import { computed, ref } from 'vue'
import { VBtn, VCard, VDialog, VTab, VTabs, VTextField } from 'vuetify/components'

import { globalConfig } from '@/model/config'
import { controller } from '@/model/controller'
import { handle } from '@/model/handle'

import DebugCallback from './DebugCallback.vue'
import DebugDevice from './DebugDevice.vue'
import DebugHandleSelect from './DebugHandleSelect.vue'
import DebugSelect from './DebugSelect.vue'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    controller?: ControllerId | null
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:controller': [ControllerId | null]
}>()

const showCreate = ref(false)
let createResolve: (done: boolean) => void = () => {}
const createType = ref<'adb'>('adb')
const createConfig = ref<Partial<AdbConfig>>({})
const createAgentPath = computed({
  get() {
    return globalConfig.config.agent_path ?? ''
  },
  set(v: string) {
    globalConfig.config.agent_path = v
  }
})
const createCallback = ref<APICallbackId | null>(null)

const createParamProvided = computed(() => {
  const cfg = createConfig.value
  return !!(
    cfg.adb_path &&
    cfg.address &&
    cfg.type &&
    createAgentPath.value &&
    createCallback.value
  )
})

const selectCallbackEl = ref<InstanceType<typeof DebugSelect> | null>(null)
const selectDeviceEl = ref<InstanceType<typeof DebugSelect> | null>(null)

async function dump() {
  return Object.keys(await controller.dump())
}

async function add() {
  showCreate.value = true
  return new Promise<boolean>(resolve => {
    createResolve = resolve
  })
}

async function create() {
  showCreate.value = false
  await controller.createAdb(
    {
      config: '{}',
      ...(createConfig.value as Omit<AdbConfig, 'config'>)
    },
    createCallback.value!
  )
  createResolve(true)
}

function cancelCreate() {
  showCreate.value = false
  createResolve(false)
}

async function del(id: string, direct: boolean) {
  if (direct) {
    await controller.destroyDirect(id as ControllerId)
  } else {
    await controller.destroy(id as ControllerId)
  }
}

function alive(id: string) {
  return !!handle.getController(id as ControllerId)
}

function used(id: string) {
  return Object.keys(handle.getController(id as ControllerId).used).length > 0
}
</script>

<template>
  <debug-select
    ref="selectCallbackEl"
    v-slot="{ value, setValue }"
    @selected="
      id => {
        createCallback = id
      }
    "
  >
    <debug-callback select-mode :callback="value" @update:callback="setValue"></debug-callback>
  </debug-select>

  <debug-select
    ref="selectDeviceEl"
    v-slot="{ value, setValue }"
    @selected="
      cfg => {
        createConfig = cfg as Partial<AdbConfig>
      }
    "
  >
    <debug-device select-mode :config="value" @update:config="setValue"></debug-device>
  </debug-select>

  <v-dialog v-model="showCreate" @update:model-value="cancelCreate" class="w-2/3">
    <v-card class="flex flex-col gap-2 p-4">
      <v-tabs v-model="createType" density="compact">
        <v-tab value="adb">Adb</v-tab>
        <v-tab value="win">Win</v-tab>
      </v-tabs>
      <div class="maa-simple-form p-4">
        <template v-if="createType === 'adb'">
          <span> 连接 </span>
          <div>
            <v-btn @click="selectDeviceEl?.trigger()"> 配置连接 </v-btn>
          </div>
          <span> Agent </span>
          <div>
            <v-text-field
              v-model="createAgentPath"
              label="agent"
              hide-details
              density="compact"
            ></v-text-field>
          </div>
        </template>
        <span> 回调 </span>
        <div class="flex items-center gap-2">
          <v-btn @click="selectCallbackEl?.trigger()">选择回调</v-btn>
          <span> {{ createCallback }} </span>
        </div>
      </div>
      <div class="flex gap-2">
        <v-btn text="确认" color="primary" @click="create" :disabled="!createParamProvided"></v-btn>
        <v-btn text="取消" @click="cancelCreate"></v-btn>
      </div>
    </v-card>
  </v-dialog>

  <debug-handle-select
    :select-mode="selectMode"
    :handle="props.controller"
    @update:handle="h => emits('update:controller', h as ControllerId | null)"
    type="controller"
    :dump="dump"
    :add="add"
    :del="del"
    :alive="alive"
    :used="used"
    detail-card="DebugControllerDetail"
  >
    <template #title> 控制器列表 </template>
  </debug-handle-select>
</template>
