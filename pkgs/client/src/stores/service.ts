import { api } from '@maaz/schema'
import { ref } from 'vue'

function useService() {
  const version = ref<string | null>(null)
  const connecting = ref(false)

  setInterval(() => {
    connect()
  }, 30 * 1000)

  const connect = async () => {
    connecting.value = true
    try {
      const { return: ver } = await api.MaaVersion()
      if (ver.length === 40) {
        version.value = ver.slice(0, 8)
      } else {
        version.value = ver
      }
    } catch (_) {}
    connecting.value = false
  }

  const disconnect = () => {
    version.value = null
  }

  return {
    version,
    connecting,
    connect,
    disconnect
  }
}

export const service = useService()
