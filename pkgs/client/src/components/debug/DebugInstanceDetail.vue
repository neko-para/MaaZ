<script setup lang="ts">
import {
  $instance,
  $resource,
  type ControllerId,
  type InstanceId,
  type InstanceTaskId,
  type ResourceId,
  Status
} from '@maaz/maa'
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { VBtn, VCard, VChip, VDialog, VTextField } from 'vuetify/components'

import { handle } from '@/model/handle'
import { instance } from '@/model/instance'

import DebugController from './DebugController.vue'
import DebugDockerCard from './DebugDockerCard.vue'
import DebugResource from './DebugResource.vue'
import DebugSelect from './DebugSelect.vue'
import { dockerAddComponent } from './utils'

const props = defineProps<{
  id: InstanceId
}>()

const info = computed(() => {
  return handle.getInstance(props.id)
})

const loading = ref(false)

const ctrlInited = ref<boolean>(false)

const selectResourceEl = ref<InstanceType<typeof DebugSelect> | null>(null)
const selectControllerEl = ref<InstanceType<typeof DebugSelect> | null>(null)

const running = ref(false)
const showPostTask = ref(false)
const task = ref('')
const actionId = ref<InstanceTaskId | null>(null)
const actionStatus = ref<Status | null>(null)

function openCallback() {
  dockerAddComponent(info.value.cbid, 'DebugCallbackDetail')
}

function openResource() {
  if (info.value.resid) {
    dockerAddComponent(info.value.resid, 'DebugResourceDetail')
  }
}

function openController() {
  if (info.value.ctrlid) {
    dockerAddComponent(info.value.ctrlid, 'DebugControllerDetail')
  }
}

function selectRes() {
  selectResourceEl.value?.trigger()
}

function selectCtrl() {
  selectControllerEl.value?.trigger()
}

async function bindRes(res: ResourceId) {
  loading.value = true
  await instance.bindRes(props.id, res)
  await updateInfo()
  loading.value = false
}

async function bindCtrl(ctrl: ControllerId) {
  loading.value = true
  await instance.bindCtrl(props.id, ctrl)
  await updateInfo()
  loading.value = false
}

async function updateInfo() {
  ctrlInited.value = await $instance.inited(props.id)
}

function selectTask() {
  showPostTask.value = true
}

async function postTask() {
  showPostTask.value = false
  running.value = true
  actionId.value = await $instance.postTask(props.id, task.value, '{}')
  let fin = false
  const timer = setInterval(async () => {
    const status = await $instance.status(props.id, actionId.value!)
    if (!fin) {
      actionStatus.value = status
    }
  }, 1000)
  const status = await $instance.wait(props.id, actionId.value)
  clearTimeout(timer)
  fin = true
  actionStatus.value = status
  running.value = false
}

async function postStop() {
  await $instance.postStop(props.id)
}

const statusText: Record<Status, string> = {
  [Status.Invalid]: '无效',
  [Status.Pending]: '等待中',
  [Status.Running]: '执行中',
  [Status.Success]: '成功',
  [Status.Failed]: '失败'
}

onMounted(() => {
  updateInfo()
})
</script>

<template>
  <debug-select
    ref="selectResourceEl"
    v-slot="{ value, setValue }"
    @selected="id => bindRes(id as ResourceId)"
  >
    <debug-resource select-mode :resource="value" @update:resource="setValue"></debug-resource>
  </debug-select>

  <debug-select
    ref="selectControllerEl"
    v-slot="{ value, setValue }"
    @selected="id => bindCtrl(id as ControllerId)"
  >
    <debug-controller
      select-mode
      :controller="value"
      @update:controller="setValue"
    ></debug-controller>
  </debug-select>

  <v-dialog v-model="showPostTask" class="w-1/2">
    <v-card class="flex flex-col gap-2 p-4">
      <v-text-field v-model="task" hide-details density="compact"></v-text-field>
      <div class="flex">
        <v-btn @click="postTask"> 启动 </v-btn>
      </div>
    </v-card>
  </v-dialog>

  <debug-docker-card :id="id">
    <template #title> 实例 {{ ctrlInited ? ' - 已加载' : '' }} - {{ id }} </template>
    <template #close> <slot name="close"> </slot> </template>

    <div v-if="info" class="flex flex-col gap-2">
      <div class="flex gap-2">
        <v-btn text="绑定资源" @click="selectRes" :disabled="running"></v-btn>
        <v-btn text="绑定控制器" @click="selectCtrl" :disabled="running"></v-btn>
        <v-btn text="启动任务" @click="selectTask" :loading="running"></v-btn>
        <v-btn text="停止任务" @click="postStop" :disabled="!running"></v-btn>
        <v-btn text="回调" @click="openCallback"></v-btn>
        <v-btn text="刷新" @click="updateInfo"></v-btn>
      </div>
      <div class="flex gap-2">
        <v-btn v-if="info.resid" @click="openResource"> Res: {{ info.resid }} </v-btn>
        <v-btn v-if="info.ctrlid" @click="openController"> Ctrl: {{ info.ctrlid }} </v-btn>
      </div>
      <div v-if="actionId">
        <span>
          <span> 任务: {{ actionId }} </span>
          <span v-if="actionStatus"> {{ statusText[actionStatus] }} </span>
        </span>
      </div>
    </div>
  </debug-docker-card>
</template>
