import type { APICallbackId, ControllerId, InstanceId, ResourceId } from '@maaz/maa'
import { computed } from 'vue'

import { callback } from './callback'
import { controller } from './controller'
import { instance } from './instance'
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

  const getInstance = (id: InstanceId) => {
    return instance.instances[id]
  }

  return {
    contain,
    getCallback,
    getResource,
    getController,
    getInstance
  }
}

export const handle = useHandle()
