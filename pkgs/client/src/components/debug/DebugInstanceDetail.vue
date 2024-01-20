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
import { VAutocomplete, VBtn, VCard, VDataTable, VDialog, VTextField } from 'vuetify/components'

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

const showPostTask = ref(false)
const task = ref('')
const taskList = ref<string[]>([])

const running = computed(() => {
  return (
    info.value.tasks.filter(x => x.status === Status.Pending || x.status === Status.Running)
      .length > 0
  )
})

const headers = [
  {
    title: 'TaskID',
    key: 'taskid'
  },
  {
    title: 'Task',
    key: 'task'
  },
  {
    title: 'Status',
    key: 'status'
  }
]

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

async function selectTask() {
  showPostTask.value = true
  taskList.value = []
  if (info.value.resid) {
    const resid = info.value.resid
    if (!(await $resource.loaded(info.value.resid))) {
      return
    }
    taskList.value = JSON.parse((await $resource.getTaskList(resid)) ?? '[]')
  }
}

async function postTask() {
  showPostTask.value = false
  await instance.postTask(props.id, task.value, '{}')
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
      <div class="maa-simple-form">
        <span> 任务 </span>
        <v-autocomplete
          v-model="task"
          :items="taskList"
          hide-details
          density="compact"
        ></v-autocomplete>
      </div>
      <div class="flex">
        <v-btn @click="postTask" :disabled="!task"> 启动 </v-btn>
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
      <v-data-table :headers="headers" :items="info.tasks">
        <template v-slot:item.status="{ value }">
          <span> {{ statusText[value as Status] }} </span>
        </template>
      </v-data-table>
    </div>
  </debug-docker-card>
</template>
