<script setup lang="ts">
import { VBtn, VCard, VSpacer } from 'vuetify/components'

import { docker } from '@/model/docker'

withDefaults(
  defineProps<{
    id: string
    closable?: boolean
  }>(),
  {
    closable: true
  }
)

const emits = defineEmits<{
  close: []
  moveup: []
}>()
</script>

<template>
  <v-card class="flex flex-col gap-2 p-4">
    <div class="flex items-center">
      <span class="font-bold text-lg">
        <slot name="title"></slot>
      </span>
      <v-spacer></v-spacer>
      <v-btn variant="text" icon="mdi-arrow-up" size="small" @click="docker.moveup(id)"></v-btn>
      <v-btn
        v-if="closable"
        variant="text"
        icon="mdi-close"
        size="small"
        @click="docker.del(id)"
      ></v-btn>
    </div>

    <slot></slot>
  </v-card>
</template>
