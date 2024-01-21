import { type RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'

import DebugDocker from '@/components/debug/DebugDocker.vue'
import PackPackage from '@/components/pack/PackPackage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/debug'
  },
  {
    path: '/pack',
    component: PackPackage
  },
  {
    path: '/debug',
    component: DebugDocker
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
