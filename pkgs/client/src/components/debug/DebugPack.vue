<script setup lang="ts">
import {
  $controller,
  $instance,
  $resource,
  type ControllerId,
  ControllerOption,
  type InstanceId,
  type ResourceId
} from '@maaz/maa'
import { ref } from 'vue'
import {
  VBtn,
  VCard,
  VDialog,
  VExpansionPanel,
  VExpansionPanels,
  VTextField
} from 'vuetify/components'

import { controller } from '@/model/controller'
import { instance } from '@/model/instance'
import { pack } from '@/model/pack'
import { packinst } from '@/model/packinst'
import { resource } from '@/model/resource'

import DebugViewEditJson from '../debug/DebugViewEditJson.vue'
import DebugDockerCard from './DebugDockerCard.vue'
import { service } from './service'
import { dockerAddComponent } from './utils'

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

async function make(id: string) {
  const pak = pack.get(id)
  if (!pak) {
    return
  }
  const res = (await service['#resource'].create()) as ResourceId | null
  if (!res) {
    return
  }
  const ctrl = (await service['#controller'].create()) as ControllerId | null
  if (!ctrl) {
    await resource.destroy(res)
    return
  }
  const inst = (await service['#instance'].create()) as InstanceId | null
  if (!inst) {
    await resource.destroy(res)
    await controller.destroy(ctrl)
    return
  }
  await instance.bindRes(inst, res)
  await instance.bindCtrl(inst, ctrl)

  const piid = packinst.create(id, inst)

  if (pak.config.controller) {
    const ci = pak.config.controller
    if (ci.start) {
      await $controller.setOptionS(ctrl, ControllerOption.DefaultAppPackageEntry, ci.start)
    }
    if (ci.stop) {
      await $controller.setOptionS(ctrl, ControllerOption.DefaultAppPackage, ci.stop)
    }
    if (ci.long) {
      await $controller.setOptionI(ctrl, ControllerOption.ScreenshotTargetLongSide, ci.long)
    }
    if (ci.short) {
      await $controller.setOptionI(ctrl, ControllerOption.ScreenshotTargetLongSide, ci.short)
    }
  }
  // const loadAct = await $resource.postPath(res, pak.root)
  const connAct = await $controller.postConnection(ctrl)
  await $controller.wait(ctrl, connAct)

  dockerAddComponent(piid, 'DebugPackInstDetail')
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
              <v-btn @click.stop="make(item.config.id)"> 创建 </v-btn>
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
