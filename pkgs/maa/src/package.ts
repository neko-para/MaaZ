type DiffData = Record<string, Record<string, unknown>>

export type ControllerConfig = {
  start?: string
  stop?: string
  orientation?: 'portrait' | 'landscape'
  long?: number
  short?: number
}

export type ResourceConfig = {
  name: string
  path?: string
  extends?: string
  diff?: DiffData[]
}

type OptionValue = 'boolean' | 'string' | 'number'

export type OptionConfig = {
  name: string
  type: OptionValue
  case?: {
    name: string
    value: OptionValue
  }[]
}

export type TaskConfig = {
  name: string
  task: string
  option?: string[]
  diff?: DiffData[]
}

export type EntryConfig = {
  name: string
  tasks: string[]
  option?: string[]
  diff?: DiffData[]
}

export type PackageConfig = {
  name: string
  id: string
  controller?: ControllerConfig
  resource: Record<string, ResourceConfig>
  option?: Record<string, OptionConfig>
  diff?: DiffData
  task: Record<string, TaskConfig>
  entry: EntryConfig[]
}
