import { api, opaque } from '@maaz/schema'
import { reactive, watch } from 'vue'

import type { MaaAPICallback } from './callback'
import { handle } from './handle'

export type MaaResourceAPI = string & { __kind: 'MaaResourceAPI' }

export interface MaaResourceInfo {
  type: 'resource'
  cbid: MaaAPICallback
}

function useResource() {
  const resources = reactive<Record<MaaResourceAPI, MaaResourceInfo>>({})

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
    const handles = await opaque.MaaResourceAPI()
    const storedInfo: Record<MaaResourceAPI, MaaResourceInfo> = JSON.parse(
      localStorage.getItem('resource') ?? '{}'
    )
    for (const key in storedInfo) {
      const k = key as MaaResourceAPI
      if (k in handles) {
        resources[k] = storedInfo[k]
      }
    }
  }

  const dump = () => {
    return opaque.MaaResourceAPI()
  }

  const create = async (cbid: MaaAPICallback) => {
    const id = (await api.MaaResourceCreate({ callback: cbid })).return as MaaResourceAPI
    handle.getCallback(cbid).used[id] = true
    resources[id] = {
      type: 'resource',
      cbid
    }
    return id
  }

  const destroy = async (id: MaaResourceAPI) => {
    delete handle.getCallback(resources[id].cbid).used[id]
    delete resources[id]
    await api.MaaResourceDestroy({ res: id })
  }

  const destroyDirect = async (id: MaaResourceAPI) => {
    await api.MaaResourceDestroy({ res: id })
  }

  const postPath = async (id: MaaResourceAPI, path: string) => {
    const act_id = (await api.MaaResourcePostPath({ path, res: id })).return
    const ret = await api.MaaResourceWait({
      id: act_id,
      res: id
    })
    console.log(ret)
    return ret
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
