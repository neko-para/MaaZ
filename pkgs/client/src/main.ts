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
import { resource } from './model/resource'
import './plugins/monaco'
import router from './plugins/router'
import vuetify from './plugins/vuetify'

api.MaaToolkitInit()

globalConfig.init()
docker.reinit()
callback.reinit()
resource.reinit()
controller.reinit()
instance.reinit()
pack.reinit()
device.reinit()

createApp(App).use(router).use(i18n).use(vuetify).mount('#app')
