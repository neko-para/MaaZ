import { type DeviceInfo } from '@maaz/maa'
import { reactive } from 'vue'

import { sync } from './storage'

function useDevice() {
  const devices = reactive<DeviceInfo[]>([])

  const _sync = sync('device', devices)

  const reinit = async () => {
    const storedInfo = _sync()
    devices.push(...storedInfo)
  }

  const add = async (cfg: DeviceInfo) => {
    devices.push(cfg)
  }

  return {
    devices,

    reinit,
    add
  }
}

export const device = useDevice()
