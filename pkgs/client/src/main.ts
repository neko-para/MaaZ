import { createApp } from 'vue'

import App from '@/App.vue'

import './assets/base.css'
import { i18n } from './i18n'
import { callback } from './model/callback'
import { resource } from './model/resource'
import router from './plugins/router'
import vuetify from './plugins/vuetify'

// const meta = document.createElement('meta')
// meta.name = 'naive-ui-style'
// document.head.appendChild(meta)

callback.reinit()
resource.reinit()

createApp(App).use(router).use(i18n).use(vuetify).mount('#app')
