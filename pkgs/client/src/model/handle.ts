import { type MaaAPICallback, callback } from './callback'
import { type MaaResourceAPI, resource } from './resource'

function useHandle() {
  const getCallback = (id: MaaAPICallback) => {
    return callback.callbacks[id]
  }

  const getResource = (id: MaaResourceAPI) => {
    return resource.resources[id]
  }

  return {
    getCallback,
    getResource
  }
}

export const handle = useHandle()
