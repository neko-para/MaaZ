<script setup lang="ts">
import { type APICallbackId, type AdbConfig, type ControllerId } from '@maaz/maa'
import { computed, onMounted, ref } from 'vue'
import { onUnmounted } from 'vue'
import {
  VBtn,
  VCard,
  VDataTable,
  VDialog,
  VRadio,
  VRadioGroup,
  VTab,
  VTabs,
  VTextField
} from 'vuetify/components'

import { globalConfig } from '@/model/config'
import { controller } from '@/model/controller'
import { handle } from '@/model/handle'

import DebugCallback from './DebugCallback.vue'
import DebugControllerDetail from './DebugControllerDetail.vue'
import DebugDevice from './DebugDevice.vue'
import DebugDockerCard from './DebugDockerCard.vue'
import DebugSelect from './DebugSelect.vue'
import { dockerAddComponent, registerUpdate, triggerUpdate, unregisterUpdate } from './utils'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    controller?: ControllerId
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:controller': [ControllerId | undefined]
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
    id: ControllerId
    pointer: string
  }[]
>([])

const showCreate = ref(false)
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
    cfg.config &&
    createAgentPath.value &&
    createCallback.value
  )
})

const selectCallbackEl = ref<InstanceType<typeof DebugSelect> | null>(null)
const selectDeviceEl = ref<InstanceType<typeof DebugSelect> | null>(null)

async function realUpdate() {
  loading.value += 1
  const res: {
    id: ControllerId
    pointer: string
  }[] = []
  for (const [id, v] of Object.entries(await controller.dump())) {
    res.push({
      id: id as ControllerId,
      pointer: v.pointer
    })
  }

  if (
    props.selectMode &&
    props.controller &&
    res.findIndex(x => x.id === props.controller) !== -1
  ) {
    emits('update:controller', undefined)
  }
  items.value = res
  loading.value -= 1
}

function update() {
  return triggerUpdate('controller')
}

async function add() {
  showCreate.value = false
  loading.value += 1
  await controller.createAdb(createConfig.value as AdbConfig, createCallback.value!)
  await update()
  loading.value -= 1
}

async function remove(id: ControllerId) {
  loading.value += 1
  await controller.destroy(id)
  await update()
  loading.value -= 1
}

async function removeDirect(id: ControllerId) {
  loading.value += 1
  await controller.destroyDirect(id)
  await update()
  loading.value -= 1
}

function detail(id: ControllerId) {
  dockerAddComponent(id, 'DebugControllerDetail')
}

onMounted(() => {
  registerUpdate('controller', realUpdate)
  update()
})

onUnmounted(() => {
  unregisterUpdate('controller', realUpdate)
})
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

  <v-dialog v-model="showCreate" class="w-2/3">
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
        <v-btn text="确认" color="primary" @click="add" :disabled="!createParamProvided"></v-btn>
        <v-btn text="取消" @click="showCreate = false"></v-btn>
      </div>
    </v-card>
  </v-dialog>

  <debug-docker-card id="#controller" :closable="false" class="bg-blue-200">
    <template #title> 控制器列表 </template>

    <div class="flex gap-2">
      <v-btn text="刷新" @click="update"></v-btn>
      <v-btn text="添加" @click="showCreate = true"></v-btn>
    </div>
    <v-data-table
      class="bg-white bg-opacity-50"
      :headers="headers"
      :loading="loading > 0"
      :items="items"
      :show-select="selectMode"
      select-strategy="single"
      :model-value="props.controller ? [props.controller] : ([] as ControllerId[])"
      @update:model-value="
        v => {
          emits('update:controller', v.length > 0 ? v[0] : undefined)
        }
      "
    >
      <template v-slot:item.id="{ item }">
        <span v-if="handle.getController(item.id)">{{ item.id }}</span>
        <span v-else class="text-red-500">{{ item.id }}</span>
      </template>

      <template v-slot:item.action="{ item }">
        <template v-if="handle.getController(item.id)">
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
