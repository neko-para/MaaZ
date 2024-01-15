import { createApp } from 'vue'

import App from '@/App.vue'

import './assets/base.css'
import { i18n } from './i18n'
import router from './plugins/router'
import vuetify from './plugins/vuetify'

// const meta = document.createElement('meta')
// meta.name = 'naive-ui-style'
// document.head.appendChild(meta)

createApp(App).use(router).use(i18n).use(vuetify).mount('#app')
