<script setup lang="ts">
import type { APICallbackId } from '@maaz/maa'
import { computed, onMounted, ref } from 'vue'
import { VBtn, VCard, VDataTable } from 'vuetify/components'

import { callback } from '@/model/callback'
import { handle } from '@/model/handle'

import DebugCallbackDetail from './DebugCallbackDetail.vue'
import { dockerAddComponent } from './utils'

const props = withDefaults(
  defineProps<{
    selectMode?: boolean
    callback?: APICallbackId
  }>(),
  {
    selectMode: false
  }
)

const emits = defineEmits<{
  'update:callback': [APICallbackId | undefined]
}>()

const headers = computed(() => {
  return [
    {
      title: 'ID',
      key: 'id'
    },
    {
      title: 'Action',
      key: 'action'
    }
  ]
})

const loading = ref(0)
const items = ref<
  {
    id: APICallbackId
  }[]
>([])

async function update() {
  loading.value += 1
  const res: {
    id: APICallbackId
  }[] = []
  for (const id of await callback.dump()) {
    res.push({
      id: id as APICallbackId
    })
  }
  if (props.selectMode && props.callback && !(props.callback in res)) {
    emits('update:callback', undefined)
  }
  items.value = res
  loading.value -= 1
}

async function add() {
  loading.value += 1
  const id = await callback.add()
  listen(id)
  await update()
  loading.value -= 1
}

async function remove(id: APICallbackId) {
  loading.value += 1
  await callback.del(id)
  await update()
  loading.value -= 1
}

async function removeDirect(id: APICallbackId) {
  loading.value += 1
  await callback.delDirect(id)
  await update()
  loading.value -= 1
}

function listen(id: APICallbackId) {
  callback.listen(id, async (msg, detail) => {
    console.log(msg, detail)
  })
}

function stop(id: APICallbackId) {
  callback.stop(id)
}

function detail(id: APICallbackId) {
  dockerAddComponent(id, DebugCallbackDetail)
}

onMounted(() => {
  update()
})
</script>

<template>
  <v-card class="flex flex-col gap-2 p-2">
    <span class="text-lg font-bold"> APICallbackId </span>
    <div class="flex gap-2">
      <v-btn text="刷新" append-icon="mdi-refresh" @click="update"></v-btn>
      <v-btn text="添加" append-icon="mdi-plus" @click="add"></v-btn>
    </div>
    <v-data-table
      :headers="headers"
      :loading="loading > 0"
      :items="items"
      :show-select="selectMode"
      select-strategy="single"
      :model-value="props.callback ? [props.callback] : ([] as APICallbackId[])"
      @update:model-value="
        v => {
          emits('update:callback', v.length > 0 ? v[0] : undefined)
        }
      "
    >
      <template v-slot:item.id="{ item }">
        <span v-if="handle.getCallback(item.id)">{{ item.id }}</span>
        <span v-else class="text-red-500">{{ item.id }}</span>
      </template>
      <template v-slot:item.action="{ item }">
        <template v-if="handle.getCallback(item.id)">
          <v-btn
            variant="text"
            icon="mdi-dots-horizontal"
            size="small"
            @click="detail(item.id)"
          ></v-btn>
          <v-btn
            v-if="handle.getCallback(item.id).state.running"
            variant="text"
            icon="mdi-sync"
            size="small"
            @click="stop(item.id)"
          ></v-btn>
          <v-btn
            v-else
            variant="text"
            icon="mdi-sync-off"
            size="small"
            @click="listen(item.id)"
          ></v-btn>
          <v-btn
            variant="text"
            icon="mdi-close"
            size="small"
            :disabled="Object.keys(handle.getCallback(item.id).used).length > 0"
            @click="remove(item.id)"
          ></v-btn>
        </template>
        <template v-else>
          <v-btn
            variant="text"
            icon="mdi-close"
            size="small"
            @click="removeDirect(item.id)"
          ></v-btn>
        </template>
      </template>
    </v-data-table>
  </v-card>
</template>
