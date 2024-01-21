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

  return {
    packs,

    reinit
  }
}

export const pack = usePack()
