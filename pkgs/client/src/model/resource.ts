import { api, opaque } from '@maaz/schema'
import { reactive } from 'vue'

import type { MaaAPICallback } from './callback'
import { handle } from './handle'

export type MaaResourceAPI = string & { __kind: 'MaaResourceAPI' }

export interface MaaResourceInfo {
  type: 'resource'
  cbid: MaaAPICallback
}

function useResource() {
  const resources = reactive<Record<MaaResourceAPI, MaaResourceInfo>>({})

  const dump = () => {
    return opaque.MaaResourceAPI()
  }

  const create = async (cbid: MaaAPICallback) => {
    const id = (await api.MaaResourceCreate({ callback: cbid })).return as MaaResourceAPI
    handle.getCallback(cbid).used.add(id)
    resources[id] = {
      type: 'resource',
      cbid
    }
    return id
  }

  const destroy = async (id: MaaResourceAPI) => {
    handle.getCallback(resources[id].cbid).used.delete(id)
    delete resources[id]
    await api.MaaResourceDestroy({ res: id })
  }

  const destroyDirect = async (id: MaaResourceAPI) => {
    await api.MaaResourceDestroy({ res: id })
  }

  const postPath = async (id: MaaResourceAPI, path: string) => {
    await api.MaaResourcePostPath({ path, res: id })
  }

  return {
    resources,

    dump,
    create,
    destroy,
    destroyDirect,
    postPath
  }
}

export const resource = useResource()
