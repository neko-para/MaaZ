import { type Component, type ComputedRef, ref, shallowRef } from 'vue'

import DebugCallback from '@/components/debug/DebugCallback.vue'
import DebugResource from '@/components/debug/DebugResource.vue'

interface CardInfo {
  id: string
  component: Component
  props: any
}

function useDocker() {
  const cards = ref<CardInfo[]>([])
  let show = () => {}

  const init = () => {
    add({
      id: '#callback',
      component: DebugCallback,
      props: {}
    })
    add({
      id: '#resource',
      component: DebugResource,
      props: {}
    })
  }

  const add = (info: CardInfo) => {
    const exist = !!cards.value.find(x => x.id === info.id)
    cards.value = [
      {
        id: info.id,
        component: shallowRef(info.component),
        props: info.props
      },
      ...cards.value.filter(x => x.id !== info.id)
    ]
    show()
    return exist
  }

  const del = (id: string) => {
    cards.value = cards.value.filter(x => x.id !== id)
  }

  const onShow = (f: () => void) => {
    show = f
  }

  return {
    cards,

    init,
    add,
    del,
    onShow
  }
}

export const docker = useDocker()
