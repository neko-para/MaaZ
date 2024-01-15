import { type RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'

import DebugCallbackPage from '@/views/debug/DebugCallbackPage.vue'
import DebugResourcePage from '@/views/debug/DebugResourcePage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/debug/callback',
    component: DebugCallbackPage
  },
  {
    path: '/debug/resource',
    component: DebugResourcePage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
