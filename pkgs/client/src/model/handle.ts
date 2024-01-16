import type { APICallbackId, ResourceId } from '@maaz/maa'
import { computed } from 'vue'

import { callback } from './callback'
import { resource } from './resource'

function useHandle() {
  const contain = (id: string) => {
    return computed(() => {
      return !!(getCallback(id as APICallbackId) || getResource(id as ResourceId))
    })
  }

  const getCallback = (id: APICallbackId) => {
    return callback.callbacks[id]
  }

  const getResource = (id: ResourceId) => {
    return resource.resources[id]
  }

  return {
    contain,
    getCallback,
    getResource
  }
}

export const handle = useHandle()
