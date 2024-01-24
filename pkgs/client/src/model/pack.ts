import type { PackageConfig } from '@maaz/maa'
import { reactive } from 'vue'

import { sync } from './storage'

export type PackInfo = {
  type: 'pack'
  root: string
  config: PackageConfig
}

function usePack() {
  const packs = reactive<PackInfo[]>([])

  const _sync = sync('pack', packs)

  const reinit = () => {
    packs.push(..._sync())
  }

  const add = (root: string, config: PackageConfig) => {
    packs.push({
      type: 'pack',
      root,
      config
    })
  }

  const del = (id: string) => {
    const idx = packs.findIndex(p => p.config.id === id)
    if (idx !== -1) {
      packs.splice(idx, 1)
    }
  }

  const get = (id: string) => {
    return packs.find(p => p.config.id === id) ?? null
  }

  return {
    packs,

    reinit,
    add,
    del,
    get
  }
}

export const pack = usePack()
