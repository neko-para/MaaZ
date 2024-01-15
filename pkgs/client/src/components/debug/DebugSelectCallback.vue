<script setup lang="ts">
import { computed, ref } from 'vue'
import { VBtn, VCard, VDialog, VSelect } from 'vuetify/components'

import { type MaaAPICallback, callback } from '@/model/callback'

const emits = defineEmits<{
  selected: [MaaAPICallback]
}>()

const show = ref(false)
const id = ref<MaaAPICallback>('' as MaaAPICallback)
const items = computed(() => {
  return Object.keys(callback.callbacks)
})

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
  <v-dialog v-model="show" class="w-1/3">
    <v-card class="flex flex-col gap-2 p-2">
      <v-select label="callback" :items="items" v-model="id"></v-select>
      <div class="flex gap-2">
        <v-btn text="Ok" color="primary" @click="selected" :disabled="!id"></v-btn>
        <v-btn text="Cancel" @click="show = false"></v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
