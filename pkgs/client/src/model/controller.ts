import {
  $controller,
  $resource,
  type APICallbackId,
  type AdbConfig,
  type ControllerId,
  type ResourceId,
  Status
} from '@maaz/maa'
import { reactive, watch } from 'vue'

import { dockerDelComponent } from '@/components/debug/utils'

import { globalConfig } from './config'
import { handle } from './handle'

export interface MaaControllerInfo {
  type: 'controller'
  cfg: AdbConfig
  cbid: APICallbackId
}

function useController() {
  const controllers = reactive<Record<ControllerId, MaaControllerInfo>>({})

  watch(
    controllers,
    v => {
      localStorage.setItem('controller', JSON.stringify(v))
    },
    {
      deep: true
    }
  )

  const reinit = async () => {
    const handles = await $controller.dump()
    const storedInfo: Record<ControllerId, MaaControllerInfo> = JSON.parse(
      localStorage.getItem('controller') ?? '{}'
    )
    for (const key in storedInfo) {
      const k = key as ControllerId
      if (k in handles) {
        controllers[k] = storedInfo[k]
      }
    }
  }

  const dump = async () => {
    return await $controller.dump()
  }

  const createAdb = async (cfg: AdbConfig, cbid: APICallbackId) => {
    const id = await $controller.createAdb(cfg, globalConfig.config.agent_path ?? '', cbid)
    handle.getCallback(cbid).used[id] = true
    controllers[id] = {
      type: 'controller',
      cfg,
      cbid
    }
    return id
  }

  const destroy = async (id: ControllerId) => {
    dockerDelComponent(id)
    delete handle.getCallback(controllers[id].cbid).used[id]
    delete controllers[id]
    await $controller.destroy(id)
  }

  const destroyDirect = async (id: ControllerId) => {
    await $controller.destroy(id)
  }

  return {
    controllers,

    reinit,
    dump,
    createAdb,
    destroy,
    destroyDirect
  }
}

export const controller = useController()
