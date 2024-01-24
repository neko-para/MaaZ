import { type RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'

import DebugDocker from '@/components/debug/DebugDocker.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/debug'
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
