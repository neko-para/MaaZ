import { $callback } from '@maaz/maa'

import { handle } from '../utils'

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
  }
}

export async function sync() {
  try {
    const remoteIds = (await $callback.dump()) as CallbackHandle[]
    const localIds = handle.findType(CallbackType)
  } catch (err) {
    return false
  }
}
