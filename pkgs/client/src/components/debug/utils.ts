import { type Component, watch } from 'vue'

import { docker } from '@/components/debug/docker'
import { handle } from '@/model/handle'

export function dockerAddComponent(id: string, component: Component) {
  if (
    !docker.add({
      id,
      component,
      props: {
        id
      }
    })
  ) {
    watch(
      handle.contain(id),
      () => {
        docker.del(id)
      },
      {
        once: true
      }
    )
  }
}
