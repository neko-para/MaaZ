import type { APICallbackId, ControllerId, ResourceId } from '@maaz/maa'
import { computed } from 'vue'

import { callback } from './callback'
import { controller } from './controller'
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

  const getController = (id: ControllerId) => {
    return controller.controllers[id]
  }

  return {
    contain,
    getCallback,
    getResource,
    getController
  }
}

export const handle = useHandle()
