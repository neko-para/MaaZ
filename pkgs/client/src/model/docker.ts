import { ref, watch } from 'vue'

import DebugCallback from '@/components/debug/DebugCallback.vue'
import DebugCallbackDetail from '@/components/debug/DebugCallbackDetail.vue'
import DebugController from '@/components/debug/DebugController.vue'
import DebugControllerDetail from '@/components/debug/DebugControllerDetail.vue'
import DebugDevice from '@/components/debug/DebugDevice.vue'
import DebugResource from '@/components/debug/DebugResource.vue'
import DebugResourceDetail from '@/components/debug/DebugResourceDetail.vue'

export const dockerComponentIndex = {
  DebugCallback,
  DebugCallbackDetail,
  DebugResource,
  DebugResourceDetail,
  DebugController,
  DebugControllerDetail,
  DebugDevice
} as const

export type DockerComponent = keyof typeof dockerComponentIndex

interface CardInfo {
  id: string
  component: DockerComponent
  props: any
}

function useDocker() {
  const cards = ref<CardInfo[]>([])
  let show = () => {}

  watch(
    cards,
    v => {
      localStorage.setItem('docker', JSON.stringify(v))
    },
    {
      deep: true
    }
  )

  const init = () => {
    const cds = JSON.parse(localStorage.getItem('docker') ?? '[]')
    cards.value = cds

    add(
      {
        id: '#callback',
        component: 'DebugCallback',
        props: {}
      },
      false
    )
    add(
      {
        id: '#resource',
        component: 'DebugResource',
        props: {}
      },
      false
    )
    add(
      {
        id: '#controller',
        component: 'DebugController',
        props: {}
      },
      false
    )
    add(
      {
        id: '#device',
        component: 'DebugDevice',
        props: {}
      },
      false
    )
  }

  const add = (info: CardInfo, top = true) => {
    const exist = !!cards.value.find(x => x.id === info.id)
    if (top) {
      cards.value = [
        {
          ...info
        },
        ...cards.value.filter(x => x.id !== info.id)
      ]
    } else {
      cards.value = cards.value.map(x => {
        if (x.id === info.id) {
          return {
            ...info
          }
        } else {
          return x
        }
      })
    }
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
