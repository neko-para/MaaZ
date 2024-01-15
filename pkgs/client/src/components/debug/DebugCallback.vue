<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VBtn, VCard, VDataTable } from 'vuetify/components'

import { type MaaAPICallback, callback } from '@/model/callback'
import { handle } from '@/model/handle'

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
    id: MaaAPICallback
  }[]
>([])

async function update() {
  loading.value += 1
  const res: {
    id: MaaAPICallback
  }[] = []
  for (const id of await callback.dump()) {
    res.push({
      id: id as MaaAPICallback
    })
  }
  items.value = res
  loading.value -= 1
}

async function add() {
  loading.value += 1
  const id = await callback.add()
  callback.listen(id, async (msg, detail) => {
    console.log(msg, detail)
  })
  await update()
  loading.value -= 1
}

async function remove(id: MaaAPICallback) {
  loading.value += 1
  await callback.del(id)
  await update()
  loading.value -= 1
}

async function removeDirect(id: MaaAPICallback) {
  loading.value += 1
  await callback.delDirect(id)
  await update()
  loading.value -= 1
}

onMounted(() => {
  update()
})
</script>

<template>
  <v-card class="flex flex-col gap-2 p-2">
    <span class="text-lg font-bold"> MaaAPICallback </span>
    <div class="flex gap-2">
      <v-btn text="刷新" append-icon="mdi-refresh" @click="update"></v-btn>
      <v-btn text="添加" append-icon="mdi-plus" @click="add"></v-btn>
    </div>
    <v-data-table :headers="headers" :loading="loading > 0" :items="items">
      <template v-slot:item.id="{ item }">
        <span v-if="handle.getCallback(item.id)">{{ item.id }}</span>
        <span v-else class="text-red-500">{{ item.id }}</span>
      </template>
      <template v-slot:item.action="{ item }">
        <template v-if="handle.getCallback(item.id)">
          <v-btn
            variant="text"
            icon="mdi-close"
            size="small"
            :disabled="handle.getCallback(item.id).used.size > 0"
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
