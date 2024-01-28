import { api } from '@maaz/schema'
import { createApp } from 'vue'

import App from '@/App.vue'

import './assets/base.css'
import { i18n } from './i18n'
import { callback } from './model/callback'
import { globalConfig } from './model/config'
import { controller } from './model/controller'
import { device } from './model/device'
import { docker } from './model/docker'
import { instance } from './model/instance'
import { pack } from './model/pack'
import { packinst } from './model/packinst'
import { resource } from './model/resource'
import './plugins/monaco'
import router from './plugins/router'
import vuetify from './plugins/vuetify'

async function init() {
  globalConfig.init()
  docker.reinit()
  await api.MaaToolkitInit()
  await callback.reinit()
  await resource.reinit()
  await controller.reinit()
  await instance.reinit()
  await device.reinit()
  pack.reinit()
  packinst.reinit()
}

init()

createApp(App).use(router).use(i18n).use(vuetify).mount('#app')
