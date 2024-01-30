export type GeneralHandle = string
export type Handle<T extends string> = GeneralHandle & { __kind: T }

export interface HandleInfo {
  type: string
  refering: Map<GeneralHandle, number>
  refered: Map<GeneralHandle, number>
}
