<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { VBtn, VCard, VDialog, VSpacer, VTextField } from 'vuetify/components'

import DebugCallbackDetail from '@/components/debug/DebugCallbackDetail.vue'
import { handle } from '@/model/handle'
import { type MaaResourceAPI, resource } from '@/model/resource'

import { dockerAddComponent } from './utils'

const props = defineProps<{
  id: MaaResourceAPI
}>()

const info = computed(() => {
  return handle.getResource(props.id)
})

const path = ref('/Users/nekosu/Documents/Projects/MAA/MAA1999/install/resource')
const showLoad = ref(false)
const loading = ref(false)

function load() {
  showLoad.value = true
}

async function postLoad() {
  loading.value = true
  await resource.postPath(props.id, path.value)
  loading.value = false
  showLoad.value = false
}

function openCallback() {
  dockerAddComponent(info.value.cbid, DebugCallbackDetail)
}
</script>

<template>
  <v-dialog v-model="showLoad" class="w-2/3">
    <v-card class="flex flex-col gap-2 p-2">
      <div class="flex flex-col gap-2">
        <v-text-field v-model="path" label="path"></v-text-field>
        <div class="flex gap-2">
          <v-btn
            text="Ok"
            color="primary"
            @click="postLoad"
            :disabled="!path"
            :loading="loading"
          ></v-btn>
          <v-btn text="Cancel" @click="showLoad = false" :loading="loading"></v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>

  <v-card class="flex flex-col gap-2 p-2" :elevation="5">
    <div class="flex items-center">
      <span class="font-bold text-lg"> Resource - {{ id }} </span>
      <v-spacer></v-spacer>
      <slot name="close"></slot>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <v-btn text="加载" @click="load"></v-btn>
        <v-btn text="回调" @click="openCallback"></v-btn>
      </div>
    </div>
  </v-card>
</template>
