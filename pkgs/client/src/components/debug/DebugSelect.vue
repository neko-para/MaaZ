<script setup lang="ts">
import { ref } from 'vue'
import { VBtn, VCard, VDialog } from 'vuetify/components'

const emits = defineEmits<{
  selected: [string]
}>()

const show = ref(false)
const id = ref<string | null>(null)

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
      <slot
        :value="id"
        :set-value="
          (v: string | null) => {
            id = v
          }
        "
      ></slot>
      <div class="flex gap-2">
        <v-btn text="Ok" color="primary" @click="selected" :disabled="id === null"></v-btn>
        <v-btn text="Cancel" @click="show = false"></v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
