import { norm, notify } from '.'

export type GeneralHandle = string
export type Handle<T extends string> = GeneralHandle & { __kind: T }

export interface HandleInfo {
  type: string
  refering: Map<GeneralHandle, number>
  refered: Map<GeneralHandle, number>
}

const data: Record<GeneralHandle, HandleInfo> = {}

export function add(handle: GeneralHandle, type: string) {
  if (handle in data) {
    return false
  } else {
    data[handle] = {
      type,
      refering: new Map(),
      refered: new Map()
    }
    notify.post('HandleIndexUpdate', { handles: [handle] })
  }
}

export function get(handle: GeneralHandle) {
  if (handle in data) {
    return data[handle]
  } else {
    return null
  }
}

export function del(handle: GeneralHandle) {
  if (refered(handle)) {
    return false
  }
  for (const [child, count] of get(handle)!.refering.entries()) {
    delRef(handle, child, count)
  }
  delete data[handle]
  notify.post('HandleIndexUpdate', { handles: [handle] })
  return true
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

export function addRef(parent: GeneralHandle, child: GeneralHandle, count = 1) {
  const pi = get(parent)
  const ci = get(child)
  if (!pi || !ci) {
    return false
  }
  const cnt = pi.refering.get(child) ?? 0
  pi.refering.set(child, cnt + count)
  ci.refered.set(parent, cnt + count)
  notify.post('HandleIndexUpdate', { handles: [parent, child] })
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
  if (cnt === count) {
    pi.refering.delete(child)
    ci.refered.delete(parent)
  } else {
    pi.refering.set(child, cnt - count)
    ci.refered.set(parent, cnt - count)
  }
  notify.post('HandleIndexUpdate', { handles: [parent, child] })
  return true
}

export function serialize() {
  const ret: any = {}
  for (const [k, v] of Object.entries(data)) {
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
    const newData = JSON.parse(from)
    const olds = Object.keys(data)
    for (const k of olds) {
      delete data[k]
    }
    if (olds.length) {
      notify.post('HandleIndexUpdate', { handles: olds })
    }
    for (const [k, v] of Object.entries(newData)) {
      data[k] = {
        type: (v as any).type,
        refering: norm.denormMap((v as any).refering),
        refered: norm.denormMap((v as any).refered)
      }
    }
    if (newData.length) {
      notify.post('HandleIndexUpdate', { handles: Object.keys(data) })
    }
    return true
  } catch (err) {
    console.warn('handle info deserialize failed:', err)
    return false
  }
}
