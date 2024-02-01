import { $callback } from '@maaz/maa'

import { diff, handle } from '../utils'
import type { GeneralHandle } from '../utils/handle'

export const CallbackType = 'callback'
export type CallbackType = typeof CallbackType

export type CallbackHandle = handle.Handle<CallbackType>

export type CallbackItem = {
  msg: string
  detail: unknown
}

export interface CallbackInfoData {
  cache: CallbackItem[]
}

export interface CallbackInfoTemp {
  state: {
    running: boolean
    pulling: boolean
    resolve: () => void
  }
}

export type CallbackInfo = handle.HandleInfo<CallbackInfoData, CallbackInfoTemp>

export async function sync() {
  try {
    const remoteIds = (await $callback.dump()) as CallbackHandle[]
    const localIds = handle.findType(CallbackType)
    const { newOnly, oldOnly } = diff(remoteIds, localIds)
    using _ = handle.triggerNotify()
    for (const h of oldOnly) {
      handle.del(h)
    }
    for (const h of newOnly) {
      handle.add(h, CallbackType, { cache: [] })
    }
    return true
  } catch (err) {
    return false
  }
}

export async function make() {
  try {
    const id = await $callback.add()
    if (!id || id === '') {
      return false
    }
    const hdl = id
    const data: CallbackInfoData = {
      cache: []
    }
    const info = handle.add(hdl, CallbackType, data)
    if (!info) {
      return false
    }
    const temp: CallbackInfoTemp = {
      state: {
        running: true,
        pulling: false,
        resolve: () => {}
      }
    }
    info.temp = temp
    const puller = async () => {
      temp.state.pulling = true
      try {
        const ids = await $callback.pull(hdl)
        if (!temp.state.running) {
          temp.state.resolve()
          return
        }
        await Promise.all(
          ids.map(async cid => {
            await $callback.process(hdl, cid, async (msg, details_json) => {
              try {
                const detail = JSON.parse(details_json)
                data.cache.unshift({
                  msg,
                  detail
                })
              } catch (err) {}
            })
          })
        )
        temp.state.pulling = false
        if (temp.state.running) {
          setTimeout(puller, 0)
        } else {
          temp.state.resolve()
        }
      } catch (err) {
        setTimeout(puller, 5000)
      }
    }
    puller()
    return hdl as GeneralHandle as CallbackHandle
  } catch (err) {
    return false
  }
}

export async function stop(h: CallbackHandle): Promise<boolean> {
  try {
    const info = handle.get(h) as CallbackInfo | null
    if (!info) {
      return false
    }
    if (!info.temp) {
      return false
    }
    if (!info.temp.state.running) {
      return false
    }
    info.temp.state.running = false
    return new Promise(resolve => {
      info.temp!.state.resolve = () => {
        resolve(true)
      }
    })
  } catch (err) {
    return false
  }
}
