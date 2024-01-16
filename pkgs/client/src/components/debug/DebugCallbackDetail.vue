<script setup lang="ts">
import type { APICallbackId } from '@maaz/maa'
import { computed } from 'vue'
import { VCard, VDataTable, VSpacer } from 'vuetify/components'

import { handle } from '@/model/handle'

import DebugDockerCard from './DebugDockerCard.vue'

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
  <debug-docker-card :id="id">
    <template #title> 回调 - {{ id }} </template>
    <template #close> <slot name="close"> </slot> </template>

    <v-data-table :headers="headers" :items="info.log">
      <template v-slot:item.arg_msg="{ value }">
        <span> {{ value.msg }} </span>
      </template>
      <template v-slot:item.arg_detail="{ value }">
        <span> {{ value.detail }} </span>
      </template>
    </v-data-table>
  </debug-docker-card>
</template>
