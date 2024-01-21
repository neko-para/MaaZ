<script setup lang="ts">
import type { APICallbackId } from '@maaz/maa'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { VBtn, VDataTable } from 'vuetify/components'

import { callback } from '@/model/callback'
import { handle } from '@/model/handle'

import DebugDockerCard from './DebugDockerCard.vue'
import DebugHandleSelect from './DebugHandleSelect.vue'
import { dockerAddComponent, registerUpdate, triggerUpdate, unregisterUpdate } from './utils'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    callback?: APICallbackId | null
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:callback': [APICallbackId | null]
}>()

async function dump() {
  return await callback.dump()
}

async function add() {
  const id = await callback.add()
  listen(id)
  return true
}

async function del(id: string, direct: boolean) {
  if (direct) {
    await callback.delDirect(id as APICallbackId)
  } else {
    await callback.del(id as APICallbackId)
  }
}

function alive(id: string) {
  return !!handle.getCallback(id as APICallbackId)
}

function used(id: string) {
  return Object.keys(handle.getCallback(id as APICallbackId).used).length > 0
}

function listen(id: APICallbackId) {
  callback.listen(id, async (msg, detail) => {
    console.log(msg, detail)
  })
}

function stop(id: APICallbackId) {
  callback.stop(id)
}
</script>

<template>
  <debug-handle-select
    :select-mode="selectMode"
    :handle="props.callback"
    @update:handle="h => emits('update:callback', h as APICallbackId | null)"
    type="callback"
    :dump="dump"
    :add="add"
    :del="del"
    :alive="alive"
    :used="used"
    detail-card="DebugCallbackDetail"
  >
    <template #title> 回调列表 </template>
    <template #action="{ handle: h }">
      <v-btn
        v-if="handle.getCallback(h as APICallbackId).state.running"
        variant="text"
        @click="stop(h as APICallbackId)"
      >
        断开
      </v-btn>
      <v-btn v-else variant="text" @click="listen(h as APICallbackId)"> 同步 </v-btn>
    </template>
  </debug-handle-select>
</template>
