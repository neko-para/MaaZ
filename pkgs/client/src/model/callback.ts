import { $callback, type APICallback, type APICallbackId } from '@maaz/maa'
import { reactive, watch } from 'vue'

import { dockerDelComponent } from '@/components/debug/utils'

import { sync } from './storage'

export interface MaaCallbackInfo {
  type: 'callback'
  used: Record<string, true>
  log: {
    cid: string
    arg: { msg: string; detail: unknown }
  }[]
  state: {
    running: boolean
    pulling: boolean
    func?: APICallback
  }
}

function useCallback() {
  const callbacks = reactive<Record<APICallbackId, MaaCallbackInfo>>({})

  const _sync = sync('callback', callbacks)

  const reinit = async () => {
    const handles = await $callback.dump()
    const storedInfo = _sync()
    for (const key in storedInfo) {
      const k = key as APICallbackId
      if (handles.includes(k)) {
        const info = storedInfo[k]
        info.state = {
          running: false,
          pulling: false
        }
        callbacks[k] = info
        listen(k, async (msg, details) => {
          console.log(msg, details)
        })
      }
    }
  }

  const add = async () => {
    const id = await $callback.add()
    if (!id) {
      return null
    }
    callbacks[id] = {
      type: 'callback',
      used: {},
      log: [],
      state: {
        running: false,
        pulling: false
      }
    }
    return id
  }

  const del = async (id: APICallbackId) => {
    dockerDelComponent(id)
    callbacks[id].state.running = false
    delete callbacks[id]
    await $callback.del(id)
  }

  const delDirect = async (id: APICallbackId) => {
    await $callback.del(id)
  }

  const dump = async () => {
    return await $callback.dump()
  }

  const listen = (id: APICallbackId, func: (msg: string, details: unknown) => Promise<void>) => {
    const info = callbacks[id]
    info.state.running = true
    info.state.func = func
    if (info.state.pulling === true) {
      return
    }
    const pull = async () => {
      info.state.pulling = true
      const ids = await $callback.pull(id)
      if (!info.state.running) {
        return
      }
      await Promise.all(
        ids.map(async cid => {
          await $callback.process(id, cid, async (msg, details_json) => {
            const detail = JSON.parse(details_json)
            info.log.unshift({
              cid,
              arg: {
                msg,
                detail
              }
            })
            await info.state.func?.(msg, detail)
          })
        })
      )
      info.state.pulling = false
      if (info.state.running) {
        setTimeout(pull, 0)
      }
    }
    pull()
  }

  const stop = (id: APICallbackId) => {
    callbacks[id].state.running = false
  }

  return {
    callbacks,

    reinit,
    add,
    del,
    delDirect,
    dump,
    listen,
    stop
  }
}

export const callback = useCallback()
