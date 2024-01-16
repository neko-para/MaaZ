<script setup lang="ts">
import type { APICallbackId } from '@maaz/maa'
import { computed } from 'vue'
import { VCard, VDataTable, VSpacer } from 'vuetify/components'

import { handle } from '@/model/handle'

const props = defineProps<{
  id: APICallbackId
}>()

const headers = computed(() => {
  return [
    {
      title: 'CID',
      key: 'cid'
    },
    {
      title: 'Msg',
      key: 'arg_msg',
      value: 'arg'
    },
    {
      title: 'Detail',
      key: 'arg_detail',
      value: 'arg'
    }
  ]
})

const info = computed(() => {
  return handle.getCallback(props.id)
})
</script>

<template>
  <v-card class="flex flex-col gap-2 p-2" :elevation="5">
    <div class="flex items-center">
      <span class="font-bold text-lg"> Callback - {{ id }} </span>
      <v-spacer></v-spacer>
      <slot name="close"></slot>
    </div>
    <v-data-table :headers="headers" :items="info.log">
      <template v-slot:item.arg_msg="{ value }">
        <span> {{ value.msg }} </span>
      </template>
      <template v-slot:item.arg_detail="{ value }">
        <span> {{ value.detail }} </span>
      </template>
    </v-data-table>
  </v-card>
</template>
