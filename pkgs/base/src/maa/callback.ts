export type CallbackItem = {
  msg: string
  detail: unknown
}

export interface CallbackInfo {
  cache: CallbackItem[]
  state: {
    running: boolean
    pulling: boolean
  }
}
