import { type InstanceId } from '@maaz/maa'
import { v4 } from 'uuid'
import { reactive } from 'vue'

import { dockerDelComponent } from '@/components/debug/utils'

import { handle } from './handle'
import { sync } from './storage'

export interface PackInstInfo {
  type: 'packinst'
  used: Record<string, true>
  pack: string
  instid: InstanceId | null
}

function usePackInst() {
  const packinsts = reactive<Record<string, PackInstInfo>>({})

  const _sync = sync('packinst', packinsts)

  const reinit = () => {
    const storedInfo = _sync()
    for (const key in storedInfo) {
      packinsts[key] = storedInfo[key]
      if (packinsts[key].instid && !handle.getInstance(packinsts[key].instid!)) {
        packinsts[key].instid = null
      }
    }
  }

  const create = (pack: string, inst: InstanceId) => {
    const id = v4()
    handle.getInstance(inst).used[id] = true
    packinsts[id] = {
      type: 'packinst',
      used: {},
      pack,
      instid: inst
    }
    return id
  }

  const destroy = (id: string) => {
    const info = packinsts[id]
    dockerDelComponent(id)
    if (info.instid) {
      delete handle.getInstance(info.instid).used[id]
    }
    delete packinsts[id]
  }

  return {
    packinsts,

    reinit,
    create,
    destroy
  }
}

export const packinst = usePackInst()
