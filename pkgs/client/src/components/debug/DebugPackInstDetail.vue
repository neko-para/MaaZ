<script setup lang="ts">
import { $resource, type ResourceConfig, type ResourceId } from '@maaz/maa'
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { VBtn, VCard, VChip, VDialog, VTextField } from 'vuetify/components'

import { handle } from '@/model/handle'
import { pack } from '@/model/pack'
import { packinst } from '@/model/packinst'

import DebugDockerCard from './DebugDockerCard.vue'
import { dockerAddComponent } from './utils'

const props = defineProps<{
  id: string
}>()

const info = computed(() => {
  return handle.getPackInst(props.id)
})

const instInfo = computed(() => {
  return info.value.instid ? handle.getInstance(info.value.instid) : null
})

const packInfo = computed(() => {
  return pack.get(info.value.pack)
})

const loading = ref(0)
const activeResource = ref<string | null>(null)

function openInstance() {
  if (info.value.instid) {
    dockerAddComponent(info.value.instid, 'DebugInstanceDetail')
  }
}

async function createInstance() {
  loading.value += 1
  await packinst.setup(props.id)
  loading.value -= 1
}

async function loadResource(res: ResourceConfig) {
  if (!instInfo.value) {
    return
  }
  loading.value += 1
  if (res.extends) {
    if (!(await loadResource(packInfo.value!.config.resource[res.extends]))) {
      return false
    }
  }
  const p = packInfo.value!.root + '/' + res.path
  const id = await $resource.postPath(instInfo.value.resid!, p)
  await $resource.wait(instInfo.value.resid!, id)
  activeResource.value = res.name
  loading.value -= 1
}
</script>

<template>
  <debug-docker-card :id="id">
    <template #title> 资源包实例 - {{ id }} </template>
    <template #close> <slot name="close"> </slot> </template>

    <div v-if="info && packInfo" class="flex flex-col gap-2">
      <div class="flex gap-2">
        <v-btn v-if="info.instid" @click="openInstance"> Inst: {{ info.instid }} </v-btn>
        <v-btn v-else @click="createInstance"> 创建 </v-btn>
      </div>
      <div class="flex gap-2">
        <v-btn
          v-for="(res, key) in packInfo.config.resource"
          :key="key"
          :color="res.default ? 'primary' : ''"
          @click="loadResource(res)"
          :disabled="!info.instid"
          :loading="loading > 0"
        >
          {{ res.name }} - {{ key }}
        </v-btn>
      </div>
      <div class="flex gap-2">
        <span v-if="activeResource"> 资源 {{ activeResource }} </span>
      </div>
    </div>
  </debug-docker-card>
</template>
