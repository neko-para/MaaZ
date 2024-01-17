<script setup lang="ts">
import { ref } from 'vue'
import { VCard, VDialog } from 'vuetify/components'

const show = ref(false)
const code = ref('')

function showCode(c: string) {
  code.value = JSON.stringify(JSON.parse(c), null, 2)
  show.value = true
}

defineExpose({ showCode })
</script>

<template>
  <v-dialog class="w-2/3" v-model="show">
    <v-card class="p-2">
      <highlightjs language="json" :code="code"></highlightjs>
    </v-card>
  </v-dialog>
</template>
