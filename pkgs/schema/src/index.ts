import { version } from 'os'

import type { IApi } from './schema-api/interface-api'
import { requestApi } from './schema-api/request-api'

type FilterApi<K extends string> = K extends `/api/${infer name}` ? name : never
type ApiRoutes = FilterApi<keyof IApi>
type GetApi<k extends ApiRoutes> = `/api/${k}` extends keyof IApi ? IApi[`/api/${k}`] : never
type NotUndefined<T> = T extends undefined ? never : T

let baseURL = 'http://127.0.0.1:9876'

function makeApiHelper(): {
  [route in ApiRoutes]: unknown extends GetApi<route>['Body']
    ? () => Promise<NotUndefined<GetApi<route>['Response']['data']>>
    : (data: GetApi<route>['Body']) => Promise<NotUndefined<GetApi<route>['Response']['data']>>
} {
  return new Proxy(
    {},
    {
      get(_, key: string) {
        return async (data: any) => {
          const res = await (requestApi as any)[`/api/${key}`]({
            baseURL,
            data
          })
          if ('error' in res) {
            throw res.error
          } else {
            return res.data
          }
        }
      }
    }
  ) as any
}

export function setBaseURL(url: string) {
  baseURL = url
}

export function getBaseURL(url: string) {
  return baseURL
}

export const api = makeApiHelper()
