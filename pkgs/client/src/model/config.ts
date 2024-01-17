import { reactive, watch } from 'vue'

export interface GlobalConfig {
  agent_path?: string
}

function useGlobalConfig() {
  const config = reactive<GlobalConfig>({})

  watch(
    config,
    v => {
      localStorage.setItem('config', JSON.stringify(v))
    },
    {
      deep: true
    }
  )

  const init = () => {
    const cfg = JSON.parse(localStorage.getItem('config') ?? '{}')
    Object.assign(config, cfg)
  }

  return {
    config,

    init
  }
}

export const globalConfig = useGlobalConfig()
