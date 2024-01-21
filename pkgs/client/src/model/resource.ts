import { $resource, type APICallbackId, type ResourceId } from '@maaz/maa'
import { reactive, watch } from 'vue'

import { dockerDelComponent } from '@/components/debug/utils'

import { handle } from './handle'
import { sync } from './storage'

export interface MaaResourceInfo {
  type: 'resource'
  used: Record<string, true>
  cbid: APICallbackId
}

function useResource() {
  const resources = reactive<Record<ResourceId, MaaResourceInfo>>({})

  const _sync = sync('resource', resources)

  const reinit = async () => {
    const handles = await $resource.dump()
    const storedInfo = _sync()
    for (const key in storedInfo) {
      const k = key as ResourceId
      if (k in handles) {
        resources[k] = storedInfo[k]
      }
    }
  }

  const dump = async () => {
    return await $resource.dump()
  }

  const create = async (cbid: APICallbackId) => {
    const id = await $resource.create(cbid)
    handle.getCallback(cbid).used[id] = true
    resources[id] = {
      type: 'resource',
      used: {},
      cbid
    }
    return id
  }

  const destroy = async (id: ResourceId) => {
    dockerDelComponent(id)
    delete handle.getCallback(resources[id].cbid).used[id]
    delete resources[id]
    await $resource.destroy(id)
  }

  const destroyDirect = async (id: ResourceId) => {
    await $resource.destroy(id)
  }

  return {
    resources,

    reinit,
    dump,
    create,
    destroy,
    destroyDirect
  }
}

export const resource = useResource()
