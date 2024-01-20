import {
  $instance,
  type APICallbackId,
  type ControllerId,
  type InstanceId,
  type InstanceTaskId,
  type ResourceId,
  Status
} from '@maaz/maa'
import { reactive, watch } from 'vue'

import { dockerDelComponent } from '@/components/debug/utils'

import { handle } from './handle'

type TaskInfo = {
  task: string
  taskid: InstanceTaskId
  status: Status
}

export interface MaaInstanceInfo {
  type: 'instance'
  cbid: APICallbackId
  resid: ResourceId | null
  ctrlid: ControllerId | null
  tasks: TaskInfo[]
}

function useInstance() {
  const instances = reactive<Record<InstanceId, MaaInstanceInfo>>({})

  watch(
    instances,
    v => {
      localStorage.setItem('instance', JSON.stringify(v))
    },
    {
      deep: true
    }
  )

  const startFetch = (id: InstanceId, info: TaskInfo) => {
    let fetchStatus = async () => {
      const status = await $instance.status(id, info.taskid)
      info.status = status
      setTimeout(fetchStatus, 1000)
    }
    if (info.status === Status.Pending || info.status === Status.Running) {
      fetchStatus()
    }
  }

  const reinit = async () => {
    const handles = await $instance.dump()
    const storedInfo: Record<InstanceId, MaaInstanceInfo> = JSON.parse(
      localStorage.getItem('instance') ?? '{}'
    )
    for (const key in storedInfo) {
      const k = key as InstanceId
      if (k in handles) {
        instances[k] = storedInfo[k]
        const info = instances[k]
        for (const taskinfo of info.tasks) {
          startFetch(k, taskinfo)
        }
      }
    }
  }

  const dump = async () => {
    return await $instance.dump()
  }

  const create = async (cbid: APICallbackId) => {
    const id = await $instance.create(cbid)
    handle.getCallback(cbid).used[id] = true
    instances[id] = {
      type: 'instance',
      cbid,
      resid: null,
      ctrlid: null,
      tasks: []
    }
    return id
  }

  const destroy = async (id: InstanceId) => {
    const info = instances[id]
    dockerDelComponent(id)
    delete handle.getCallback(info.cbid).used[id]
    if (info.resid) {
      delete handle.getResource(info.resid).used[id]
    }
    if (info.ctrlid) {
      delete handle.getController(info.ctrlid).used[id]
    }
    delete instances[id]
    await $instance.destroy(id)
  }

  const destroyDirect = async (id: InstanceId) => {
    await $instance.destroy(id)
  }

  const bindRes = async (id: InstanceId, res: ResourceId) => {
    const info = instances[id]
    if (info.resid) {
      delete handle.getResource(info.resid).used[id]
    }
    handle.getResource(res).used[id] = true
    info.resid = res
    return await $instance.bindRes(id, res)
  }

  const bindCtrl = async (id: InstanceId, ctrl: ControllerId) => {
    const info = instances[id]
    if (info.ctrlid) {
      delete handle.getController(info.ctrlid).used[id]
    }
    handle.getController(ctrl).used[id] = true
    info.ctrlid = ctrl
    return await $instance.bindCtrl(id, ctrl)
  }

  const postTask = async (id: InstanceId, task: string, param: string) => {
    const info = instances[id]
    const taskid = await $instance.postTask(id, task, param)
    info.tasks.unshift({
      task,
      taskid,
      status: Status.Pending
    })
    startFetch(id, info.tasks[0])
    return task
  }

  return {
    instances,

    reinit,
    dump,
    create,
    destroy,
    destroyDirect,
    bindRes,
    bindCtrl,
    postTask
  }
}

export const instance = useInstance()
