import { api } from '@maaz/schema'
import { createApp } from 'vue'

import App from '@/App.vue'

import './assets/base.css'
import { i18n } from './i18n'
import { callback } from './model/callback'
import { globalConfig } from './model/config'
import { controller } from './model/controller'
import { instance } from './model/instance'
import { resource } from './model/resource'
import hljsPlugin from './plugins/highlightjs'
import router from './plugins/router'
import vuetify from './plugins/vuetify'

api.MaaToolkitInit()

globalConfig.init()
callback.reinit()
resource.reinit()
controller.reinit()
instance.reinit()

createApp(App).use(router).use(i18n).use(vuetify).use(hljsPlugin).mount('#app')
