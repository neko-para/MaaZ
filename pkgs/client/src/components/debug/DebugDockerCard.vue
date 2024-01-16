<script setup lang="ts">
import { VCard, VSpacer } from 'vuetify/components'
</script>

<template>
  <v-card class="flex flex-col gap-2 p-4">
    <div class="flex items-center">
      <span class="font-bold text-lg">
        <slot name="title"></slot>
      </span>
      <v-spacer></v-spacer>
      <slot name="close"></slot>
    </div>

    <slot></slot>
  </v-card>
</template>
