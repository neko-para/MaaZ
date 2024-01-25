<script setup lang="ts">
import { $resource, type ResourceId } from '@maaz/maa'
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { VBtn, VCard, VChip, VDialog, VTextField } from 'vuetify/components'

import { handle } from '@/model/handle'

import DebugDockerCard from './DebugDockerCard.vue'
import { dockerAddComponent } from './utils'

const props = defineProps<{
  id: string
}>()

const info = computed(() => {
  return handle.getPackInst(props.id)
})

function openInstance() {
  dockerAddComponent(info.value.instid, 'DebugInstanceDetail')
}
</script>

<template>
  <debug-docker-card :id="id">
    <template #title> 资源包实例 - {{ id }} </template>
    <template #close> <slot name="close"> </slot> </template>

    <div v-if="info" class="flex flex-col gap-2">
      <div class="flex gap-2">
        <v-btn @click="openInstance"> Inst: {{ info.instid }} </v-btn>
      </div>
    </div>
  </debug-docker-card>
</template>
