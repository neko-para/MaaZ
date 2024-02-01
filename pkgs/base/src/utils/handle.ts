import { norm, notify, postpone } from '.'

export type GeneralHandle = string
export type Handle<T extends string> = GeneralHandle & { __kind: T }

export interface HandleInfo<Data = unknown, Temp = unknown> {
  type: string
  refering: Map<GeneralHandle, number>
  refered: Map<GeneralHandle, number>
  data?: Data

  invalid?: boolean
  temp?: Temp
}

interface HandleInfoNorm {
  type: string
  refering: Record<string, number>
  refered: Record<string, number>
  data?: unknown
}

const infos: Record<GeneralHandle, HandleInfo> = {}

let notifyCounter = 0

function pushNotify() {
  notifyCounter += 1
}

function popNotify() {
  notifyCounter -= 1
  if (notifyCounter === 0) {
    notify.post('HandleIndexUpdate', {})
  }
}

export const triggerNotify = postpone(pushNotify, popNotify)

export function add(handle: GeneralHandle, type: string, data?: unknown): HandleInfo | null {
  if (handle in infos) {
    return null
  }
  using _ = triggerNotify()
  infos[handle] = {
    type,
    refering: new Map(),
    refered: new Map(),
    data
  }
  return infos[handle]
}

export function get(handle: GeneralHandle) {
  if (handle in infos) {
    return infos[handle]
  } else {
    return null
  }
}

export function del(handle: GeneralHandle) {
  if (refered(handle)) {
    return false
  }
  using _ = triggerNotify()
  isolate(handle)
  delete infos[handle]
  return true
}

export function find(pred: (info: HandleInfo, handle: GeneralHandle) => boolean): GeneralHandle[] {
  return Object.entries(infos)
    .filter(([handle, info]) => pred(info, handle))
    .map(([handle]) => handle)
}

export function findType<T extends string>(type: T): Handle<T>[] {
  return find(info => info.type === type) as Handle<T>[]
}

export function type(handle: GeneralHandle) {
  return get(handle)?.type ?? null
}

export function cast<T extends string>(handle: GeneralHandle, as: T) {
  if (type(handle) === as) {
    return handle as Handle<T>
  } else {
    return null
  }
}

export function refering(handle: GeneralHandle) {
  return (get(handle)?.refering.size ?? 0) > 0
}

export function refered(handle: GeneralHandle) {
  return (get(handle)?.refered.size ?? 0) > 0
}

export function invalid(handle: GeneralHandle, invalidChild = false) {
  const info = get(handle)
  if (!info) {
    return
  }
  using _ = triggerNotify()
  info.invalid = true
  for (const parent of info.refered.keys()) {
    invalid(parent)
  }
  if (invalidChild) {
    for (const child of info.refering.keys()) {
      invalid(child)
    }
  }
}

export function isolate(handle: GeneralHandle) {
  const info = get(handle)
  if (!info) {
    return
  }
  using _ = triggerNotify()
  for (const [parent, count] of get(handle)!.refered.entries()) {
    delRef(parent, handle, count)
  }
  for (const [child, count] of get(handle)!.refering.entries()) {
    delRef(handle, child, count)
  }
}

export function clearInvalid() {
  using _ = triggerNotify()
  for (const handle in infos) {
    if (get(handle)?.invalid) {
      del(handle)
    }
  }
}

export function addRef(parent: GeneralHandle, child: GeneralHandle, count = 1) {
  const pi = get(parent)
  const ci = get(child)
  if (!pi || !ci) {
    return false
  }
  using _ = triggerNotify()
  const cnt = pi.refering.get(child) ?? 0
  pi.refering.set(child, cnt + count)
  ci.refered.set(parent, cnt + count)
  return true
}

export function delRef(parent: GeneralHandle, child: GeneralHandle, count = 1) {
  const pi = get(parent)
  const ci = get(child)
  if (!pi || !ci) {
    return false
  }
  if (!pi.refering.has(child) || !ci.refered.has(parent)) {
    return false
  }
  const cnt = pi.refering.get(child)!
  if (cnt < count) {
    return false
  }
  using _ = triggerNotify()
  if (cnt === count) {
    pi.refering.delete(child)
    ci.refered.delete(parent)
  } else {
    pi.refering.set(child, cnt - count)
    ci.refered.set(parent, cnt - count)
  }
  return true
}

export function serialize() {
  const ret: any = {}
  for (const [k, v] of Object.entries(infos)) {
    ret[k] = {
      type: v.type,
      refering: norm.normMap(v.refering),
      refered: norm.normMap(v.refered)
    }
  }
  return JSON.stringify(ret)
}

export function deserialize(from: string) {
  try {
    const newData = JSON.parse(from) as Record<string, HandleInfoNorm>

    {
      using _ = triggerNotify()
      const olds = Object.keys(infos)
      for (const k of olds) {
        delete infos[k]
      }
    }

    {
      using _ = triggerNotify()
      for (const [k, v] of Object.entries(newData)) {
        infos[k] = {
          type: v.type,
          refering: norm.denormMap(v.refering),
          refered: norm.denormMap(v.refered)
        }
        if ('data' in v) {
          infos[k].data = v.data
        }
      }
    }
    return true
  } catch (err) {
    console.warn('handle info deserialize failed:', err)
    return false
  }
}
