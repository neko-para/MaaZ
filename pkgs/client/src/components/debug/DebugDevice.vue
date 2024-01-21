<script setup lang="ts">
import { $device, type AdbConfig, type DeviceInfo } from '@maaz/maa'
import { onMounted, onUnmounted, ref } from 'vue'
import { VBtn, VExpansionPanel, VExpansionPanels, VTextField, VTextarea } from 'vuetify/components'

import DebugAdbType from './DebugAdbType.vue'
import DebugDockerCard from './DebugDockerCard.vue'
import DebugViewEditJson from './DebugViewEditJson.vue'
import { registerUpdate, triggerUpdate, unregisterUpdate } from './utils'

withDefaults(
  defineProps<{
    selectMode?: boolean
    config?: Partial<AdbConfig>
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:config': [Partial<AdbConfig>]
}>()

const loading = ref(0)
const configs = ref<DeviceInfo[]>([])

async function scan() {
  loading.value += 1
  await $device.post()
  await $device.wait()
  await update()
  loading.value -= 1
}

async function realUpdate() {
  loading.value += 1
  if (await $device.completed()) {
    const count = await $device.count()
    configs.value = []
    for (let i = 0; i < count; i++) {
      configs.value.push(await $device.get(i))
    }
  }
  loading.value -= 1
}

function update() {
  return triggerUpdate('device')
}

onMounted(() => {
  registerUpdate('device', realUpdate)
  update()
})

onUnmounted(() => {
  unregisterUpdate('device', realUpdate)
})
</script>

<template>
  <debug-docker-card id="#device" :closable="false" class="bg-blue-200">
    <template #title> 设备列表 </template>

    <div class="flex gap-2">
      <v-btn text="刷新" @click="update" :loading="loading > 0"></v-btn>
      <v-btn text="扫描" @click="scan" :loading="loading > 0"></v-btn>
    </div>
    <v-expansion-panels :multiple="!selectMode">
      <v-expansion-panel v-for="cfg in configs" :key="cfg.address">
        <template #title>
          <div class="flex items-center gap-2">
            <span> {{ cfg.name }} - {{ cfg.address }} </span>
            <v-btn v-if="selectMode" @click.stop="emits('update:config', cfg)"> 复制 </v-btn>
          </div>
        </template>
        <template #text>
          <div class="flex flex-col gap-2">
            <div class="grid items-center gap-2" style="grid-template-columns: max-content auto">
              <span> adb </span>
              <v-text-field
                :model-value="cfg.adb_path"
                readonly
                hide-details
                density="compact"
              ></v-text-field>
              <span> 类型 </span>
              <debug-adb-type :type="cfg.type" readonly></debug-adb-type>
              <span> 配置 </span>
              <debug-view-edit-json :json="cfg.config" readonly></debug-view-edit-json>
            </div>
          </div>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
    <div v-if="selectMode" class="maa-simple-form">
      <span> address </span>
      <v-text-field
        :model-value="config?.address ?? ''"
        @update:model-value="
          v => {
            emits('update:config', {
              ...(config ?? {}),
              address: v
            })
          }
        "
        label="address"
        hide-details
        density="compact"
      ></v-text-field>
      <span> adb </span>
      <v-text-field
        :model-value="config?.adb_path ?? ''"
        @update:model-value="
          v => {
            emits('update:config', {
              ...(config ?? {}),
              adb_path: v
            })
          }
        "
        label="adb path"
        hide-details
        density="compact"
      ></v-text-field>
      <span> 类型 </span>
      <debug-adb-type
        :type="config?.type ?? 0"
        @update:type="
          type => {
            emits('update:config', {
              ...(config ?? {}),
              type
            })
          }
        "
      ></debug-adb-type>
      <span> 配置 </span>
      <debug-view-edit-json
        :json="config?.config ?? '{}'"
        @update:json="
          cfg => {
            emits('update:config', {
              ...(config ?? {}),
              config: cfg
            })
          }
        "
      ></debug-view-edit-json>
    </div>
  </debug-docker-card>
</template>
