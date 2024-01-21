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

  return {
    packs,

    reinit,
    add
  }
}

export const pack = usePack()
