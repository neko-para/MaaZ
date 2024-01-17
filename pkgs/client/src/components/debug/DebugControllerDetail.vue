<script setup lang="ts">
import { $controller, type ControllerId } from '@maaz/maa'
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { VBtn, VCard, VChip, VDialog, VTextField } from 'vuetify/components'

import DebugCallbackDetail from '@/components/debug/DebugCallbackDetail.vue'
import { handle } from '@/model/handle'

import DebugDockerCard from './DebugDockerCard.vue'
import { dockerAddComponent } from './utils'

const props = defineProps<{
  id: ControllerId
}>()

const info = computed(() => {
  return handle.getController(props.id)
})

const loading = ref(false)

const ctrlConnected = ref<boolean>(false)
const ctrlUUID = ref<string | null>(null)

async function postConnection() {
  ctrlConnected.value = false
  ctrlUUID.value = null

  loading.value = true
  const actid = await $controller.postConnection(props.id)
  await $controller.wait(props.id, actid)
  await updateInfo()
  loading.value = false
}

function openCallback() {
  dockerAddComponent(info.value.cbid, DebugCallbackDetail)
}

async function updateInfo() {
  ctrlConnected.value = await $controller.connected(props.id)
  if (ctrlConnected.value) {
    ctrlUUID.value = await $controller.uuid(props.id)
  } else {
    ctrlUUID.value = null
  }
}

onMounted(() => {
  updateInfo()
})
</script>

<template>
  <debug-docker-card :id="id">
    <template #title> 控制器 {{ ctrlConnected ? ' - 已连接' : '' }} - {{ id }} </template>
    <template #close> <slot name="close"> </slot> </template>

    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <v-btn text="连接" @click="postConnection" :loading="loading"></v-btn>
        <v-btn text="回调" @click="openCallback"></v-btn>
        <v-btn text="刷新" @click="updateInfo" :loading="loading"></v-btn>
      </div>
      <span v-if="ctrlUUID"> UUID: {{ ctrlUUID }} </span>
    </div>
  </debug-docker-card>
</template>
