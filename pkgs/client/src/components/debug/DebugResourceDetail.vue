<script setup lang="ts">
import { $resource, type ResourceId } from '@maaz/maa'
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { VBtn, VCard, VChip, VDialog, VTextField } from 'vuetify/components'

import DebugCallbackDetail from '@/components/debug/DebugCallbackDetail.vue'
import { handle } from '@/model/handle'

import DebugDockerCard from './DebugDockerCard.vue'
import { dockerAddComponent } from './utils'

const props = defineProps<{
  id: ResourceId
}>()

const info = computed(() => {
  return handle.getResource(props.id)
})

const path = ref('/Users/nekosu/Documents/Projects/MAA/MAA1999/install/resource')
const showLoad = ref(false)
const loading = ref(false)

const resLoaded = ref<boolean>(false)
const resHash = ref<string | null>(null)
const resTaskList = ref<string | null>(null)

const taskList = computed(() => {
  if (resTaskList.value === null) {
    return []
  } else {
    return JSON.parse(resTaskList.value) as string[]
  }
})

function load() {
  showLoad.value = true
}

async function postLoad() {
  resLoaded.value = false
  resHash.value = null
  resTaskList.value = null

  loading.value = true
  const actid = await $resource.postPath(props.id, path.value)
  showLoad.value = false
  await $resource.wait(props.id, actid)
  await updateInfo()
  loading.value = false
}

function openCallback() {
  dockerAddComponent(info.value.cbid, DebugCallbackDetail)
}

async function updateInfo() {
  resLoaded.value = await $resource.loaded(props.id)
  if (resLoaded.value) {
    resHash.value = await $resource.getHash(props.id)
    resTaskList.value = await $resource.getTaskList(props.id)
  } else {
    resHash.value = null
    resTaskList.value = null
  }
}

onMounted(() => {
  updateInfo()
})
</script>

<template>
  <v-dialog v-model="showLoad" class="w-2/3">
    <v-card class="flex flex-col gap-2 p-2" title="选择路径">
      <div class="flex items-center gap-2 p-2">
        <v-text-field v-model="path" label="路径">
          <template #append>
            <v-btn text="Ok" color="primary" @click="postLoad" :disabled="!path"></v-btn>
          </template>
        </v-text-field>
      </div>
    </v-card>
  </v-dialog>

  <debug-docker-card :id="id">
    <template #title> 资源 {{ resLoaded ? ' - 已加载' : '' }} - {{ id }} </template>
    <template #close> <slot name="close"> </slot> </template>

    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <v-btn text="加载" @click="load"></v-btn>
        <v-btn text="回调" @click="openCallback"></v-btn>
        <v-btn text="刷新" @click="updateInfo"></v-btn>
      </div>
      <span v-if="resHash"> Hash: {{ resHash }} </span>
      <div v-if="resTaskList" class="flex gap-1 flex-wrap">
        <v-chip v-for="task in taskList" :key="task">
          {{ task }}
        </v-chip>
      </div>
    </div>
  </debug-docker-card>
</template>
