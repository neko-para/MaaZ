import { $controller, type APICallbackId, type AdbConfig, type ControllerId } from '@maaz/maa'
import { reactive, watch } from 'vue'

import { dockerDelComponent } from '@/components/debug/utils'

import { globalConfig } from './config'
import { handle } from './handle'
import { sync } from './storage'

export interface MaaControllerInfo {
  type: 'controller'
  cfg: AdbConfig
  used: Record<string, true>
  cbid: APICallbackId
}

function useController() {
  const controllers = reactive<Record<ControllerId, MaaControllerInfo>>({})

  const _sync = sync('controller', controllers)

  const reinit = async () => {
    const handles = await $controller.dump()
    const storedInfo = _sync()
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
    if (!id) {
      return null
    }
    handle.getCallback(cbid).used[id] = true
    controllers[id] = {
      type: 'controller',
      cfg,
      used: {},
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
