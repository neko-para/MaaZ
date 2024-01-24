<script setup lang="ts">
import { ref } from 'vue'
import {
  VBtn,
  VCard,
  VDialog,
  VExpansionPanel,
  VExpansionPanels,
  VTextField
} from 'vuetify/components'

import { pack } from '@/model/pack'

import DebugViewEditJson from '../debug/DebugViewEditJson.vue'
import DebugDockerCard from './DebugDockerCard.vue'

defineProps<{
  selectMode?: boolean
}>()

const emits = defineEmits<{
  packid: [string]
}>()

const showCreate = ref(false)
const createRoot = ref('')
const createPack = ref('{}')

function add() {
  showCreate.value = true
}

function create() {
  pack.add(createRoot.value, JSON.parse(createPack.value))
  showCreate.value = false
}

function del(id: string) {
  pack.del(id)
}
</script>

<template>
  <v-dialog v-model="showCreate" class="w-2/3">
    <v-card class="flex flex-col gap-2 p-4">
      <div class="maa-simple-form p-4">
        <span> 路径 </span>
        <v-text-field v-model="createRoot" hide-details density="compact"></v-text-field>
        <span> 配置 </span>
        <debug-view-edit-json v-model:json="createPack"></debug-view-edit-json>
      </div>
      <div class="flex gap-2">
        <v-btn text="确认" color="primary" @click="create" :disabled="!createRoot"></v-btn>
        <v-btn text="取消" @click="showCreate = false"></v-btn>
      </div>
    </v-card>
  </v-dialog>

  <debug-docker-card id="#pack" :closable="false" class="bg-blue-200">
    <template #title> 资源包列表 </template>

    <div class="flex gap-2">
      <v-btn text="添加" @click="add"></v-btn>
    </div>
    <div class="flex flex-col gap-2">
      <v-expansion-panels>
        <v-expansion-panel v-for="(item, idx) in pack.packs" :key="item.config.id">
          <template #title>
            <div class="flex items-center gap-2">
              <span> {{ item.config.name }} - {{ item.config.id }} </span>
              <v-btn v-if="selectMode" @click.stop="emits('packid', item.config.id)"> 选择 </v-btn>
              <v-btn @click.stop="del(item.config.id)"> 删除 </v-btn>
            </div>
          </template>
          <template #text>
            <div class="flex flex-col gap-2">
              <div class="maa-simple-form">
                <span> 路径 </span>
                <v-text-field v-model="item.root" hide-details density="compact"></v-text-field>
                <span> 配置 </span>
                <debug-view-edit-json
                  :json="JSON.stringify(pack.packs[idx].config)"
                  @blur="
                    v => {
                      try {
                        pack.packs[idx].config = JSON.parse(v)
                      } catch (_) {}
                    }
                  "
                ></debug-view-edit-json>
              </div>
            </div>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </debug-docker-card>
</template>
