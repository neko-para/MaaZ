<script setup lang="ts">
import { ref } from 'vue'
import { VBtn, VCard, VDialog } from 'vuetify/components'

const emits = defineEmits<{
  selected: [any]
}>()

const show = ref(false)
const value = ref<any | null>(null)

function trigger() {
  show.value = true
}

function selected() {
  show.value = false
  emits('selected', value.value!)
}

defineExpose({
  trigger
})
</script>

<template>
  <v-dialog v-model="show" class="w-2/3">
    <v-card class="flex flex-col gap-2 p-2">
      <slot
        :value="value"
        :set-value="
          (v: any | null) => {
            value = v
          }
        "
      ></slot>
      <div class="flex gap-2">
        <v-btn text="Ok" color="primary" @click="selected" :disabled="value === null"></v-btn>
        <v-btn text="Cancel" @click="show = false"></v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
