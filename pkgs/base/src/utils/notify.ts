import type { GeneralHandle } from './handle'

export type NotifyEventArg = {
  HandleIndexUpdate: {}
}

export type NotifyEvent = keyof NotifyEventArg

export type NotifyListener = <T extends NotifyEvent>(event: T, arg: NotifyEventArg[T]) => void

const data: Partial<Record<NotifyEvent, NotifyListener[]>> = {}

export function register(event: NotifyEvent, listener: NotifyListener): NotifyListener {
  data[event] = [...(data[event] ?? []), listener]
  return listener
}

export function unregister(event: NotifyEvent, listener: NotifyListener) {
  data[event] = data[event]?.filter(f => f !== listener) ?? []
}

export function post<T extends NotifyEvent>(
  event: T,
  arg: NotifyEventArg[T],
  type: 'sync' | 'async' | 'concur' = 'sync'
) {
  switch (type) {
    case 'sync':
      for (const f of data[event] ?? []) {
        f(event, arg)
      }
      break
    case 'async':
      setTimeout(() => {
        for (const f of data[event] ?? []) {
          f(event, arg)
        }
      }, 0)
      break
    case 'concur':
      for (const f of data[event] ?? []) {
        setTimeout(() => {
          f(event, arg)
        }, 0)
      }
      break
  }
}
