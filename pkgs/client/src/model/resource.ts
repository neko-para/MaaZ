import { $resource, type APICallbackId, type ResourceId, Status } from '@maaz/maa'
import { api, opaque } from '@maaz/schema'
import { reactive, watch } from 'vue'

import { handle } from './handle'

export interface MaaResourceInfo {
  type: 'resource'
  cbid: APICallbackId
}

function useResource() {
  const resources = reactive<Record<ResourceId, MaaResourceInfo>>({})

  watch(
    resources,
    v => {
      localStorage.setItem('resource', JSON.stringify(v))
    },
    {
      deep: true
    }
  )

  const reinit = async () => {
    const handles = await $resource.dump()
    const storedInfo: Record<ResourceId, MaaResourceInfo> = JSON.parse(
      localStorage.getItem('resource') ?? '{}'
    )
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
      cbid
    }
    return id
  }

  const destroy = async (id: ResourceId) => {
    delete handle.getCallback(resources[id].cbid).used[id]
    delete resources[id]
    await $resource.destroy(id)
  }

  const destroyDirect = async (id: ResourceId) => {
    await $resource.destroy(id)
  }

  const postPath = async (id: ResourceId, path: string) => {
    const act_id = await $resource.postPath(id, path)
    const status = await $resource.wait(id, act_id)
    return status === Status.Success
  }

  return {
    resources,

    reinit,
    dump,
    create,
    destroy,
    destroyDirect,
    postPath
  }
}

export const resource = useResource()
