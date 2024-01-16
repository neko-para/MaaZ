import { $callback, type APICallback, type APICallbackId } from '@maaz/maa'
import { reactive, watch } from 'vue'

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

  watch(
    callbacks,
    v => {
      localStorage.setItem('callback', JSON.stringify(v))
    },
    {
      deep: true
    }
  )

  const reinit = async () => {
    const handles = await $callback.dump()
    const storedInfo: Record<APICallbackId, MaaCallbackInfo> = JSON.parse(
      localStorage.getItem('callback') ?? '{}'
    )
    for (const key in storedInfo) {
      const k = key as APICallbackId
      if (handles.includes(k)) {
        const info = storedInfo[k]
        info.state = {
          running: false,
          pulling: false
        }
        callbacks[k] = info
      }
    }
  }

  const add = async () => {
    const id = await $callback.add()
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
      await Promise.all(
        ids.map(async cid => {
          await $callback.process(id, cid, async (msg, details_json) => {
            const detail = JSON.parse(details_json)
            info.log.push({
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
