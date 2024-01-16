import { callback as _callback } from '@maaz/schema'

const cb = _callback.MaaAPICallback

export type APICallbackId = string & { __kind: 'MaaAPICallback' }
export type APICallback = (msg: string, details_json: string) => Promise<void>

async function add() {
  return (await cb.add()).id as APICallbackId
}

async function del(id: APICallbackId) {
  await cb.del({ id })
}

async function dump() {
  return (await cb.dump()).ids
}

async function pull(id: APICallbackId) {
  return (await cb.pull({ id })).ids
}

async function request(
  id: APICallbackId,
  cid: string
): Promise<[msg: string, details_json: string]> {
  const arg = await cb.request({ id, cid })
  return [arg.msg, arg.details_json]
}

async function response(id: APICallbackId, cid: string) {
  await cb.response({ id, cid })
}

async function process(id: APICallbackId, cid: string, func: APICallback) {
  const arg = await request(id, cid)
  await func(...arg)
  await response(id, cid)
}

export const callback = {
  add,
  del,
  dump,
  pull,
  request,
  response,
  process
}
