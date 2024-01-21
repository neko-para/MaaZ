<script setup lang="ts">
import { VContainer } from 'vuetify/components'

import { docker, dockerComponentIndex } from '@/model/docker'

const { cards } = docker
</script>

<template>
  <v-container>
    <div class="flex flex-col gap-4 p-2">
      <component
        v-for="card in cards"
        :key="card.id"
        :is="dockerComponentIndex[card.component]"
        v-bind="card.props"
      >
      </component>
    </div>
  </v-container>
</template>
../../model/docker
