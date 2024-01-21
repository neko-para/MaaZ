import { watch } from 'vue'

export function sync<T extends Record<string, unknown> | unknown[]>(key: string, data: T): () => T {
  watch(
    data,
    v => {
      console.log('update', key, v)
      localStorage.setItem(key, JSON.stringify(v))
    },
    {
      deep: true
    }
  )

  return () => {
    if (Array.isArray(data)) {
      try {
        return JSON.parse(localStorage.getItem(key) ?? '[]')
      } catch (_) {
        return []
      }
    } else {
      try {
        return JSON.parse(localStorage.getItem(key) ?? '{}')
      } catch (_) {
        return {}
      }
    }
  }
}
