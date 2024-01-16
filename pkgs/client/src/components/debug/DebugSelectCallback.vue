<script setup lang="ts">
import type { APICallbackId } from '@maaz/maa'
import { ref } from 'vue'
import { VBtn, VCard, VDialog } from 'vuetify/components'

import DebugCallback from './DebugCallback.vue'

const emits = defineEmits<{
  selected: [APICallbackId]
}>()

const show = ref(false)
const id = ref<APICallbackId | undefined>(undefined)

function trigger() {
  show.value = true
}

function selected() {
  show.value = false
  emits('selected', id.value!)
}

defineExpose({
  trigger
})
</script>

<template>
  <v-dialog v-model="show" class="w-2/3">
    <v-card class="flex flex-col gap-2 p-2">
      <debug-callback select-mode v-model:callback="id"></debug-callback>
      <div class="flex gap-2">
        <v-btn text="Ok" color="primary" @click="selected" :disabled="!id"></v-btn>
        <v-btn text="Cancel" @click="show = false"></v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
