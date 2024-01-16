import { type Component, watch } from 'vue'

import { handle } from '@/model/handle'
import { docker } from '@/stores/docker'

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
