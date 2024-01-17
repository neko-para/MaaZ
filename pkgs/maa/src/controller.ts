import { api, opaque } from '@maaz/schema'

import type { APICallbackId, AdbType, Status } from '.'

export type ControllerId = string & { __kind: 'MaaControllerAPI' }
export type ControllerActionId = number & { __kind: 'MaaResourceActionId' }

export interface AdbConfig {
  adb_path: string
  address: string
  type: AdbType
  config: string
}

async function dump() {
  return await opaque.MaaControllerAPI()
}

async function createAdb(cfg: AdbConfig, agent_path: string, callback: APICallbackId) {
  return (
    await api.MaaAdbControllerCreateV2({
      ...cfg,
      agent_path,
      callback
    })
  ).return as ControllerId
}

async function destroy(ctrl: ControllerId) {
  await api.MaaControllerDestroy({ ctrl })
}

async function postConnection(ctrl: ControllerId) {
  return (await api.MaaControllerPostConnection({ ctrl })).return as ControllerActionId
}

async function status(ctrl: ControllerId, id: ControllerActionId) {
  return (await api.MaaControllerStatus({ ctrl, id })).return as Status
}

async function wait(ctrl: ControllerId, id: ControllerActionId) {
  return (await api.MaaControllerWait({ ctrl, id })).return as Status
}

async function connected(ctrl: ControllerId) {
  return (await api.MaaControllerConnected({ ctrl })).return > 0
}

async function uuid(ctrl: ControllerId) {
  const ret = await api.MaaControllerGetUUID({ ctrl })
  if (ret.return > 0) {
    return ret.buffer
  } else {
    return null
  }
}

export const $controller = {
  dump,

  createAdb,
  destroy,
  postConnection,
  status,
  wait,
  connected,
  uuid
}
