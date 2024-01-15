import { callback as cb } from '@maaz/schema'
import { reactive } from 'vue'

export type MaaAPICallback = string & { __kind: 'MaaAPICallback' }

export interface MaaCallbackInfo {
  type: 'callback'
  used: Set<string>
  timer: ReturnType<typeof setInterval> | null
  log: {
    cid: string
    arg: { msg: string; detail: unknown }
  }[]
}

function useCallback() {
  const callbacks = reactive<Record<MaaAPICallback, MaaCallbackInfo>>({})

  const add = async () => {
    const id = (await cb.MaaAPICallback.add()).id as MaaAPICallback
    callbacks[id] = {
      type: 'callback',
      used: new Set(),
      timer: null,
      log: []
    }
    return id
  }

  const del = async (id: MaaAPICallback) => {
    if (callbacks[id].timer !== null) {
      clearInterval(callbacks[id].timer!)
    }
    delete callbacks[id]
    await cb.MaaAPICallback.del({ id })
  }

  const delDirect = async (id: MaaAPICallback) => {
    await cb.MaaAPICallback.del({ id })
  }

  const dump = async () => {
    return (await cb.MaaAPICallback.dump()).ids
  }

  const listen = (
    id: MaaAPICallback,
    func: (msg: string, details: unknown) => Promise<void>,
    timer = 1000
  ) => {
    let running = false
    const info = callbacks[id]
    info.timer = setInterval(async () => {
      if (running) {
        return
      }
      running = true
      const ids = (await cb.MaaAPICallback.pull({ id })).ids
      for (const cid of ids) {
        const { msg, details_json } = await cb.MaaAPICallback.request({ id, cid })
        const detail = JSON.parse(details_json)
        info.log.push({
          cid,
          arg: {
            msg,
            detail
          }
        })
        await func(msg, detail)
        await cb.MaaAPICallback.response({ id, cid })
      }
      running = false
    }, timer)
  }

  return {
    callbacks,

    add,
    del,
    delDirect,
    dump,
    listen
  }
}

export const callback = useCallback()
