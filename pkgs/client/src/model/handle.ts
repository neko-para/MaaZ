import { computed } from 'vue'

import { type MaaAPICallback, callback } from './callback'
import { type MaaResourceAPI, resource } from './resource'

function useHandle() {
  const contain = (id: string) => {
    return computed(() => {
      return !!(getCallback(id as MaaAPICallback) || getResource(id as MaaResourceAPI))
    })
  }

  const getCallback = (id: MaaAPICallback) => {
    return callback.callbacks[id]
  }

  const getResource = (id: MaaResourceAPI) => {
    return resource.resources[id]
  }

  return {
    contain,
    getCallback,
    getResource
  }
}

export const handle = useHandle()
