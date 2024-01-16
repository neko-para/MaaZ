import { callback as cb } from '@maaz/schema'
import { reactive, watch } from 'vue'

export type MaaAPICallback = string & { __kind: 'MaaAPICallback' }

export interface MaaCallbackInfo {
  type: 'callback'
  used: Record<string, true>
  log: {
    cid: string
    arg: { msg: string; detail: unknown }
  }[]
  state: {
    pulling: boolean
  }
}

function useCallback() {
  const callbacks = reactive<Record<MaaAPICallback, MaaCallbackInfo>>({})

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
    const handles = (await cb.MaaAPICallback.dump()).ids
    const storedInfo: Record<MaaAPICallback, MaaCallbackInfo> = JSON.parse(
      localStorage.getItem('callback') ?? '{}'
    )
    for (const key in storedInfo) {
      const k = key as MaaAPICallback
      if (handles.includes(k)) {
        const info = storedInfo[k]
        info.state = {
          pulling: false
        }
        callbacks[k] = info
      }
    }
  }

  const add = async () => {
    const id = (await cb.MaaAPICallback.add()).id as MaaAPICallback
    callbacks[id] = {
      type: 'callback',
      used: {},
      log: [],
      state: {
        pulling: false
      }
    }
    return id
  }

  const del = async (id: MaaAPICallback) => {
    delete callbacks[id]
    await cb.MaaAPICallback.del({ id })
  }

  const delDirect = async (id: MaaAPICallback) => {
    await cb.MaaAPICallback.del({ id })
  }

  const dump = async () => {
    return (await cb.MaaAPICallback.dump()).ids
  }

  const listen = (id: MaaAPICallback, func: (msg: string, details: unknown) => Promise<void>) => {
    const info = callbacks[id]
    info.state.pulling = true
    const pull = async () => {
      const ids = (await cb.MaaAPICallback.pull({ id })).ids
      await Promise.all(
        ids.map(async cid => {
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
        })
      )
      if (info.state.pulling) {
        setTimeout(pull, 0)
      }
    }
    pull()
  }

  const stop = (id: MaaAPICallback) => {
    callbacks[id].state.pulling = false
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
