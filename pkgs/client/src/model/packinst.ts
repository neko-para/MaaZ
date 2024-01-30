import {
  $controller,
  type ControllerId,
  ControllerOption,
  type InstanceId,
  type ResourceId
} from '@maaz/maa'
import { v4 } from 'uuid'
import { reactive } from 'vue'

import { service } from '@/components/debug/service'
import { dockerDelComponent } from '@/components/debug/utils'

import { controller } from './controller'
import { handle } from './handle'
import { instance } from './instance'
import { pack } from './pack'
import { resource } from './resource'
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

  const create = (pack: string, inst: InstanceId | null = null) => {
    const id = v4()
    if (inst) {
      handle.getInstance(inst).used[id] = true
    }
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

  const setup = async (id: string) => {
    const info = packinsts[id]
    if (info.instid) {
      return true
    }

    const pak = pack.get(id)
    if (!pak) {
      return false
    }
    const res = (await service['#resource'].create()) as ResourceId | null
    if (!res) {
      return false
    }
    const ctrl = (await service['#controller'].create()) as ControllerId | null
    if (!ctrl) {
      await resource.destroy(res)
      return false
    }
    const inst = (await service['#instance'].create()) as InstanceId | null
    if (!inst) {
      await resource.destroy(res)
      await controller.destroy(ctrl)
      return false
    }
    await instance.bindRes(inst, res)
    await instance.bindCtrl(inst, ctrl)

    if (pak.config.controller) {
      const ci = pak.config.controller
      if (ci.start) {
        await $controller.setOptionS(ctrl, ControllerOption.DefaultAppPackageEntry, ci.start)
      }
      if (ci.stop) {
        await $controller.setOptionS(ctrl, ControllerOption.DefaultAppPackage, ci.stop)
      }
      if (ci.long) {
        await $controller.setOptionI(ctrl, ControllerOption.ScreenshotTargetLongSide, ci.long)
      }
      if (ci.short) {
        await $controller.setOptionI(ctrl, ControllerOption.ScreenshotTargetLongSide, ci.short)
      }
    }
    const connAct = await $controller.postConnection(ctrl)
    await $controller.wait(ctrl, connAct)

    handle.getInstance(inst).used[id] = true
    info.instid = inst

    return true
  }

  return {
    packinsts,

    reinit,
    create,
    destroy,
    setup
  }
}

export const packinst = usePackInst()
