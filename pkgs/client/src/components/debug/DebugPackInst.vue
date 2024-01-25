<script setup lang="ts">
import type { APICallbackId, ResourceId } from '@maaz/maa'
import { onMounted, ref } from 'vue'
import { VBtn, VCard, VDialog } from 'vuetify/components'

import { handle } from '@/model/handle'
import { packinst } from '@/model/packinst'
import { resource } from '@/model/resource'

import DebugCallback from './DebugCallback.vue'
import DebugHandleSelect from './DebugHandleSelect.vue'
import DebugSelect from './DebugSelect.vue'
import { service } from './service'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    packinst?: string | null
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:packinst': [string | null]
}>()

async function dump() {
  return Object.keys(packinst.packinsts)
}

async function del(id: string, direct: boolean) {
  packinst.destroy(id)
}

function alive(id: string) {
  return !!handle.getPackInst(id)
}

function used(id: string) {
  return Object.keys(handle.getPackInst(id).used).length > 0
}
</script>

<template>
  <debug-handle-select
    :select-mode="selectMode"
    :handle="props.packinst"
    @update:handle="h => emits('update:packinst', h as string | null)"
    type="packinst"
    :dump="dump"
    :del="del"
    :alive="alive"
    :used="used"
    detail-card="DebugPackInstDetail"
  >
    <template #title> 资源实例列表 </template>
  </debug-handle-select>
</template>
