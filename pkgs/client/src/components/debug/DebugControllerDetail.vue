<script setup lang="ts">
import { $controller, type ControllerId, ControllerOption } from '@maaz/maa'
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { VBtn, VCard, VDialog, VTextField } from 'vuetify/components'

import { handle } from '@/model/handle'

import DebugDockerCard from './DebugDockerCard.vue'
import { dockerAddComponent } from './utils'

const props = defineProps<{
  id: ControllerId
}>()

const info = computed(() => {
  return handle.getController(props.id)
})

const loading = ref(false)

const showConfig = ref(false)
const configLoading = ref(false)
const configLongSide = ref(1920)
const configShortSide = ref(1080)
const configPackageEntry = ref('plus.maa.maaz/DebugControllerDetail')
const configPackage = ref('plus.maa.maaz')

async function setLongSide() {
  configLoading.value = true
  if (
    !(await $controller.setOptionI(
      props.id,
      ControllerOption.ScreenshotTargetLongSide,
      configLongSide.value
    ))
  ) {
    console.log('set long side failed')
  }
  configLoading.value = false
}

async function setShortSide() {
  configLoading.value = true
  if (
    !(await $controller.setOptionI(
      props.id,
      ControllerOption.ScreenshotTargetShortSide,
      configShortSide.value
    ))
  ) {
    console.log('set short side failed')
  }
  configLoading.value = false
}

async function setPackageEntry() {
  configLoading.value = true
  if (
    !(await $controller.setOptionS(
      props.id,
      ControllerOption.DefaultAppPackageEntry,
      configPackageEntry.value
    ))
  ) {
    console.log('set package entry failed')
  }
  configLoading.value = false
}

async function setPackage() {
  configLoading.value = true
  if (
    !(await $controller.setOptionS(
      props.id,
      ControllerOption.DefaultAppPackage,
      configPackage.value
    ))
  ) {
    console.log('set package failed')
  }
  configLoading.value = false
}

const ctrlConnected = ref<boolean>(false)
const ctrlUUID = ref<string | null>(null)
const ctrlImage = ref<string | null>(null)

async function postConnection() {
  ctrlConnected.value = false
  ctrlUUID.value = null

  loading.value = true
  const actid = await $controller.postConnection(props.id)
  await $controller.wait(props.id, actid)
  await updateInfo()
  loading.value = false
}

function openCallback() {
  dockerAddComponent(info.value.cbid, 'DebugCallbackDetail')
}

async function updateInfo() {
  ctrlConnected.value = await $controller.connected(props.id)
  if (ctrlConnected.value) {
    ctrlUUID.value = await $controller.uuid(props.id)
  } else {
    ctrlUUID.value = null
  }
}

async function screencap() {
  if (ctrlImage.value) {
    ctrlImage.value = null
  }
  const actid = await $controller.postScreencap(props.id)
  await $controller.wait(props.id, actid)
  const png = await $controller.image(props.id, false)
  if (!png) {
    return
  }
  ctrlImage.value = png
}

onMounted(() => {
  updateInfo()
})
</script>

<template>
  <v-dialog v-model="showConfig" class="w-1/2">
    <v-card class="p-4">
      <div class="maa-simple-form">
        <span> 长边 </span>
        <div class="flex items-center gap-2">
          <v-text-field
            :model-value="configLongSide.toString()"
            @update:model-value="
              v => {
                configLongSide = Math.max(0, parseInt(v))
              }
            "
            hide-details
            density="compact"
          ></v-text-field>
          <v-btn @click="setLongSide" :loading="configLoading"> 设置 </v-btn>
        </div>
        <span> 短边 </span>
        <div class="flex items-center gap-2">
          <v-text-field
            :model-value="configShortSide.toString()"
            @update:model-value="
              v => {
                configShortSide = Math.max(0, parseInt(v))
              }
            "
            hide-details
            density="compact"
          ></v-text-field>
          <v-btn @click="setShortSide" :loading="configLoading"> 设置 </v-btn>
        </div>
        <span> 入口 </span>
        <div class="flex items-center gap-2">
          <v-text-field
            v-model="configPackageEntry"
            placeholder="plus.maa.maaz/DebugControllerDetail"
            hide-details
            density="compact"
          ></v-text-field>
          <v-btn @click="setPackageEntry" :loading="configLoading"> 设置 </v-btn>
        </div>
        <span> 包名 </span>
        <div class="flex items-center gap-2">
          <v-text-field
            v-model="configPackage"
            placeholder="plus.maa.maaz"
            hide-details
            density="compact"
          ></v-text-field>
          <v-btn @click="setPackage" :loading="configLoading"> 设置 </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>

  <debug-docker-card :id="id">
    <template #title> 控制器 {{ ctrlConnected ? ' - 已连接' : '' }} - {{ id }} </template>
    <template #close> <slot name="close"> </slot> </template>

    <div v-if="info" class="flex flex-col gap-2">
      <div class="flex gap-2">
        <v-btn text="连接" @click="postConnection" :loading="loading"></v-btn>
        <v-btn text="配置" @click="showConfig = true"></v-btn>
        <v-btn text="回调" @click="openCallback"></v-btn>
        <v-btn text="刷新" @click="updateInfo" :loading="loading"></v-btn>
        <v-btn text="截图" @click="screencap" :disabled="!ctrlConnected"></v-btn>
      </div>
      <span v-if="ctrlUUID"> UUID: {{ ctrlUUID }} </span>
      <span v-if="ctrlImage">
        <img :src="'data:image/png;base64,' + ctrlImage" />
      </span>
    </div>
  </debug-docker-card>
</template>
