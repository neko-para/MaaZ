import { ApiServerError, api } from '@maaz/schema'
import { ref } from 'vue'

function useService() {
  const version = ref<string | null>(null)

  const connect = async () => {
    const { return: ver } = await api.MaaVersion()
    if (ver.length === 40) {
      version.value = ver.slice(0, 8)
    } else {
      version.value = ver
    }
  }

  const disconnect = () => {
    version.value = null
  }

  return {
    version,
    connect,
    disconnect
  }
}

export const service = useService()
