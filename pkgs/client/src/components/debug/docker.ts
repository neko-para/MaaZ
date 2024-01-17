import { type Component, type ComputedRef, ref, shallowRef } from 'vue'

import DebugCallback from '@/components/debug/DebugCallback.vue'
import DebugResource from '@/components/debug/DebugResource.vue'

import DebugController from './DebugController.vue'
import DebugDevice from './DebugDevice.vue'

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
    add({
      id: '#controller',
      component: DebugController,
      props: {}
    })
    add({
      id: '#device',
      component: DebugDevice,
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

  const moveup = (id: string) => {
    cards.value = [...cards.value.filter(x => x.id === id), ...cards.value.filter(x => x.id !== id)]
  }

  const onShow = (f: () => void) => {
    show = f
  }

  return {
    cards,

    init,
    add,
    del,
    moveup,
    onShow
  }
}

export const docker = useDocker()
