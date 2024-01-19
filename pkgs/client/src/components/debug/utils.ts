import { type DockerComponent, docker } from '@/model/docker'

export function dockerAddComponent(id: string, component: DockerComponent) {
  docker.add({
    id,
    component,
    props: {
      id
    }
  })
}

export function dockerDelComponent(id: string) {
  docker.del(id)
}

type UpdateFunc = () => Promise<void>
const updateCache: Record<string, UpdateFunc[]> = {}
export function registerUpdate(type: string, func: UpdateFunc) {
  updateCache[type] = updateCache[type] ?? []
  updateCache[type].push(func)
}

export function unregisterUpdate(type: string, func: UpdateFunc) {
  updateCache[type] = updateCache[type]?.filter(f => f !== func) ?? []
}

export function triggerUpdate(type: string) {
  return Promise.all(updateCache[type]?.map(f => f()))
}
