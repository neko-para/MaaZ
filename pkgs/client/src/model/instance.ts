import {
  $instance,
  type APICallbackId,
  type ControllerId,
  type InstanceId,
  type ResourceId
} from '@maaz/maa'
import { reactive, watch } from 'vue'

import { dockerDelComponent } from '@/components/debug/utils'

import { handle } from './handle'

export interface MaaInstanceInfo {
  type: 'instance'
  cbid: APICallbackId
  resid: ResourceId | null
  ctrlid: ControllerId | null
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

  const reinit = async () => {
    const handles = await $instance.dump()
    const storedInfo: Record<InstanceId, MaaInstanceInfo> = JSON.parse(
      localStorage.getItem('instance') ?? '{}'
    )
    for (const key in storedInfo) {
      const k = key as InstanceId
      if (k in handles) {
        instances[k] = storedInfo[k]
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
      ctrlid: null
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

  return {
    instances,

    reinit,
    dump,
    create,
    destroy,
    destroyDirect,
    bindRes,
    bindCtrl
  }
}

export const instance = useInstance()
