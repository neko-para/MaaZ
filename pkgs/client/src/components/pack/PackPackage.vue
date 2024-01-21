<script setup lang="ts">
import { ref } from 'vue'
import {
  VBtn,
  VCard,
  VContainer,
  VDialog,
  VExpansionPanel,
  VExpansionPanels,
  VTextField
} from 'vuetify/components'

import { pack } from '@/model/pack'

import DebugViewEditJson from '../debug/DebugViewEditJson.vue'

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

  <v-container>
    <v-card class="flex flex-col gap-2 p-4">
      <div class="flex items-center">
        <span class="font-bold text-lg"> 资源包列表 </span>
      </div>
      <div class="flex gap-2">
        <v-btn text="添加" @click="add"></v-btn>
      </div>
      <div class="flex flex-col gap-2">
        <v-expansion-panels>
          <v-expansion-panel v-for="(item, idx) in pack.packs" :key="item.config.id">
            <template #title> {{ item.config.name }} - {{ item.config.id }} </template>
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
    </v-card>
  </v-container>
</template>
