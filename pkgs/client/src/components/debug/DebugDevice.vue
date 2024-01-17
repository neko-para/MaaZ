<script setup lang="ts">
import { $device, type DeviceInfo } from '@maaz/maa'
import { onMounted, onUnmounted, ref } from 'vue'
import { VBtn } from 'vuetify/components'

import DebugDockerCard from './DebugDockerCard.vue'
import { registerUpdate, triggerUpdate, unregisterUpdate } from './utils'

const loading = ref(0)
const scanned = ref(false)
const configs = ref<DeviceInfo[]>([])

async function scan() {
  loading.value += 1
  await $device.post()
  await $device.wait()
  scanned.value = true
  await update()
  loading.value -= 1
}

async function realUpdate() {
  loading.value += 1
  if (scanned.value && (await $device.completed())) {
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
      <v-btn text="扫描" @click="scan"></v-btn>
      <v-btn text="刷新" @click="update"></v-btn>
    </div>
    {{ configs }}
  </debug-docker-card>
</template>
