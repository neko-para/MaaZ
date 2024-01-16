<script setup lang="ts">
import { onMounted } from 'vue'
import { VBtn, VContainer } from 'vuetify/components'

import { docker } from './docker'

const { cards, del, init } = docker

onMounted(() => {
  init()
})
</script>

<template>
  <v-container>
    <div class="flex flex-col gap-4 p-2">
      <component v-for="card in cards" :key="card.id" :is="card.component" v-bind="card.props">
        <template v-slot:close>
          <v-btn variant="text" icon="mdi-close" size="small" @click="del(card.id)"></v-btn>
        </template>
      </component>
    </div>
  </v-container>
</template>
